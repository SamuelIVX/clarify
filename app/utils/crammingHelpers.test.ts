import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
    checkIfComplete,
    getSessionDuration,
    getCorrectPercentage,
    buildRetryDeck,
    getCardBorderClass,
    getGradeInfo,
} from "./crammingHelpers";
import type { FlashcardDeck } from "./aiApi";

function makeDeck(overrides: Partial<FlashcardDeck> = {}): FlashcardDeck {
    return {
        id: "deck-1",
        name: "Biology",
        createdAt: 1000,
        flashcards: [
            { id: "c1", question: "Q1", answer: "A1", createdAt: 1000 },
            { id: "c2", question: "Q2", answer: "A2", createdAt: 1000 },
            { id: "c3", question: "Q3", answer: "A3", createdAt: 1000 },
        ],
        ...overrides,
    };
}

describe("checkIfComplete", () => {
    it("returns true when known + unknown cover every card", () => {
        const known = new Set(["c1", "c2"]);
        const unknown = new Set(["c3"]);
        expect(checkIfComplete(known, unknown, 3)).toBe(true);
    });

    it("returns false when cards are still ungraded", () => {
        const known = new Set(["c1"]);
        const unknown = new Set(["c2"]);
        expect(checkIfComplete(known, unknown, 3)).toBe(false);
    });

    it("returns false when sets overlap (a card graded twice)", () => {
        const known = new Set(["c1"]);
        const unknown = new Set(["c1"]);
        expect(checkIfComplete(known, unknown, 1)).toBe(false);
    });
});

describe("getSessionDuration", () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it("returns 0 when no start time is recorded", () => {
        expect(getSessionDuration(0)).toBe(0);
    });

    it("returns elapsed seconds since the start time", () => {
        vi.setSystemTime(new Date(2000));
        expect(getSessionDuration(1000)).toBe(1);
        vi.setSystemTime(new Date(10000));
        expect(getSessionDuration(1000)).toBe(9);
    });
});

describe("getCorrectPercentage", () => {
    it("computes the percentage rounded to the nearest integer", () => {
        expect(getCorrectPercentage(1, 3)).toBe(33);
        expect(getCorrectPercentage(3, 3)).toBe(100);
        expect(getCorrectPercentage(0, 3)).toBe(0);
    });
});

describe("buildRetryDeck", () => {
    it("keeps only unknown cards and renames the deck", () => {
        const deck = makeDeck();
        const retry = buildRetryDeck(deck, new Set(["c2"]));
        expect(retry.flashcards.map((c) => c.id)).toEqual(["c2"]);
        expect(retry.name).toBe("Biology - Review Wrong Cards");
    });

    it("preserves the original deck and all other fields", () => {
        const deck = makeDeck();
        const retry = buildRetryDeck(deck, new Set([]));
        expect(retry.id).toBe(deck.id);
        expect(retry.createdAt).toBe(deck.createdAt);
        expect(retry.flashcards).toEqual([]);
        expect(deck.flashcards).toHaveLength(3);
    });
});

describe("getCardBorderClass", () => {
    it("returns green for a known card", () => {
        expect(getCardBorderClass("c1", new Set(["c1"]), new Set())).toContain("border-green-300");
    });

    it("returns red for an unknown card", () => {
        expect(getCardBorderClass("c1", new Set(), new Set(["c1"]))).toContain("border-red-300");
    });

    it("returns neutral for an ungraded or missing card", () => {
        expect(getCardBorderClass(undefined, new Set(["c1"]), new Set())).toContain("border-gray-200");
        expect(getCardBorderClass("c9", new Set(), new Set())).toContain("border-gray-200");
    });
});

describe("getGradeInfo", () => {
    it("returns excellent grade at 90% or above", () => {
        const info = getGradeInfo(90);
        expect(info.title).toContain("Excellent");
        expect(info.bg).toContain("bg-green-50");
    });

    it("returns good grade between 70% and 89%", () => {
        const info = getGradeInfo(70);
        expect(info.title).toContain("Good Job");
        expect(info.bg).toContain("bg-yellow-50");
    });

    it("returns keep-practicing below 70%", () => {
        const info = getGradeInfo(69);
        expect(info.title).toContain("Keep Practicing");
        expect(info.bg).toContain("bg-red-50");
    });
});
