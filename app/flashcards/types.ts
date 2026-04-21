export interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

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

export type Mood = "tired" | "stressed" | "annoyed" | "curious";
export type View = "list" | "create" | "edit";
export type CreateMode = "pdf" | "chat";

export const moods: { value: Mood; label: string; description: string }[] = [
    { value: "tired", label: "😴 Tired", description: "5 simple cards" },
    { value: "stressed", label: "😰 Stressed", description: "3 critical cards" },
    { value: "annoyed", label: "😤 Annoyed", description: "5 blunt cards" },
    { value: "curious", label: "🤓 Curious", description: "10 detailed cards" },
];