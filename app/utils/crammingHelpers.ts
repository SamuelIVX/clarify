/**
 * Pure helper functions for the cramming (study-session) flow — completion,
 * timing, scoring, retry-deck building, and card/grade styling.
 */
import type { FlashcardDeck } from "./aiApi";

/**
 * True once every card has been classified as known or unknown.
 * @param known - ids the user marked as known.
 * @param unknown - ids the user marked as unknown.
 * @param totalCards - total cards in the session.
 * @returns Whether all cards have been marked known or unknown.
 */
export function checkIfComplete(
    known: Set<string>,
    unknown: Set<string>,
    totalCards: number
): boolean {
    return known.size + unknown.size === totalCards;
}

/**
 * Seconds elapsed since the session start.
 * @param sessionStartTime - epoch ms when the session began; 0 = not started.
 * @returns Whole seconds elapsed, or 0 if the session never started.
 */
export function getSessionDuration(sessionStartTime: number): number {
    return sessionStartTime ? Math.floor((Date.now() - sessionStartTime) / 1000) : 0;
}

/**
 * Percent of cards marked known, rounded to a whole number.
 * @param knownSize - number of known cards.
 * @param totalCards - total cards in the session.
 * @returns Rounded percent of known cards.
 * @example
 * getCorrectPercentage(7, 10) // => 70
 */
export function getCorrectPercentage(knownSize: number, totalCards: number): number {
    return Math.round((knownSize / totalCards) * 100);
}

/**
 * Builds a new deck containing only the unknown cards, renamed to signal a
 * retry of wrong answers. Non-mutating.
 * @param deck - the source deck.
 * @param unknownCards - card ids to carry into the retry deck.
 * @returns A copy of the deck containing only cards whose ids are unknown.
 * @example
 * buildRetryDeck(deck, new Set(["card-2"]));
 * // => { ...deck, name: "<name> - Review Wrong Cards", flashcards: [card-2] }
 */
export function buildRetryDeck(deck: FlashcardDeck, unknownCards: Set<string>): FlashcardDeck {
    return {
        ...deck,
        flashcards: deck.flashcards.filter(card => unknownCards.has(card.id)),
        name: `${deck.name} - Review Wrong Cards`,
    };
}

/**
 * Tailwind border classes for a card's known / unknown / neutral state.
 * @param cardId - the card's id (undefined for unclassified cards).
 * @param knownCards - ids marked known.
 * @param unknownCards - ids marked unknown.
 * @returns Tailwind border classes for the card's current classification.
 */
export function getCardBorderClass(
    cardId: string | undefined,
    knownCards: Set<string>,
    unknownCards: Set<string>
): string {
    if (cardId && knownCards.has(cardId)) return "border-green-300 hover:border-green-400";
    if (cardId && unknownCards.has(cardId)) return "border-red-300 hover:border-red-400";
    return "border-gray-200 hover:border-indigo-300";
}

/**
 * Styling + copy for the session end-of-round grade card.
 * @param correctPercentage - rounded percent of cards marked known.
 * @returns Tailwind classes, title, and message bucket (90+, 70-89, else).
 * @example
 * getGradeInfo(95).title // => "🎉 Excellent Work!"
 * getGradeInfo(50).title // => "💪 Keep Practicing!"
 */
export function getGradeInfo(correctPercentage: number): {
    bg: string;
    titleColor: string;
    textColor: string;
    title: string;
    message: string;
} {
    if (correctPercentage >= 90) {
        return {
            bg: "bg-green-50 border border-green-200",
            titleColor: "text-green-900",
            textColor: "text-green-700",
            title: "🎉 Excellent Work!",
            message: "You have a strong grasp of this material. Great job!",
        };
    }
    if (correctPercentage >= 70) {
        return {
            bg: "bg-yellow-50 border border-yellow-200",
            titleColor: "text-yellow-900",
            textColor: "text-yellow-700",
            title: "👍 Good Job!",
            message: "You're doing well, but there's room for improvement.",
        };
    }
    return {
        bg: "bg-red-50 border border-red-200",
        titleColor: "text-red-900",
        textColor: "text-red-700",
        title: "💪 Keep Practicing!",
        message: "Don't worry! Review the topics below and try again.",
    };
}
