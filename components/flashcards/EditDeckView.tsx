'use client';

import { useState } from "react";
import { Check, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import { Flashcard, FlashcardDeck } from "@/app/flashcards/types";

export default function EditDeckView({ deck, onSave, onCancel }: {
    deck: FlashcardDeck;
    onSave: (updated: FlashcardDeck) => void;
    onCancel: () => void;
}) {
    const [name, setName] = useState(deck.name);
    const [cards, setCards] = useState<Flashcard[]>(deck.flashcards.map(c => ({ ...c })));
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const updateCard = (id: string, field: "question" | "answer", value: string) => {
        setCards(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
    };

    const addCard = () => {
        const newCard: Flashcard = {
            id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `card-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            question: "",
            answer: "",
            createdAt: Date.now(),
        }; setCards(prev => [...prev, newCard]);
        setEditingId(newCard.id);
    };

    const deleteCard = (id: string) => {
        setCards(prev => prev.filter(c => c.id !== id));
        setDeleteId(null);
        if (editingId === id) setEditingId(null);
    };

    const handleSave = () => {
        onSave({ ...deck, name: name.trim() || deck.name, flashcards: cards });
    };

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {deleteId && (
                <ConfirmDeleteModal
                    message="This card will be permanently removed from the deck."
                    onConfirm={() => deleteCard(deleteId)}
                    onCancel={() => setDeleteId(null)}
                />
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="text-3xl font-bold text-gray-900 bg-transparent border-b-2 border-transparent hover:border-gray-300 focus:border-indigo-500 focus:outline-none w-full max-w-lg"
                />
                <div className="flex gap-2 shrink-0 ml-4">
                    <button onClick={onCancel} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700">
                        <X className="w-4 h-4" /> Cancel
                    </button>
                    <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                        <Save className="w-4 h-4" /> Save
                    </button>
                </div>
            </div>

            <p className="text-sm text-gray-500 mb-6">{cards.length} cards · Click a card to edit</p>

            {/* Cards */}
            <div className="space-y-3 mb-6">
                {cards.map((card, index) => (
                    <div key={card.id} className={`bg-white rounded-lg border shadow-sm overflow-hidden transition-all ${editingId === card.id ? "border-indigo-300" : "border-gray-200"}`}>
                        {editingId === card.id ? (
                            <div className="p-4 space-y-3">
                                <div>
                                    <label className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Question</label>
                                    <textarea
                                        value={card.question}
                                        onChange={e => updateCard(card.id, "question", e.target.value)}
                                        className="mt-1 w-full border border-gray-200 rounded-lg p-2 text-sm text-gray-900 focus:outline-none focus:border-indigo-400 resize-none"
                                        rows={2}
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-green-600 uppercase tracking-wide">Answer</label>
                                    <textarea
                                        value={card.answer}
                                        onChange={e => updateCard(card.id, "answer", e.target.value)}
                                        className="mt-1 w-full border border-gray-200 rounded-lg p-2 text-sm text-gray-900 focus:outline-none focus:border-indigo-400 resize-none"
                                        rows={2}
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <button onClick={() => setEditingId(null)} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors">
                                        <Check className="w-3.5 h-3.5" /> Done
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-start gap-3 p-4">
                                <span className="shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center mt-0.5">
                                    {index + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 text-sm">{card.question || <span className="text-gray-400 italic">No question</span>}</p>
                                    <p className="text-gray-500 text-sm mt-0.5">{card.answer || <span className="italic">No answer</span>}</p>
                                </div>
                                <div className="flex gap-1 shrink-0">
                                    <button onClick={() => setEditingId(card.id)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors">
                                        <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => setDeleteId(card.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <button onClick={addCard} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 text-sm font-medium">
                <Plus className="w-4 h-4" /> Add Card
            </button>
        </div>
    );
}