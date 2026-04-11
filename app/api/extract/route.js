import { NextResponse } from 'next/server'
import { extractText } from 'unpdf'

export const maxDuration = 60

export async function POST(req) {
  try {
    const formData = await req.formData()
    const file = formData.get('pdf')

    if (!file) {
      return NextResponse.json({ error: "No file uploaded. Use field name 'pdf'." }, { status: 400 })
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: "Uploaded file must be a PDF." }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const { text } = await extractText(new Uint8Array(buffer), { mergePages: true })

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Could not extract text. PDF may be a scanned image." },
        { status: 422 }
      )
    }

    return NextResponse.json({ text })

  } catch (error) {
    console.error('[/api/extract]', error)
    return NextResponse.json({ error: 'Failed to extract text from PDF.' }, { status: 500 })
  }
}
