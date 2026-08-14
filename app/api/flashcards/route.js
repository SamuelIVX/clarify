/**
 * POST /api/flashcards — generates a mood-tuned flashcard set from pasted
 * document text. Mood is allowlisted; untrusted content is wrapped in
 * <document> tags with an isolation instruction and XML-escaped to reduce
 * delimiter-breakout and prompt-injection risk (LLM01 hardening). Output is
 * received via forced Anthropic tool use (emit_flashcards) and validated
 * fail-closed. SECURITY: requires ANTHROPIC_API_KEY in env.
 */
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { escapeXml } from '../../../lib/escapeXml'
import {
  flashcardPrompts,
  SYSTEM_INSTRUCTION_DOCUMENT,
  MAX_DOCUMENT_CHARS,
  MODELS,
  emitFlashcardsTool,
  readToolUse,
} from '../../../lib/prompts'

/**
 * Handles mood-based flashcard generation.
 * @param {Request} req - Body: { text: string, mood:
 *   'tired'|'stressed'|'annoyed'|'curious' }.
 * @returns {Promise<NextResponse>} { flashcards: Array<{ question, answer }> }
 *   or an error JSON with status 400/500.
 * @throws Extracts the emit_flashcards tool_use block, parses its input, and
 *   throws if no block is present, the array is empty, or any card has an
 *   invalid shape.
 */
export async function POST(req) {
  try {
    const { text, mood } = await req.json()

    if (typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: 'text must be a non-empty string.' }, { status: 400 })
    }
    if (!Object.prototype.hasOwnProperty.call(flashcardPrompts, mood)) {
      return NextResponse.json({ error: 'Invalid mood.' }, { status: 400 })
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const message = await client.messages.create({
      model: MODELS.opus,
      max_tokens: 1000,
      system: `${flashcardPrompts[mood]}\n\n${SYSTEM_INSTRUCTION_DOCUMENT}`,
      messages: [{ role: "user", content: `<document>${escapeXml(text.slice(0, MAX_DOCUMENT_CHARS))}</document>` }],
      tools: [emitFlashcardsTool],
      tool_choice: { type: "tool", name: "emit_flashcards" },
    })

    const toolInput = readToolUse(message, emitFlashcardsTool.name)
    const flashcards = toolInput?.flashcards
    if (!Array.isArray(flashcards) || flashcards.length === 0) throw new Error("AI response did not contain a valid JSON array")
    if (!flashcards.every(card =>
      card && typeof card === 'object' &&
      typeof card.question === 'string' && card.question.trim().length > 0 &&
      typeof card.answer === 'string' && card.answer.trim().length > 0
    )) throw new Error("AI response flashcards must have non-empty string question and answer")
    return NextResponse.json({ flashcards })
  } catch (error) {
    console.error('[/api/flashcards] request failed', {
      name: error?.name,
      code: error?.code,
      status: error?.status,
    })
    return NextResponse.json({ error: 'Failed to generate flashcards.' }, { status: 500 })
  }
}
