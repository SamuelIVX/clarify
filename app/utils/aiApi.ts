/**
 * Flashcard and deck domain types plus the client-side wrapper for the
 * /api/analyze-topics route.
 */
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

/**
 * Asks the server to identify weak-topic strings for a set of missed
 * flashcards. Throws on non-OK responses so callers surface an error state.
 * @param flashcards - The flashcards the student got wrong.
 * @returns A list of 3-5 concise weak-topic strings.
 * @throws {Error} If the API returns a non-2xx response.
 * @example
 * const topics = await analyzeWeakTopics([{ id: "1", question: "Q", answer: "A", createdAt: 0 }]);
 * // => ["mitosis", "cell cycle", ...]
 */
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
