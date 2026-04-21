import { FlashcardDeck } from "../app/flashcards/types";

export function loadDecks(): FlashcardDeck[] {
    if (typeof window === "undefined") return [];
    try {
        const parsed = JSON.parse(localStorage.getItem("flashcard_decks") || "[]");
        return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
}

export function saveDecks(decks: FlashcardDeck[]): boolean {
    if (typeof window === "undefined") return false;

    try {
        localStorage.setItem("flashcard_decks", JSON.stringify(decks));
        return true;
    } catch {
        return false;
    }
}