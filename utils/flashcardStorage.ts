/**
 * localStorage persistence for flashcard decks ("flashcard_decks" key).
 */
import { FlashcardDeck } from "../app/flashcards/types";

/**
 * Loads all saved decks from localStorage, tolerating corrupt JSON.
 * @returns The saved decks, or [] on the server / parse failure.
 */
export function loadDecks(): FlashcardDeck[] {
    if (typeof window === "undefined") return [];
    try {
        const parsed = JSON.parse(localStorage.getItem("flashcard_decks") || "[]");
        return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
}

/**
 * Persists decks to localStorage.
 * @param decks - The full deck list to store.
 * @returns True on success; false on the server or storage failure.
 */
export function saveDecks(decks: FlashcardDeck[]): boolean {
    if (typeof window === "undefined") return false;

    try {
        localStorage.setItem("flashcard_decks", JSON.stringify(decks));
        return true;
    } catch {
        return false;
    }
}