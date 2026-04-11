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

const validMoods = ["tired", "stressed", "annoyed", "curious"]

export async function POST(req) {
  try {
    const { text, mood } = await req.json()

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }
    if (!mood || !validMoods.includes(mood)) {
      return NextResponse.json({ error: "Invalid mood" }, { status: 400 })
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const message = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 1000,
      system: flashcardPrompts[mood],
      messages: [{ role: "user", content: text }]
    })

    const raw = message.content[0].text
    const cleaned = raw.replace(/```json|```/g, "").trim()
    const flashcards = JSON.parse(cleaned)

    if (!Array.isArray(flashcards)) {
      return NextResponse.json({ error: "Invalid flashcard format" }, { status: 500 })
    }

    return NextResponse.json({ flashcards })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}