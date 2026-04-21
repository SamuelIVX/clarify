'use client';

import { useEffect, useRef, useState } from "react";
import { AlertCircle, Save, Send } from "lucide-react";
import { ChatMessage, FlashcardDeck } from "@/app/flashcards/types";
import { loadDecks, saveDecks } from "@/utils/flashcardStorage";

const CHAT_GREETING = "Hi! What topic would you like to create flashcards for? Tell me the subject and any details like the level of depth or specific areas to focus on, and I'll generate a set for you.";

export default function ChatDeckCreator({ onCreated }: { onCreated: (deck: FlashcardDeck) => void }) {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: "assistant", content: CHAT_GREETING },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [pendingCards, setPendingCards] = useState<{ question: string; answer: string }[] | null>(null);
    const [deckName, setDeckName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [hasSaved, setHasSaved] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const apiMessages = useRef<ChatMessage[]>([]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    const sendMessage = async () => {
        const text = input.trim();
        if (!text || isLoading) return;
        setInput("");
        setError(null);
        setPendingCards(null);

        const userMsg: ChatMessage = { role: "user", content: text };
        apiMessages.current = [...apiMessages.current, userMsg];
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            const res = await fetch("/api/chat-flashcards", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: apiMessages.current }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to get response");

            const assistantMsg: ChatMessage = { role: "assistant", content: data.message || "" };
            apiMessages.current = [...apiMessages.current, assistantMsg];
            setMessages(prev => [...prev, assistantMsg]);

            const flashcards = Array.isArray(data.flashcards)
                ? data.flashcards.filter(
                    (card: unknown): card is { question: string; answer: string } =>
                        typeof card === "object" &&
                        card !== null &&
                        typeof (card as { question?: unknown }).question === "string" &&
                        typeof (card as { answer?: unknown }).answer === "string"
                )
                : [];

            if (data.flashcards != null && flashcards.length === 0) {
                throw new Error("The generated flashcards were malformed");
            }

            if (flashcards.length > 0) {
                setPendingCards(flashcards);
            }

        } catch (err) {
            apiMessages.current = apiMessages.current.slice(0, -1);
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    };

    const handleSaveDeck = () => {
        if (!pendingCards || hasSaved) return;
        const now = Date.now();

        const newDeck: FlashcardDeck = {
            id: `deck-${now}`,
            name: deckName.trim() || "AI Generated Deck",
            createdAt: now,
            flashcards: pendingCards.map((card, i) => ({
                id: `${now}-${i}`,
                question: card.question,
                answer: card.answer,
                createdAt: now,
            })),
        };
        const existing = loadDecks();
        if (!saveDecks([...existing, newDeck])) {
            setError("Could not save deck. Your browser storage may be full or unavailable.");
            return;
        }
        setHasSaved(true);
        setPendingCards(null);
        onCreated(newDeck);
    };

    return (
        <div className="space-y-4">
            {/* Chat window */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                <div className="h-72 overflow-y-auto p-4 space-y-3">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.role === "user"
                                ? "bg-indigo-600 text-white rounded-br-sm"
                                : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm"
                                }`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3">
                                <div className="flex gap-1 items-center">
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <div className="border-t border-gray-200 p-3 flex gap-2 bg-white">
                    <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Describe a topic to study..."
                        disabled={isLoading}
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-indigo-400 disabled:opacity-50"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!input.trim() || isLoading}
                        aria-label="Send message"
                        className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-900">{error}</p>
                </div>
            )}

            {/* Generated flashcards preview + save */}
            {pendingCards && pendingCards.length > 0 && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="font-semibold text-indigo-900">{pendingCards.length} flashcards ready</p>
                        <span className="text-xs text-indigo-500">Ask for changes or save below</span>
                    </div>

                    <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
                        {pendingCards.map((card, i) => (
                            <div key={i} className="bg-white rounded-lg border border-indigo-100 p-3">
                                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-0.5">Q</p>
                                <p className="text-sm font-medium text-gray-900">{card.question}</p>
                                <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mt-2 mb-0.5">A</p>
                                <p className="text-sm text-gray-600">{card.answer}</p>
                            </div>
                        ))}
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1.5">Deck name</label>
                        <input
                            value={deckName}
                            onChange={e => setDeckName(e.target.value)}
                            placeholder="e.g. Biology – Photosynthesis"
                            className="w-full border border-indigo-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-indigo-400 bg-white"
                        />
                    </div>

                    <button
                        onClick={handleSaveDeck}
                        disabled={isLoading || hasSaved}
                        className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <Save className="w-4 h-4" /> Save Deck
                    </button>
                </div>
            )
            }
        </div >
    );
}