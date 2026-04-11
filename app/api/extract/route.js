import { NextResponse } from 'next/server'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const pdfParse = require('pdf-parse')
// ---------------------------------------------------------------------------
// ROUTE HANDLER: POST /api/extract
// This route does NOT call any AI — it only pulls raw text out of a PDF.
// The frontend then takes that text and passes it to /api/cram,
// /api/summarize, or /api/flashcards.
//
// It accepts multipart/form-data (not JSON) because we are uploading a file.
// The frontend must send the PDF under the field name "pdf".
//
// No SDK needed here since we are not calling Gemini at all.
// ---------------------------------------------------------------------------
export async function POST(req) {
  try {
    // --- STEP 1: Parse the incoming multipart form data ---
    // File uploads use FormData, not JSON — so we use req.formData()
    // instead of req.json()
    const formData = await req.formData()

    // --- STEP 2: Get the file from the "pdf" field ---
    // The frontend must use formData.append("pdf", file) when sending
    const file = formData.get('pdf')

    // --- STEP 3: Make sure a file was actually sent ---
    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded. Use field name 'pdf'." },
        { status: 400 }
      )
    }

    // --- STEP 4: Make sure it's actually a PDF and not another file type ---
    // file.type is the MIME type set by the browser based on the file extension
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: "Uploaded file must be a PDF." },
        { status: 400 }
      )
    }

    // --- STEP 5: Convert the File to a Node.js Buffer ---
    // pdf-parse expects a Buffer (Node.js binary format), not a browser File.
    // file.arrayBuffer() reads the raw binary data
    // Buffer.from() converts that into something Node.js can work with
    const buffer = Buffer.from(await file.arrayBuffer())

    // --- STEP 6: Extract the text using pdf-parse ---
    // pdfParse() reads every page of the PDF and returns an object.
    // parsed.text contains all the extracted plain text from the entire file.
    const parsed = await pdfParse(buffer)

    // --- STEP 7: Check that we actually got text back ---
    // Scanned PDFs are just images — pdf-parse cannot extract text from them.
    // In that case we return a helpful error instead of an empty string.
    if (!parsed.text || parsed.text.trim().length === 0) {
      return NextResponse.json(
        { error: "Could not extract text. PDF may be a scanned image." },
        { status: 422 } // 422 = Unprocessable Entity (we got it but can't use it)
      )
    }

    // --- STEP 8: Return the raw extracted text ---
    // The frontend takes this and passes it to /api/cram, /api/summarize, etc.
    return NextResponse.json({ text: parsed.text })

  } catch (error) {
    // Catches anything unexpected: corrupted PDF, parse failure, etc.
    console.error("Extract route error:", error)
    return NextResponse.json(
      { error: "Failed to extract text from PDF." },
      { status: 500 }
    )
  }
}