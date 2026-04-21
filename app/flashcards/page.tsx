'use client'
import { useState } from "react";
import { deckAccentClasses } from "@/app/utils/deckAccents";
import { FlashcardDeck, View } from "./types";
import { loadDecks, saveDecks } from "@/utils/flashcardStorage";
import CreateDeckView from "@/components/flashcards/CreateDeckView";
import EditDeckView from "@/components/flashcards/EditDeckView";
import ConfirmDeleteModal from "@/components/flashcards/ConfirmDeleteModal";
import DeckCard from "@/components/flashcards/DeckCard";
import { BookOpen, Plus } from "lucide-react";

export default function FlashcardsPage() {
  const [decks, setDecks] = useState<FlashcardDeck[]>(() => loadDecks());
  const [view, setView] = useState<View>("list");
  const [editingDeck, setEditingDeck] = useState<FlashcardDeck | null>(null);
  const [expandedDeck, setExpandedDeck] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleSaveEdit = (updated: FlashcardDeck) => {
    const newDecks = decks.map(d => d.id === updated.id ? updated : d);
    saveDecks(newDecks);
    setDecks(newDecks);
    setView("list");
    setEditingDeck(null);
  };

  const handleDelete = (id: string) => {
    const newDecks = decks.filter(d => d.id !== id);
    saveDecks(newDecks);
    setDecks(newDecks);
    setDeleteId(null);
  };

  const handleCreated = (deck: FlashcardDeck) => {
    setDecks(loadDecks());
    setView("list");
    setExpandedDeck(deck.id);
  };

  if (view === "create") return <CreateDeckView onCreated={handleCreated} onCancel={() => setView("list")} />;
  if (view === "edit" && editingDeck) return <EditDeckView deck={editingDeck} onSave={handleSaveEdit} onCancel={() => { setView("list"); setEditingDeck(null); }} />;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {deleteId && (
        <ConfirmDeleteModal
          message="This deck and all its cards will be permanently deleted."
          onConfirm={() => handleDelete(deleteId)}
          onCancel={() => setDeleteId(null)}
        />
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Flashcard Decks</h1>
          <p className="text-gray-600 mt-2">{decks.length} deck{decks.length !== 1 ? "s" : ""} saved</p>
        </div>
        <button onClick={() => setView("create")} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
          <Plus className="w-4 h-4" /> New Deck
        </button>
      </div>

      {decks.length === 0 ? (
        <div className="bg-white rounded-2xl shadow border border-gray-200 p-16 text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No decks yet</h2>
          <p className="text-gray-500 mb-6">Upload a PDF to generate your first flashcard deck</p>
          <button onClick={() => setView("create")} className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
            <Plus className="w-4 h-4" /> Create First Deck
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {decks.map((deck, i) => (
            <DeckCard
              key={deck.id}
              deck={deck}
              accent={deckAccentClasses[i % deckAccentClasses.length]}
              isExpanded={expandedDeck === deck.id}
              onToggleExpand={() =>
                setExpandedDeck(expandedDeck === deck.id ? null : deck.id)
              }
              onEdit={() => {
                setEditingDeck(deck);
                setView("edit");
              }}
              onDelete={() => setDeleteId(deck.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
