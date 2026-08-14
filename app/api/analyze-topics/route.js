/**
 * POST /api/analyze-topics — identifies weak topic areas from flashcards a
 * student got wrong. Wraps untrusted card content in <flashcards> tags with an
 * isolation instruction (LLM01 hardening). Output is received via forced
 * Anthropic tool use (emit_topics) and validated fail-closed. SECURITY:
 * requires ANTHROPIC_API_KEY in env; never logs or returns the submitted
 * flashcards.
 */
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { escapeXml } from '../../../lib/escapeXml'
import {
  TOPICS_SYSTEM_PROMPT,
  SYSTEM_INSTRUCTION_FLASHCARDS,
  MAX_CARDS,
  MAX_CARD_CHARS,
  MODELS,
  emitTopicsTool,
  readToolUse,
} from '../../../lib/prompts'

/**
 * Handles flashcard-topic analysis. Validates the payload, calls the cheap
 * Haiku model, and fail-closes on malformed output.
 * @param {Request} req - Body: { flashcards: Array<{ question, answer }> }.
 * @returns {Promise<NextResponse>} { topics: string[] } (3-5 items) or an
 *   error JSON with status 400/500.
 * @throws Extracts the emit_topics tool_use block, parses its input, and
 *   throws if no block is present, the array is empty, or any item is not a
 *   non-empty string, or the count is outside 3-5.
 * @example
 * // POST { flashcards: [{ question: "Q", answer: "A" }] } → { topics: [...] }
 */
export async function POST(req) {
  try {
    const { flashcards } = await req.json()
    if (!Array.isArray(flashcards) || flashcards.length === 0) {
      return NextResponse.json({ error: 'flashcards must be a non-empty array' }, { status: 400 })
    }
    if (flashcards.length > MAX_CARDS) {
      return NextResponse.json({ error: `flashcards must have at most ${MAX_CARDS} cards` }, { status: 400 })
    }
    if (!flashcards.every(card =>
      card && typeof card === 'object' &&
      typeof card.question === 'string' &&
      typeof card.answer === 'string'
    )) {
      return NextResponse.json({ error: 'each flashcard must have string question and answer' }, { status: 400 })
    }
    if (!flashcards.every(card => card.question.length <= MAX_CARD_CHARS && card.answer.length <= MAX_CARD_CHARS)) {
      return NextResponse.json({ error: `flashcard question and answer must be at most ${MAX_CARD_CHARS} characters` }, { status: 400 })
    }

    const questionsAndAnswers = flashcards
      .map(card => `Q: ${escapeXml(card.question)}\nA: ${escapeXml(card.answer)}`)
      .join('\n\n')

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const message = await client.messages.create({
      model: MODELS.haiku,
      max_tokens: 512,
      system: `${TOPICS_SYSTEM_PROMPT}\n\n${SYSTEM_INSTRUCTION_FLASHCARDS}`,
      messages: [{ role: 'user', content: `<flashcards>\n${questionsAndAnswers}\n</flashcards>` }],
      tools: [emitTopicsTool],
      tool_choice: { type: 'tool', name: 'emit_topics' },
    })

    const toolInput = readToolUse(message, emitTopicsTool.name)
    const topics = toolInput?.topics
    if (!Array.isArray(topics) || !topics.every(t => typeof t === 'string' && t.trim().length > 0)) {
      throw new Error('AI response was not an array of non-empty strings')
    }
    if (topics.length < 3 || topics.length > 5) {
      throw new Error('AI response must contain 3-5 topics')
    }
    return NextResponse.json({ topics })
  } catch (error) {
    console.error('[/api/analyze-topics] request failed', {
      name: error?.name,
      code: error?.code,
      status: error?.status,
    })
    return NextResponse.json({ error: 'Failed to analyze topics.' }, { status: 500 })
  }
}
