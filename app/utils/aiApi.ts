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

export async function analyzeWeakTopics() {
    const provider = localStorage.getItem('ai_provider') as 'gemini';
    const apiKey = localStorage.getItem('api_key');

    if (!apiKey) {
        throw new Error('API key not configured. Please set it in Settings.');
    }
}
