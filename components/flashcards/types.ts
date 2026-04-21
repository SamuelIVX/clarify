import { FlashcardDeck } from "@/app/flashcards/types";
import { CreateMode } from "@/app/flashcards/types";
import { ReactNode } from "react";

export interface DeckCardProps {
    deck: FlashcardDeck;
    accent: {
        border: string;
        badge: string;
        iconBg: string;
        iconText: string;
    };
    isExpanded: boolean;
    onToggleExpand: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

export interface ModeToggleProps {
    mode: CreateMode;
    onModeChange: (mode: CreateMode) => void;
    icon: ReactNode;
}

export interface DeckActionProps {
    onChange: () => void;
    ariaLabel: string;
    hoverColor: string;
    icon: ReactNode;
}

export interface QACardProps {
    type: "Q" | "A";
    description: string;
    color: {
        span: string;
        accent: string;
        text: string;
    };
    padding: string;
    fontSize: string;
}