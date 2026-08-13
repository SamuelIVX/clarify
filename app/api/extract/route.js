/**
 * POST /api/extract — extracts text from an uploaded PDF using unpdf. Runs on
 * the Vercel server (maxDuration 60s). Rejects non-PDF uploads and scanned
 * images that yield no text.
 */
import { NextResponse } from 'next/server'
import { extractText } from 'unpdf'

export const maxDuration = 60

/**
 * Handles PDF text extraction from a multipart form upload.
 * @param {Request} req - FormData with a `pdf` File field.
 * @returns {Promise<NextResponse>} { text: string } or an error JSON with
 *   status 400/422/500.
 * @throws A rejected read/parse produces a 500 with no internals exposed.
 * @example
 * // multipart POST with field name "pdf" → { text: "..." }
 */
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
