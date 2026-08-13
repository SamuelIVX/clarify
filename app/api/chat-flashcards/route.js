/**
 * POST /api/chat-flashcards — conversational flashcard generation via the
 * chat-flashcards flow. Sanitizes client messages to the `user` role only
 * (blocks forged system/assistant turns), caps length/count, and parses the
 * `---FLASHCARDS---` delimiter convention. SECURITY: requires
 * ANTHROPIC_API_KEY in env; only sanitized user-role messages are forwarded,
 * up to MAX_MESSAGES.
 */
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT = `You are a flashcard generation assistant. Help users create study flashcards on any topic through natural conversation.

Your flow:
1. When the user describes a topic, you may ask ONE clarifying question (e.g. depth/level, specific focus) if needed.
2. Otherwise, generate flashcards right away based on what the user tells you.
3. If the user asks for changes (more cards, simpler, different focus), regenerate the full set.

When generating flashcards, write a brief friendly message first, then output the cards using this exact format on a new line:

---FLASHCARDS---
[{"question": "...", "answer": "..."}, ...]

Rules:
- The JSON must be a valid array on a single line immediately after the delimiter
- Default to 8 flashcards unless the user specifies a number
- Questions should be clear and specific
- Answers should be accurate and concise (1-3 sentences)
- Cover a good spread of the topic — don't cluster around one sub-topic`

const ALLOWED_ROLES = new Set(['user'])
const MAX_MESSAGES = 30

/**
 * Drops any message that isn't a non-empty user-role object with string content
 * (≤8000 chars) and keeps only the most recent MAX_MESSAGES. Guards against
 * injected system/assistant turns and oversized or malformed payloads.
 * @param {Array<{ role: string, content: string }>} messages - Raw client
 *   message objects.
 * @returns {Array<{ role: 'user', content: string }>} Sanitized user-message
 *   objects.
 */
function sanitizeMessages(messages) {
  return messages
    .filter(m =>
      m && typeof m === 'object' &&
      ALLOWED_ROLES.has(m.role) &&
      typeof m.content === 'string' &&
      m.content.trim().length > 0 &&
      m.content.length <= 8000
    )
    .slice(-MAX_MESSAGES)
    .map(m => ({ role: m.role, content: m.content }))
}

/**
 * Handles the chat-based flashcard flow.
 * @param {Request} req - Body: { messages: Array }.
 * @returns {Promise<NextResponse>} { message, flashcards|null } or an error
 *   JSON with status 400/500.
 */
export async function POST(req) {
  try {
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'A message is required.' }, { status: 400 })
    }

    const cleanMessages = sanitizeMessages(messages)
    if (cleanMessages.length === 0) {
      return NextResponse.json({ error: 'A message is required.' }, { status: 400 })
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: cleanMessages,
    })

    const content = response.content[0].text
    const delimiterIndex = content.indexOf('---FLASHCARDS---')

    if (delimiterIndex !== -1) {
      const message = content.slice(0, delimiterIndex).trim()
      const afterDelimiter = content.slice(delimiterIndex + '---FLASHCARDS---'.length).trim()
      const jsonMatch = afterDelimiter.match(/\[[\s\S]*\]/)

      if (jsonMatch) {
        const flashcards = JSON.parse(jsonMatch[0])
        return NextResponse.json({ message, flashcards })
      }
    }

    return NextResponse.json({ message: content, flashcards: null })
  } catch (error) {
    console.error('[/api/chat-flashcards] request failed', {
      name: error?.name,
      code: error?.code,
      status: error?.status,
    })
    return NextResponse.json({ error: 'Failed to process message.' }, { status: 500 })
  }
}
