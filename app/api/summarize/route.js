import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const moodPrompts = {
  tired: `Summarize this in max 5 bullet points. 
          Each bullet under 10 words. 
          Add one funny analogy at the end.`,

  stressed: `Give me ONLY the 3 most important points.
             Number them. Nothing else. Be calm.`,

  annoyed: `Be blunt. No fluff. Tell me what I need 
            to know in the fewest words possible.`,

  curious: `Give a thorough summary with key insights,
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
      messages: [{ role: "user", content: text }]
    })

    const summary = message.content[0].text
    return NextResponse.json({ summary })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}