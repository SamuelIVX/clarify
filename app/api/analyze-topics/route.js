import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(req) {
  try {
    const { flashcards } = await req.json()
    if (!Array.isArray(flashcards) || flashcards.length === 0) {
      return NextResponse.json({ error: 'flashcards must be a non-empty array' }, { status: 400 })
    }


    const questionsAndAnswers = flashcards
      .map(card => `Q: ${card.question}\nA: ${card.answer}`)
      .join('\n\n')

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: `You analyze flashcards a student got wrong and identify weak topic areas.
               Return ONLY a JSON array of 3-5 concise topic strings, no explanation, no markdown, no backticks.
               Example: ["Cell division and mitosis", "DNA replication", "Photosynthesis"]`,
      messages: [{ role: 'user', content: `Flashcards the student got wrong:\n\n${questionsAndAnswers}` }],
    })

    const raw = message.content[0].text
    const jsonMatch = raw.match(/\[[\s\S]*\]/)
    if (!jsonMatch) throw new Error('AI response did not contain a valid JSON array')
    const topics = JSON.parse(jsonMatch[0])
    return NextResponse.json({ topics })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
