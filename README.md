# Clarify

A Next.js application that uses Claude to generate flashcards and summaries from PDFs or natural language input. It includes a study mode with progress tracking and performance analytics.

## Features

### Deck Management
- Extract text from PDFs to generate flashcards
- Generate flashcards via conversational UI
- Edit, add, and delete cards manually
- Browser `localStorage` persistence

### Cramming Sessions
- Interactive study sessions with keyboard shortcuts (W/S/Space/Up/Down to flip, A/D/Left/Right to navigate)
- Known/Unknown tracking with real-time progress indicators
- Session statistics including accuracy, time per card, and AI-identified weak topics
- Retry functionality for missed cards

### Dynamic Summaries
- PDF summarization with configurable output styles
- Two-stage processing ("Extracting PDF...", "Generating summary...")
- Markdown rendering with clipboard and PDF export support

---

## Output Configuration (Mood System)

The application adjusts Claude's token output, formatting, and tone based on a selected "mood" parameter. This acts as a set of prompt-engineering presets.

| Preset | Target Use Case | Card Characteristics | Summary Characteristics |
| ------ | --------------- | -------------------- | ----------------------- |
| Tired | Quick reviews | 5 cards, minimal detail | 5 bullets max (≤10 words each) |
| Stressed | Core concepts only | 3 cards, strictly essential points | 3 numbered critical points |
| Annoyed | Fast execution | 5 cards, blunt/direct formatting | Minimum required word count |
| Curious | Deep learning | 10 cards, comprehensive detail | Full markdown with structural headings |

---

## Tech Stack

| Layer | Technology |
| ----- | ---------- |
| Framework | [Next.js 16.2.3](https://nextjs.org/) (App Router) |
| Language | [TypeScript 6](https://www.typescriptlang.org/) (strict mode) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| UI Components | [shadcn/ui](https://ui.shadcn.com/) + [Base UI](https://baseui.com/) + [Lucide React](https://lucide.dev/) |
| AI | [Anthropic Claude](https://anthropic.com) (Opus 4.6 + Haiku 4.5) |
| PDF Extraction | [unpdf](https://github.com/unjs/unpdf) |
| PDF Export | [jsPDF](https://github.com/parallax/jsPDF) |
| Fonts | Geist Sans + Geist Mono (next/font) |
| Storage | Browser localStorage |
| Deployment | [Vercel](https://vercel.com) |

---

## Project Structure

```bash
clarify/
├── app/
│   ├── api/
│   │   ├── extract/route.js            # PDF → plain text (unpdf)
│   │   ├── flashcards/route.js         # Text → flashcard JSON (Claude Opus)
│   │   ├── chat-flashcards/route.js    # Conversation → flashcards (Claude Opus)
│   │   ├── summarize/route.js          # Text → summary markdown (Claude Opus)
│   │   └── analyze-topics/route.js     # Wrong cards → weak topics (Claude Haiku)
│   ├── cramming/
│   │   └── page.tsx                    # Interactive study session
│   ├── flashcards/
│   │   └── page.tsx                    # Deck management + creation + AI chat
│   ├── summary/
│   │   └── page.tsx                    # PDF summarization
│   ├── utils/
│   │   ├── aiApi.ts                    # Client-side API helpers + types
│   │   ├── crammingHelpers.ts          # Session logic helpers
│   │   └── deckAccents.ts              # Deck color accent classes
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                        # Landing page
├── components/
│   ├── flashcards/                     # Flashcard components
│   ├── summary/                        # Summary components
│   └── ui/                             # shadcn/ui base components
├── lib/
│   ├── utils.ts                        # cn() className merger
│   └── prompts.js                      # Parameterized prompt templates
├── utils/
│   ├── flashcardStorage.ts             # localStorage helpers
│   └── pdfExport.ts                    # PDF download functionality
├── package.json
├── next.config.ts
└── tsconfig.json
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- [Anthropic API key](https://console.anthropic.com/)

### Installation

```bash
git clone https://github.com/SamuelIVX/clarify.git
cd clarify
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
# .env.local
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment

This application is configured for deployment on Vercel. 

1. Push to the `main` branch to trigger Vercel's automated deployment.
2. Add your `ANTHROPIC_API_KEY` in the Vercel dashboard under **Settings → Environment Variables**.

*Note: The `/api/extract` route specifies `maxDuration = 60` to accommodate large PDF processing within Vercel's serverless timeout limits.*

---

## API Routes

| Route | Method | Input | Output | Model |
| ----- | ------ | ----- | ------ | ----- |
| `/api/extract` | POST | `FormData { pdf: File }` | `{ text: string }` | — (unpdf) |
| `/api/flashcards` | POST | `{ text, mood }` | `{ flashcards: [{question, answer}] }` | Claude Opus 4.6 |
| `/api/chat-flashcards` | POST | `{ messages: Message[] }` | `{ message: string, flashcards: [{question, answer}] \| null }` | Claude Opus 4.6 |
| `/api/summarize` | POST | `{ text, mood }` | `{ summary: string }` | Claude Opus 4.6 |
| `/api/analyze-topics` | POST | `{ flashcards: Flashcard[] }` | `{ topics: string[] }` | Claude Haiku 4.5 |

All routes execute server-side. The `ANTHROPIC_API_KEY` is not exposed to the client.
