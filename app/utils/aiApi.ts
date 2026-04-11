export interface Flashcard {
    id: string;
    question: string;
    answer: string;
    createdAt: number;
}

export interface FlashcardDeck {
    id: string;
    name: string;
    flashcards: Flashcard[];
    createdAt: number;
}

async function callClaudeAPI(apiKey: string, prompt: string): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 4096,
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
            ],
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to call Claude API');
    }

    const data = await response.json();
    return data.content[0].text;
}

async function callGeminiAPI(apiKey: string, prompt: string): Promise<string> {
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: prompt,
                            },
                        ],
                    },
                ],
            }),
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to call Gemini API');
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

export async function generateFlashcards(
    text: string,
    fileName: string
): Promise<FlashcardDeck> {
    const provider = localStorage.getItem('ai_provider') as 'claude' | 'gemini' || 'claude';
    const apiKey = localStorage.getItem('api_key');

    if (!apiKey) {
        throw new Error('API key not configured. Please set it in Settings.');
    }

    const prompt = `You are a study assistant that creates flashcards from educational content.

Analyze the following text and generate 10-15 high-quality flashcards. Each flashcard should:
- Have a clear, specific question
- Have a concise but complete answer
- Cover key concepts, definitions, or important facts
- Be suitable for studying and memorization

Return the flashcards as a JSON array in this exact format:
[
  {
    "question": "What is...",
    "answer": "..."
  },
  ...
]

Text to analyze:
${text.slice(0, 15000)}

Return ONLY the JSON array, no other text.`;

    let response: string;
    if (provider === 'claude') {
        response = await callClaudeAPI(apiKey, prompt);
    } else {
        response = await callGeminiAPI(apiKey, prompt);
    }

    // Extract JSON from response (in case there's extra text)
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
        throw new Error('Failed to parse flashcards from AI response');
    }

    const rawFlashcards = JSON.parse(jsonMatch[0]);

    const flashcards: Flashcard[] = rawFlashcards.map((card: any, index: number) => ({
        id: `${Date.now()}-${index}`,
        question: card.question,
        answer: card.answer,
        createdAt: Date.now(),
    }));

    const deck: FlashcardDeck = {
        id: `deck-${Date.now()}`,
        name: fileName.replace('.pdf', ''),
        flashcards,
        createdAt: Date.now(),
    };

    return deck;
}

export async function generateSummary(text: string): Promise<string> {
    const provider = localStorage.getItem('ai_provider') as 'claude' | 'gemini' || 'claude';
    const apiKey = localStorage.getItem('api_key');

    if (!apiKey) {
        throw new Error('API key not configured. Please set it in Settings.');
    }

    const prompt = `You are a study assistant that creates concise summaries of educational content.

Analyze the following text and create a comprehensive but concise summary. The summary should:
- Highlight the main topics and key concepts
- Be well-organized with clear sections
- Include important definitions and facts
- Be suitable for quick review before an exam
- Use bullet points and headings for clarity

Text to summarize:
${text.slice(0, 20000)}`;

    if (provider === 'claude') {
        return await callClaudeAPI(apiKey, prompt);
    } else {
        return await callGeminiAPI(apiKey, prompt);
    }
}

export async function analyzeWeakTopics(flashcards: Flashcard[]): Promise<string[]> {
    const provider = localStorage.getItem('ai_provider') as 'claude' | 'gemini' || 'claude';
    const apiKey = localStorage.getItem('api_key');

    if (!apiKey) {
        throw new Error('API key not configured. Please set it in Settings.');
    }

    const questionsAndAnswers = flashcards.map(card =>
        `Q: ${card.question}\nA: ${card.answer}`
    ).join('\n\n');

    const prompt = `You are analyzing flashcards that a student got wrong or struggled with.

Based on these flashcards, identify the main topics or subject areas where the student needs improvement.

Flashcards the student struggled with:
${questionsAndAnswers}

Return 3-5 specific topics or concepts as a JSON array of strings. Be concise and specific.

Example format:
["Cell division and mitosis", "Photosynthesis process", "DNA replication"]

Return ONLY the JSON array, no other text.`;

    let response: string;
    if (provider === 'claude') {
        response = await callClaudeAPI(apiKey, prompt);
    } else {
        response = await callGeminiAPI(apiKey, prompt);
    }

    // Extract JSON from response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
        // Fallback: extract topics from questions manually
        return flashcards.slice(0, 3).map(card => {
            const words = card.question.split(' ');
            return words.slice(0, 5).join(' ') + '...';
        });
    }

    return JSON.parse(jsonMatch[0]);
}
