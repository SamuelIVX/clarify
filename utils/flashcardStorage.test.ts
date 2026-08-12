import { describe, it, expect, beforeEach } from "vitest";
import { loadDecks, saveDecks } from "./flashcardStorage";
import type { FlashcardDeck } from "../app/flashcards/types";

const deck: FlashcardDeck = {
    id: "deck-1",
    name: "Chemistry",
    createdAt: 1000,
    flashcards: [{ id: "c1", question: "Q", answer: "A", createdAt: 1000 }],
};

describe("flashcardStorage", () => {
    beforeEach(() => localStorage.clear());

    it("returns an empty list when nothing is stored", () => {
        expect(loadDecks()).toEqual([]);
    });

    it("round-trips decks through localStorage", () => {
        expect(saveDecks([deck])).toBe(true);
        expect(loadDecks()).toEqual([deck]);
    });

    it("overwrites existing decks on save", () => {
        saveDecks([deck]);
        saveDecks([{ ...deck, id: "deck-2", name: "Physics" }]);
        expect(loadDecks().map((d) => d.id)).toEqual(["deck-2"]);
    });

    it("returns an empty list when the stored value is not an array", () => {
        localStorage.setItem("flashcard_decks", JSON.stringify({ not: "an array" }));
        expect(loadDecks()).toEqual([]);
    });

    it("returns an empty list when the stored value is corrupt JSON", () => {
        localStorage.setItem("flashcard_decks", "{not valid json");
        expect(loadDecks()).toEqual([]);
    });
});
