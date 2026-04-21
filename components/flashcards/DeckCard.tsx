'use client'
import Link from "next/link";
import { BookOpen, ChevronDown, ChevronUp, Pencil, Trash2 } from "lucide-react";
import { DeckCardProps } from "./types";
import DeckActions from "./DeckActions";
import QACard from "./QACard";

export default function DeckCard({
    deck,
    accent,
    isExpanded,
    onToggleExpand,
    onEdit,
    onDelete,
}: DeckCardProps) {
    return (
        <div
            className={`bg-white rounded-xl shadow-sm border border-gray-200 border-l-4 ${accent.border} overflow-hidden hover:shadow-md transition-shadow`}
        >
            {/* Deck Header */}
            <div className="flex items-center gap-4 p-5">
                <button
                    onClick={onToggleExpand}
                    className="flex-1 flex items-center gap-3 text-left min-w-0"
                >
                    <div
                        className={`shrink-0 w-9 h-9 rounded-lg ${accent.iconBg} flex items-center justify-center`}
                    >
                        <BookOpen className={`w-4 h-4 ${accent.iconText}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 truncate">
                                {deck.name}
                            </h3>
                            <span
                                className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${accent.badge}`}
                            >
                                {deck.flashcards.length} cards
                            </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5" suppressHydrationWarning>
                            Created {new Date(deck.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                    )}
                </button>
                <div className="flex items-center gap-2 shrink-0">
                    <Link
                        href={{
                            pathname: "/cramming",
                            query: { deckId: encodeURIComponent(String(deck.id)) },
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${accent.badge} hover:opacity-80`}
                    >
                        <BookOpen className="w-3.5 h-3.5" /> Study
                    </Link>
                    <DeckActions
                        onChange={onEdit}
                        ariaLabel={`Edit ${deck.name}`}
                        hoverColor="indigo"
                        icon={<Pencil className="w-4 h-4" />}
                    />
                    <DeckActions
                        onChange={onDelete}
                        ariaLabel={`Delete ${deck.name}`}
                        hoverColor="red"
                        icon={<Trash2 className="w-4 h-4" />}
                    />
                </div>
            </div>

            {/* Expanded Cards */}
            {isExpanded && (
                <div className="border-t border-gray-100 divide-y divide-gray-100 max-h-80 overflow-y-auto">
                    {deck.flashcards.map((card, ci) => (
                        <div key={card.id} className="flex gap-3 px-5 py-3">
                            <span
                                className={`shrink-0 w-5 h-5 rounded-full ${accent.iconBg} ${accent.iconText} text-xs font-bold flex items-center justify-center mt-0.5`}
                            >
                                {ci + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                                <QACard
                                    type="Q"
                                    description={card.question}
                                    color={{
                                        span: "",
                                        accent: accent.iconText,
                                        text: "text-gray-900",
                                    }}
                                    padding=""
                                    fontSize="font-medium"
                                />

                                <QACard
                                    type="A"
                                    description={card.answer}
                                    color={{
                                        span: "text-green-500",
                                        accent: "",
                                        text: "text-gray-500",
                                    }}
                                    padding="mt-1"
                                    fontSize=""
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
