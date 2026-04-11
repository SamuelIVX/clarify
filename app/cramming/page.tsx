'use client'
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Brain, ChevronLeft, ChevronRight, RotateCcw, Check, X, TrendingUp, TrendingDown, Target, Loader2 } from "lucide-react";
import type { FlashcardDeck } from "@/app/utils/aiApi";
import { analyzeWeakTopics } from "@/app/utils/aiApi";
import {
    checkIfComplete,
    getSessionDuration,
    getCorrectPercentage,
    buildRetryDeck,
    getCardBorderClass,
    getGradeInfo,
} from "@/app/utils/crammingHelpers";

export default function CrammingSession() {
    const searchParams = useSearchParams();
    const [decks, setDecks] = useState<FlashcardDeck[]>([]);
    const [selectedDeck, setSelectedDeck] = useState<FlashcardDeck | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [knownCards, setKnownCards] = useState<Set<string>>(new Set());
    const [unknownCards, setUnknownCards] = useState<Set<string>>(new Set());
    const [showStats, setShowStats] = useState(false);
    const [weakTopics, setWeakTopics] = useState<string[]>([]);
    const [analyzingTopics, setAnalyzingTopics] = useState(false);
    const [sessionStartTime, setSessionStartTime] = useState<number>(0);

    useEffect(() => {
        try {
            const savedDecks: FlashcardDeck[] = JSON.parse(localStorage.getItem("flashcard_decks") || "[]");
            setDecks(savedDecks);
            const deckId = searchParams.get("deckId");
            if (deckId) {
                const match = savedDecks.find(d => d.id === deckId);
                if (match) {
                    setSelectedDeck(match);
                    setSessionStartTime(Date.now());
                }
            }
        } catch (error) {
            console.error('Failed to parse saved decks:', error);
            setDecks([]);
        }
    }, [searchParams]);

    const handleSelectDeck = (deck: FlashcardDeck) => {
        setSelectedDeck(deck);
        setCurrentIndex(0);
        setShowAnswer(false);
        setKnownCards(new Set());
        setUnknownCards(new Set());
        setShowStats(false);
        setWeakTopics([]);
        setSessionStartTime(Date.now());
    };

    const handleFlipCard = () => {
        setShowAnswer(!showAnswer);
    };

    const handleNext = () => {
        if (!selectedDeck) return;
        setShowAnswer(false);
        setCurrentIndex((prev) => (prev + 1) % selectedDeck.flashcards.length);
    };

    const handlePrevious = () => {
        if (!selectedDeck) return;
        setShowAnswer(false);
        setCurrentIndex((prev) =>
            prev === 0 ? selectedDeck.flashcards.length - 1 : prev - 1
        );
    };

    const handleMarkKnown = async () => {
        if (!selectedDeck) return;
        const currentCard = selectedDeck.flashcards[currentIndex];
        const newKnown = new Set(knownCards);
        const newUnknown = new Set(unknownCards);

        newKnown.add(currentCard.id);
        newUnknown.delete(currentCard.id);

        setKnownCards(newKnown);
        setUnknownCards(newUnknown);

        // Check if session is complete
        if (checkIfComplete(newKnown, newUnknown, selectedDeck.flashcards.length)) {
            setShowStats(true);

            // Analyze weak topics if there are unknown cards
            if (newUnknown.size > 0) {
                setAnalyzingTopics(true);
                try {
                    const unknownFlashcards = selectedDeck.flashcards.filter(card =>
                        newUnknown.has(card.id)
                    );
                    const topics = await analyzeWeakTopics(unknownFlashcards);
                    setWeakTopics(topics);
                } catch (error) {
                    console.error('Failed to analyze topics:', error);
                } finally {
                    setAnalyzingTopics(false);
                }
            }
        } else {
            handleNext();
        }
    };

    const handleMarkUnknown = async () => {
        if (!selectedDeck) return;
        const currentCard = selectedDeck.flashcards[currentIndex];
        const newKnown = new Set(knownCards);
        const newUnknown = new Set(unknownCards);

        newUnknown.add(currentCard.id);
        newKnown.delete(currentCard.id);

        setKnownCards(newKnown);
        setUnknownCards(newUnknown);

        // Check if session is complete
        if (checkIfComplete(newKnown, newUnknown, selectedDeck.flashcards.length)) {
            setShowStats(true);

            // Analyze weak topics
            setAnalyzingTopics(true);
            try {
                const unknownFlashcards = selectedDeck.flashcards.filter(card =>
                    newUnknown.has(card.id)
                );
                const topics = await analyzeWeakTopics(unknownFlashcards);
                setWeakTopics(topics);
            } catch (error) {
                console.error('Failed to analyze topics:', error);
            } finally {
                setAnalyzingTopics(false);
            }
        } else {
            handleNext();
        }
    };

    const handleReset = () => {
        setKnownCards(new Set());
        setUnknownCards(new Set());
        setCurrentIndex(0);
        setShowAnswer(false);
        setShowStats(false);
        setWeakTopics([]);
        setSessionStartTime(Date.now());
    };

    const handleRetryWrongCards = () => {
        if (!selectedDeck) return;
        setSelectedDeck(buildRetryDeck(selectedDeck, unknownCards));
        setKnownCards(new Set());
        setUnknownCards(new Set());
        setCurrentIndex(0);
        setShowAnswer(false);
        setShowStats(false);
        setWeakTopics([]);
        setSessionStartTime(Date.now());
    };

    const currentCard = selectedDeck?.flashcards[currentIndex];
    const progress = selectedDeck
        ? ((knownCards.size + unknownCards.size) / selectedDeck.flashcards.length) * 100
        : 0;

    const sessionDuration = getSessionDuration(sessionStartTime);
    const minutes = Math.floor(sessionDuration / 60);
    const seconds = sessionDuration % 60;

    const correctPercentage = selectedDeck
        ? getCorrectPercentage(knownCards.size, selectedDeck.flashcards.length)
        : 0;

    if (decks.length === 0) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden w-full max-w-md">
                    <div className="bg-linear-to-br from-indigo-500 to-purple-600 px-8 py-10 text-center">
                        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                            <Brain className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Ready to cram?</h2>
                        <p className="text-indigo-200 mt-2 text-sm">You need at least one flashcard deck to start a session.</p>
                    </div>
                    <div className="px-8 py-6 text-center">
                        <p className="text-gray-600 text-sm mb-5">Upload a PDF in the Flashcards section and AI will generate a deck for you.</p>
                        <a
                            href="/flashcards"
                            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors text-sm"
                        >
                            Create a Deck
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    const deckAccentClasses = [
        { border: "border-l-indigo-400", iconBg: "bg-indigo-100", iconText: "text-indigo-600", badge: "bg-indigo-50 text-indigo-700" },
        { border: "border-l-violet-400", iconBg: "bg-violet-100", iconText: "text-violet-600", badge: "bg-violet-50 text-violet-700" },
        { border: "border-l-purple-400", iconBg: "bg-purple-100", iconText: "text-purple-600", badge: "bg-purple-50 text-purple-700" },
        { border: "border-l-blue-400", iconBg: "bg-blue-100", iconText: "text-blue-600", badge: "bg-blue-50 text-blue-700" },
        { border: "border-l-cyan-400", iconBg: "bg-cyan-100", iconText: "text-cyan-600", badge: "bg-cyan-50 text-cyan-700" },
    ];

    if (!selectedDeck) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Cramming Session</h1>
                    <p className="text-gray-600 mt-2">Pick a deck and start studying</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    {decks.map((deck, i) => {
                        const accent = deckAccentClasses[i % deckAccentClasses.length];
                        return (
                            <button
                                key={deck.id}
                                onClick={() => handleSelectDeck(deck)}
                                className={`group bg-white rounded-xl shadow-sm border border-gray-200 border-l-4 ${accent.border} p-6 text-left hover:shadow-md hover:-translate-y-0.5 transition-all`}
                            >
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className={`w-10 h-10 rounded-lg ${accent.iconBg} flex items-center justify-center shrink-0`}>
                                        <Brain className={`w-5 h-5 ${accent.iconText}`} />
                                    </div>
                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${accent.badge}`}>
                                        {deck.flashcards.length} cards
                                    </span>
                                </div>
                                <h3 className="font-semibold text-gray-900 text-base leading-snug mb-1 group-hover:text-indigo-700 transition-colors">{deck.name}</h3>
                                <p className="text-xs text-gray-400" suppressHydrationWarning>Created {new Date(deck.createdAt).toLocaleDateString()}</p>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }

    // Statistics Screen
    if (showStats) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col h-[calc(100vh-3.5rem)]">
                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto pb-4">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <div className="bg-linear-to-r from-indigo-600 to-purple-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                            <Brain className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900">Session Complete!</h1>
                        <p className="text-gray-600 mt-2">{selectedDeck.name}</p>
                    </div>

                    {/* Performance Summary */}
                    <div className="grid md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600">Correct</span>
                                <TrendingUp className="w-5 h-5 text-green-600" />
                            </div>
                            <p className="text-3xl font-bold text-green-600">{knownCards.size}</p>
                            <p className="text-sm text-gray-500 mt-1">
                                {correctPercentage}% accuracy
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600">Incorrect</span>
                                <TrendingDown className="w-5 h-5 text-red-600" />
                            </div>
                            <p className="text-3xl font-bold text-red-600">{unknownCards.size}</p>
                            <p className="text-sm text-gray-500 mt-1">
                                {100 - correctPercentage}% missed
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600">Time Spent</span>
                                <Target className="w-5 h-5 text-indigo-600" />
                            </div>
                            <p className="text-3xl font-bold text-indigo-600">
                                {minutes}:{seconds.toString().padStart(2, '0')}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                {Math.round(sessionDuration / selectedDeck.flashcards.length)}s per card
                            </p>
                        </div>
                    </div>

                    {/* Performance Grade */}
                    {(() => {
                        const grade = getGradeInfo(correctPercentage);
                        return (
                            <div className={`rounded-lg p-6 mb-8 ${grade.bg}`}>
                                <h2 className={`text-2xl font-bold mb-2 ${grade.titleColor}`}>{grade.title}</h2>
                                <p className={grade.textColor}>{grade.message}</p>
                            </div>
                        );
                    })()}

                    {/* Topics to Review */}
                    {unknownCards.size > 0 && (
                        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-8">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Target className="w-6 h-6 text-indigo-600" />
                                Topics You Need Help With
                            </h3>

                            {analyzingTopics ? (
                                <div className="flex items-center gap-3 text-gray-600 py-4">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Analyzing your weak areas with AI...</span>
                                </div>
                            ) : weakTopics.length > 0 ? (
                                <div className="space-y-2">
                                    {weakTopics.map((topic, index) => (
                                        <div
                                            key={index}
                                            className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg"
                                        >
                                            <span className="font-semibold text-amber-700">{index + 1}.</span>
                                            <span className="text-amber-900">{topic}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-600">
                                    Review the {unknownCards.size} flashcards you got wrong to improve your understanding.
                                </p>
                            )}
                        </div>
                    )}

                    {/* Wrong Cards List */}
                    {unknownCards.size > 0 && (
                        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-8">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                Flashcards You Got Wrong ({unknownCards.size})
                            </h3>
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {selectedDeck.flashcards
                                    .filter(card => unknownCards.has(card.id))
                                    .map((card) => (
                                        <div
                                            key={card.id}
                                            className="border border-red-200 rounded-lg p-4 bg-red-50"
                                        >
                                            <p className="font-medium text-gray-900 mb-2">
                                                Q: {card.question}
                                            </p>
                                            <p className="text-gray-700 text-sm">
                                                A: {card.answer}
                                            </p>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}

                </div>{/* end scrollable content */}

                {/* Action Buttons — always visible */}
                <div className="pt-4 space-y-3 border-t border-gray-200">
                    {unknownCards.size > 0 && (
                        <button
                            onClick={handleRetryWrongCards}
                            className="w-full bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <RotateCcw className="w-5 h-5" />
                            Retry Wrong Cards Only ({unknownCards.size} cards)
                        </button>
                    )}
                    <button
                        onClick={handleReset}
                        className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <RotateCcw className="w-5 h-5" />
                        Retry All Cards ({selectedDeck.flashcards.length} cards)
                    </button>
                    <button
                        onClick={() => setSelectedDeck(null)}
                        className="w-full border border-gray-300 px-6 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Back to Decks
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <button
                        onClick={() => setSelectedDeck(null)}
                        className="text-indigo-600 hover:text-indigo-700 mb-2 flex items-center gap-1"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back to Decks
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">{selectedDeck.name}</h1>
                    <p className="text-gray-600 mt-1">
                        Card {currentIndex + 1} of {selectedDeck.flashcards.length}
                    </p>
                </div>
                <div className="flex gap-2">
                    {(knownCards.size + unknownCards.size) > 0 && (
                        <button
                            onClick={async () => {
                                setShowStats(true);
                                if (unknownCards.size > 0) {
                                    setAnalyzingTopics(true);
                                    try {
                                        const unknownFlashcards = selectedDeck.flashcards.filter(card =>
                                            unknownCards.has(card.id)
                                        );
                                        const topics = await analyzeWeakTopics(unknownFlashcards);
                                        setWeakTopics(topics);
                                    } catch (error) {
                                        console.error('Failed to analyze topics:', error);
                                    } finally {
                                        setAnalyzingTopics(false);
                                    }
                                }
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            <Check className="w-4 h-4" />
                            Finish Session
                        </button>
                    )}
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Reset
                    </button>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress: {knownCards.size + unknownCards.size} / {selectedDeck.flashcards.length} reviewed</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden flex">
                    <div
                        className="h-full bg-green-500 transition-all duration-300"
                        style={{ width: `${(knownCards.size / selectedDeck.flashcards.length) * 100}%` }}
                    />
                    <div
                        className="h-full bg-red-500 transition-all duration-300"
                        style={{ width: `${(unknownCards.size / selectedDeck.flashcards.length) * 100}%` }}
                    />
                </div>
                <div className="flex justify-between text-sm mt-2">
                    <span className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                        <span className="text-green-700 font-medium">Known: {knownCards.size}</span>
                    </span>
                    <span className="text-gray-500">
                        Unreviewed: {selectedDeck.flashcards.length - knownCards.size - unknownCards.size}
                    </span>
                    <span className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                        <span className="text-red-700 font-medium">Unknown: {unknownCards.size}</span>
                    </span>
                </div>
            </div>

            {/* Flashcard */}
            <div
                onClick={handleFlipCard}
                className={`rounded-2xl shadow-lg border-2 p-12 min-h-56 flex items-center justify-center cursor-pointer transition-all mb-6 ${getCardBorderClass(currentCard?.id, knownCards, unknownCards)} ${showAnswer ? "bg-linear-to-br from-green-50 to-white" : "bg-linear-to-br from-indigo-50 to-white"}`}
            >
                <div className="text-center w-full">
                    {currentCard && (knownCards.has(currentCard.id) || unknownCards.has(currentCard.id)) && (
                        <div className={`mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${knownCards.has(currentCard.id)
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                            }`}>
                            {knownCards.has(currentCard.id) ? (
                                <>
                                    <Check className="w-3 h-3" />
                                    Previously marked as known
                                </>
                            ) : (
                                <>
                                    <X className="w-3 h-3" />
                                    Previously marked as unknown
                                </>
                            )}
                        </div>
                    )}
                    {!showAnswer ? (
                        <>
                            <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4">Question</p>
                            <p className="text-2xl font-semibold text-gray-900 mb-6 leading-snug">
                                {currentCard?.question}
                            </p>
                            <p className="text-sm text-gray-400 flex items-center justify-center gap-1.5">
                                <span className="w-4 h-px bg-gray-300 inline-block" />
                                tap to reveal
                                <span className="w-4 h-px bg-gray-300 inline-block" />
                            </p>
                        </>
                    ) : (
                        <>
                            <p className="text-xs font-bold text-green-500 uppercase tracking-widest mb-4">Answer</p>
                            <p className="text-xl text-gray-900 leading-relaxed">
                                {currentCard?.answer}
                            </p>
                        </>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className="flex gap-4">
                <button
                    onClick={handlePrevious}
                    className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                    Previous
                </button>

                <button
                    onClick={handleNext}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                    Skip
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Know/Don't Know Buttons */}
            {showAnswer && (
                <div className="flex gap-3 mt-4">
                    <button
                        onClick={handleMarkUnknown}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-red-500 text-white rounded-xl hover:bg-red-600 active:scale-95 transition-all font-semibold shadow-sm"
                    >
                        <X className="w-5 h-5" />
                        Don&apos;t Know
                    </button>
                    <button
                        onClick={handleMarkKnown}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-green-500 text-white rounded-xl hover:bg-green-600 active:scale-95 transition-all font-semibold shadow-sm"
                    >
                        <Check className="w-5 h-5" />
                        Know It
                    </button>
                </div>
            )}

            <p className="text-xs text-gray-400 text-center mt-5">Tap the card to flip • Use Previous/Skip to navigate</p>
        </div>
    );
}