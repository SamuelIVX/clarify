/**
 * localStorage persistence for flashcard decks ("flashcard_decks" key).
 */
import { FlashcardDeck } from "../app/flashcards/types";

/**
 * Loads all saved decks from localStorage, tolerating corrupt JSON.
 * @returns The saved decks, or [] on the server / parse failure.
 * @example
 * const decks = loadDecks();
 * // => [] when SSR or when "flashcard_decks" is missing/corrupt
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
 * @example
 * saveDecks([{ id: "1", name: "Bio", flashcards: [], createdAt: Date.now() }]);
 * // => true in the browser when storage accepts the write
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