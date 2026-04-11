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

export async function analyzeWeakTopics(flashcards: Flashcard[]): Promise<string[]> {
    const res = await fetch('/api/analyze-topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flashcards }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to analyze topics');
    return data.topics;
}
