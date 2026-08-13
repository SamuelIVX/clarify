/**
 * Flashcards page tests (deck list / create / edit interactions with a mocked localStorage).
 */
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FlashcardsPage from "./page";
import type { FlashcardDeck } from "./types";

const deck: FlashcardDeck = {
    id: "deck-1",
    name: "Chemistry Basics",
    createdAt: 1000,
    flashcards: [
        { id: "c1", question: "What is H2O?", answer: "Water", createdAt: 1000 },
        { id: "c2", question: "What is NaCl?", answer: "Salt", createdAt: 1000 },
    ],
};

describe("FlashcardsPage", () => {
    beforeEach(() => localStorage.clear());

    it("shows the empty state when no decks are saved", () => {
        render(<FlashcardsPage />);
        expect(screen.getByRole("heading", { name: /no decks yet/i })).toBeInTheDocument();
        expect(screen.getByText(/upload a pdf to generate your first flashcard deck/i)).toBeInTheDocument();
    });

    it("renders saved decks with their card counts", () => {
        localStorage.setItem("flashcard_decks", JSON.stringify([deck]));
        render(<FlashcardsPage />);
        expect(screen.getByRole("heading", { name: "Chemistry Basics" })).toBeInTheDocument();
        expect(screen.getByText("1 deck saved")).toBeInTheDocument();
        expect(screen.getByText("2 cards")).toBeInTheDocument();
    });

    it("opens the create view from the new deck button", async () => {
        const user = userEvent.setup();
        render(<FlashcardsPage />);
        await user.click(screen.getByRole("button", { name: /new deck/i }));
        expect(screen.getByRole("heading", { name: "New Deck" })).toBeInTheDocument();
    });
});
