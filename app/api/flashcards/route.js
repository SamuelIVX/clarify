import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'


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

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: flashcardPrompts[mood]
    })

    const result = await model.generateContent(text)
    const raw = result.response.text()

    // Parse the JSON Gemini returns
    const flashcards = JSON.parse(raw)

    return NextResponse.json({ flashcards })
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}