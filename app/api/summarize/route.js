import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

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

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: moodPrompts[mood]
    })

    const result = await model.generateContent(text)
    const summary = result.response.text()

    return NextResponse.json({ summary })
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}