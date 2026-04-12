import type { FlashcardDeck } from "./aiApi";

export function checkIfComplete(
    known: Set<string>,
    unknown: Set<string>,
    totalCards: number
): boolean {
    return known.size + unknown.size === totalCards;
}

export function getSessionDuration(sessionStartTime: number): number {
    return sessionStartTime ? Math.floor((Date.now() - sessionStartTime) / 1000) : 0;
}

export function getCorrectPercentage(knownSize: number, totalCards: number): number {
    return Math.round((knownSize / totalCards) * 100);
}

export function buildRetryDeck(deck: FlashcardDeck, unknownCards: Set<string>): FlashcardDeck {
    return {
        ...deck,
        flashcards: deck.flashcards.filter(card => unknownCards.has(card.id)),
        name: `${deck.name} - Review Wrong Cards`,
    };
}

export function getCardBorderClass(
    cardId: string | undefined,
    knownCards: Set<string>,
    unknownCards: Set<string>
): string {
    if (cardId && knownCards.has(cardId)) return "border-green-300 hover:border-green-400";
    if (cardId && unknownCards.has(cardId)) return "border-red-300 hover:border-red-400";
    return "border-gray-200 hover:border-indigo-300";
}

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
