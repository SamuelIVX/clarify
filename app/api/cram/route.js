import { NextResponse } from 'next/server'
//import { GoogleGenerativeAI } from '@google/generative-ai'

// ---------------------------------------------------------------------------
// MOOD SYSTEM PROMPTS
// Each mood changes how the cram sheet is written and formatted.
// A "system instruction" is a behind-the-scenes instruction you give Gemini
// before the user's content — it sets the personality and rules for the response.
// The SDK passes this separately from the actual text via systemInstruction.
// ---------------------------------------------------------------------------
const moodPrompts = {
  // TIRED: bare minimum, ultra short, they just need to survive the exam
  tired: `You are creating a last-minute cram sheet for someone who is exhausted.
          Maximum 5 points, each under 8 words.
          Only the most essential facts, no full sentences needed.
          Label it "CRAM SHEET:" at the top.
          End with: "That's it. Go sleep after this."`,

  // STRESSED: calm them down while giving the 3 most important facts
  stressed: `You are creating a calming cram sheet for someone who is panicking.
             Pick the 3 most critical facts, numbered 1, 2, 3.
             One short sentence each.
             Add a small note like "(this is the big one)" after each.
             Label it "YOU GOT THIS — CRAM SHEET:" at the top.`,

  // ANNOYED: no fluff, no hand-holding, raw facts only
  annoyed: `You are creating a no-nonsense cram sheet. No fluff, no intro, no conclusion.
            Bullet points only, max 6.
            Every word must earn its place.
            Label it "CRAM:" at the top and nothing else.`,

  // CURIOUS: they want to actually understand, not just memorize
  curious: `You are creating a deep-dive cram sheet for someone who wants to truly understand.
            Cover all key concepts with a one-line "why it matters" for each.
            Include one real-world example per major idea.
            Bold key terms. Label it "DEEP CRAM SHEET:" at the top.`
}

// ---------------------------------------------------------------------------
// ROUTE HANDLER: POST /api/cram
// Next.js automatically maps this to POST requests at /api/cram
// because this file lives at app/api/cram/route.js
// ---------------------------------------------------------------------------
export async function POST(req) {
    // REPLACE with this
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",  // fast and cheap for testing
      max_tokens: 1000,
      system: moodPrompts[mood],
      messages: [{ role: "user", content: text.trim().slice(0, 12000) }]
    })
  })
  const data = await response.json()
  const cram = data.content[0].text
}