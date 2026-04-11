import { NextResponse } from 'next/server'

// ---------------------------------------------------------------------------
// MOOD SYSTEM PROMPTS
// Each mood changes how the cram sheet is written and formatted.
// A "system" prompt is a behind the scenes instruction you give Claude
// before the user's content — it sets the personality and rules for the response.
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
  try {
    // --- STEP 1: Parse the JSON body the frontend sent ---
    // req.json() reads and parses the JSON body from the request
    const { text, mood } = await req.json()

    // --- STEP 2: Validate inputs before hitting the API ---
    // Failing fast here saves API quota and prevents confusing errors
    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 })
    }

    // Make sure the mood is one of the 4 accepted values
    const validMoods = ["tired", "stressed", "annoyed", "curious"]
    if (!mood || !validMoods.includes(mood)) {
      return NextResponse.json({ error: "Invalid mood" }, { status: 400 })
    }

    // --- STEP 3: Call the Claude API ---
    // fetch() runs on the server so the API key is never exposed to the browser
    // system is the mood-based instructions, messages is the actual content
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY, // pulled from .env.local, never hardcoded
        "anthropic-version": "2023-06-01"            // tells Claude which API version to use
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001", // fast and cheap for testing
        max_tokens: 1000,                   // cap how long the response can be
        system: moodPrompts[mood],          // mood-based rules for this request
        messages: [
          {
            role: "user",
            // slice to 12000 chars to avoid hitting token limits on large PDFs
            content: text.trim().slice(0, 12000)
          }
        ]
      })
    })

    // --- STEP 4: Handle a failed Claude response ---
    // response.ok is true for 2xx status codes
    // If false, something went wrong on Claude's end (bad key, quota, outage)
    if (!response.ok) {
      const errorBody = await response.text()
      console.error("Claude API error:", errorBody)
      return NextResponse.json({ error: "Claude API request failed" }, { status: 502 })
    }

    // --- STEP 5: Pull the text out of Claude's response ---
    // Claude returns content as an array — the first item's text is the answer
    const data = await response.json()
    const cram = data.content[0].text

    // --- STEP 6: Send the cram sheet back to the frontend ---
    // NextResponse.json() serializes the object and sets the correct headers
    return NextResponse.json({ cram })

  } catch (error) {
    // Catches anything unexpected: bad API key, network failure, etc.
    console.error("Cram route error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}