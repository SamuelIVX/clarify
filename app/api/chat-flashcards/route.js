/**
 * POST /api/chat-flashcards — conversational flashcard generation via the
 * chat-flashcards flow. Sanitizes client messages to the `user` role only
 * (blocks forged system/assistant turns), caps length/count, and derives the
 * reply from Anthropic tool use: the friendly message comes from text blocks,
 * flashcards come from an emit_flashcards tool_use block if the model produced
 * one. SECURITY: requires ANTHROPIC_API_KEY in env; only sanitized user-role
 * messages are forwarded, up to MAX_MESSAGES.
 */
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import {
  CHAT_SYSTEM_PROMPT,
  ALLOWED_ROLES,
  MAX_MESSAGES,
  MODELS,
  emitFlashcardsTool,
} from '../../../lib/prompts'

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
      model: MODELS.opus,
      max_tokens: 2000,
      system: CHAT_SYSTEM_PROMPT,
      messages: cleanMessages,
      tools: [emitFlashcardsTool],
    })

    const textBlocks = response.content.filter(b => b.type === 'text')
    const message = textBlocks.map(b => b.text).join('\n').trim()

    const toolBlock = response.content.find(b => b.type === 'tool_use' && b.name === emitFlashcardsTool.name)
    let flashcards = null
    if (toolBlock) {
      const cards = toolBlock.input?.flashcards
      if (!Array.isArray(cards) || cards.length === 0 || !cards.every(card =>
        card && typeof card === 'object' &&
        typeof card.question === 'string' && card.question.trim().length > 0 &&
        typeof card.answer === 'string' && card.answer.trim().length > 0
      )) throw new Error("AI response flashcards must be a non-empty array of cards with non-empty string question and answer")
      flashcards = cards
    }

    return NextResponse.json({ message, flashcards })
  } catch (error) {
    console.error('[/api/chat-flashcards] request failed', {
      name: error?.name,
      code: error?.code,
      status: error?.status,
    })
    return NextResponse.json({ error: 'Failed to process message.' }, { status: 500 })
  }
}
