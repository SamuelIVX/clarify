import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const flashcardPrompts = {
  tired: `Create 5 simple flashcards from this content. 
          Keep questions and answers super short.
          Return ONLY a raw JSON array like this, no explanation, no markdown, no backticks:
          [{"question": "...", "answer": "..."}]`,

  stressed: `Create 3 flashcards covering only the most critical points.
             Return ONLY a raw JSON array like this, no explanation, no markdown, no backticks:
             [{"question": "...", "answer": "..."}]`,

  annoyed: `Create 5 flashcards. Be blunt and short.
            Return ONLY a raw JSON array like this, no explanation, no markdown, no backticks:
            [{"question": "...", "answer": "..."}]`,

  curious: `Create 10 detailed flashcards covering everything deeply.
            Return ONLY a raw JSON array like this, no explanation, no markdown, no backticks:
            [{"question": "...", "answer": "..."}]`
}

export async function POST(req) {
  try {
    const { text, mood } = await req.json()

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const message = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 1000,
      system: flashcardPrompts[mood],
      messages: [{ role: "user", content: text }]
    })

    const raw = message.content[0].text
    const jsonMatch = raw.match(/\[[\s\S]*\]/)
    if (!jsonMatch) throw new Error("AI response did not contain a valid JSON array")
    const flashcards = JSON.parse(jsonMatch[0])
    return NextResponse.json({ flashcards })
  } catch (error) {
    console.error('[/api/flashcards] request failed', {
      name: error?.name,
      code: error?.code,
      status: error?.status,
    })
  }
}