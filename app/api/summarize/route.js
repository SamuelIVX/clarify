import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const moodPrompts = {
  tired: `Summarize the provided document in max 5 bullet points.
          Each bullet under 10 words.
          Add one funny analogy at the end.`,

  stressed: `Summarize the provided document. Give ONLY the 3 most important points.
             Number them. Nothing else. Be calm.`,

  annoyed: `Summarize the provided document. Be blunt. No fluff. No intro. No outro.
            Only the essential points in the fewest words possible.`,

  curious: `Summarize the provided document with thorough coverage of key insights,
            interesting details, and real world context.`
}

export async function POST(req) {
  try {
    const { text, mood } = await req.json()

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const message = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 1000,
      system: moodPrompts[mood],
      messages: [{ role: "user", content: `Summarize this document:\n\n${text.slice(0, 20000)}` }]
    })

    const summary = message.content[0].text
    return NextResponse.json({ summary })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}