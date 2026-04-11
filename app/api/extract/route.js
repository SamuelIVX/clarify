import { NextResponse } from 'next/server'
import { extractText } from 'unpdf'

// ---------------------------------------------------------------------------
// ROUTE HANDLER: POST /api/extract
// This route does NOT call any AI — it only pulls raw text out of a PDF.
// The frontend then takes that text and passes it to /api/cram,
// /api/summarize, or /api/flashcards.
//
// It accepts multipart/form-data (not JSON) because we are uploading a file.
// The frontend must send the PDF under the field name "pdf".
// ---------------------------------------------------------------------------
export async function POST(req) {
  try {
    // --- STEP 1: Parse the incoming multipart form data ---
    // File uploads use FormData, not JSON — so we use req.formData()
    const formData = await req.formData()

    // --- STEP 2: Get the file from the "pdf" field ---
    const file = formData.get('pdf')

    // --- STEP 3: Make sure a file was actually sent ---
    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded. Use field name 'pdf'." },
        { status: 400 }
      )
    }

    // --- STEP 4: Make sure it's actually a PDF ---
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: "Uploaded file must be a PDF." },
        { status: 400 }
      )
    }

    // --- STEP 5: Convert the File to a Uint8Array ---
    // unpdf expects a Uint8Array instead of a Buffer
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    // --- STEP 6: Extract the text using unpdf ---
    // extractText() reads every page and returns all the plain text
    const { text } = await extractText(uint8Array, { mergePages: true })

    // --- STEP 7: Check that we actually got text back ---
    // Scanned PDFs are just images — unpdf can't read those
    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Could not extract text. PDF may be a scanned image." },
        { status: 422 }
      )
    }

    // --- STEP 8: Return the raw extracted text ---
    // The frontend passes this to /api/cram, /api/summarize, etc.
    return NextResponse.json({ text })

  } catch (error) {
    console.error("Extract route error:", error)
    return NextResponse.json(
      { error: "Failed to extract text from PDF." },
      { status: 500 }
    )
  }
}