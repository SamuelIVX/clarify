import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

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

    // --- STEP 3: Initialize the Gemini SDK with your API key ---
    // The key is pulled from .env.local — never hardcoded
    // GoogleGenerativeAI is the main entry point for the SDK
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

    // --- STEP 4: Get the model and attach the mood system instruction ---
    // getGenerativeModel() sets up which Gemini model to use
    // systemInstruction is passed separately from the user content —
    // Gemini treats it like background rules the user never sees
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",         // free, fast model — perfect for hackathons
      systemInstruction: moodPrompts[mood] // mood-based rules for this request
    })

    // --- STEP 5: Send the text to Gemini and get the cram sheet back ---
    // We slice to 12000 chars to avoid hitting token limits on large PDFs
    // result.response.text() extracts the plain text from Gemini's response
    const result = await model.generateContent(text.trim().slice(0, 12000))
    const cram = result.response.text()

    // --- STEP 6: Send the cram sheet back to the frontend ---
    // NextResponse.json() serializes the object and sets the correct headers
    return NextResponse.json({ cram })

  } catch (error) {
    // Catches anything unexpected: bad API key, network failure, etc.
    console.error("Cram route error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}