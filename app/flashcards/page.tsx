'use client'
import { useState, useEffect, useRef } from "react";
import { deckAccentClasses } from "@/app/utils/deckAccents";
import {
  Upload, FileText, AlertCircle, BookOpen, Loader2,
  ChevronDown, ChevronUp, Pencil, Trash2, Plus, Save, X, Check,
  MessageSquare, Send
} from "lucide-react";
import Link from "next/link";

type Mood = "tired" | "stressed" | "annoyed" | "curious";
type View = "list" | "create" | "edit";
type CreateMode = "pdf" | "chat";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const moods: { value: Mood; label: string; description: string }[] = [
  { value: "tired", label: "😴 Tired", description: "5 simple cards" },
  { value: "stressed", label: "😰 Stressed", description: "3 critical cards" },
  { value: "annoyed", label: "😤 Annoyed", description: "5 blunt cards" },
  { value: "curious", label: "🤓 Curious", description: "10 detailed cards" },
];

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  createdAt: number;
}

interface FlashcardDeck {
  id: string;
  name: string;
  flashcards: Flashcard[];
  createdAt: number;
}

function loadDecks(): FlashcardDeck[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem("flashcard_decks") || "[]"); }
  catch { return []; }
}

function saveDecks(decks: FlashcardDeck[]) {
  localStorage.setItem("flashcard_decks", JSON.stringify(decks));
}

// ─── Confirm Delete Modal ──────────────────────────────────────────────────────
function ConfirmDeleteModal({ message, onConfirm, onCancel }: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelRef.current?.focus();
    const handleEscape = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onCancel} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-delete-title"
        className="relative bg-white rounded-xl shadow-xl border border-gray-200 p-6 max-w-sm w-full mx-4"
      >
        <div className="flex items-start gap-3 mb-5">
          <div className="shrink-0 w-9 h-9 rounded-full bg-red-100 flex items-center justify-center">
            <Trash2 className="w-4 h-4 text-red-600" />
          </div>
          <div>
            <p id="confirm-delete-title" className="font-semibold text-gray-900">Confirm Delete</p>
            <p className="text-sm text-gray-500 mt-0.5">{message}</p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button ref={cancelRef} onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Deck View ───────────────────────────────────────────────────────────
function EditDeckView({ deck, onSave, onCancel }: {
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
    const newCard: Flashcard = { id: `${Date.now()}`, question: "", answer: "", createdAt: Date.now() };
    setCards(prev => [...prev, newCard]);
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

// ─── Chat Deck Creator ────────────────────────────────────────────────────────
const CHAT_GREETING = "Hi! What topic would you like to create flashcards for? Tell me the subject and any detai like: the level of depth or specific areas to focus on and I'll generate a set for you.";

function ChatDeckCreator({ onCreated }: { onCreated: (deck: FlashcardDeck) => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: CHAT_GREETING },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingCards, setPendingCards] = useState<{ question: string; answer: string }[] | null>(null);
  const [deckName, setDeckName] = useState("");
  const [error, setError] = useState<string | null>(null);
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

      if (data.flashcards && data.flashcards.length > 0) {
        setPendingCards(data.flashcards);
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
    if (!pendingCards) return;
    const newDeck: FlashcardDeck = {
      id: `deck-${Date.now()}`,
      name: deckName.trim() || "AI Generated Deck",
      createdAt: Date.now(),
      flashcards: pendingCards.map((card, i) => ({
        id: `${Date.now()}-${i}`,
        question: card.question,
        answer: card.answer,
        createdAt: Date.now(),
      })),
    };
    const existing = loadDecks();
    saveDecks([...existing, newDeck]);
    onCreated(newDeck);
  };

  return (
    <div className="space-y-4">
      {/* Chat window */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
        <div className="h-72 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
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

          <button onClick={handleSaveDeck} className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
            <Save className="w-4 h-4" /> Save Deck
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Create Deck View ─────────────────────────────────────────────────────────
function CreateDeckView({ onCreated, onCancel }: {
  onCreated: (deck: FlashcardDeck) => void;
  onCancel: () => void;
}) {
  const [createMode, setCreateMode] = useState<CreateMode>("pdf");
  const [file, setFile] = useState<File | null>(null);
  const [deckName, setDeckName] = useState("");
  const [mood, setMood] = useState<Mood>("curious");
  const [stage, setStage] = useState<"extracting" | "generating" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;
    if (uploaded.type !== "application/pdf") { setError("Please upload a PDF file"); return; }
    setFile(uploaded);
    setDeckName(uploaded.name.replace(".pdf", ""));
    setError(null);
  };

  const handleGenerate = async () => {
    if (!file) return;
    setStage("extracting");
    setError(null);
    try {
      const formData = new FormData();
      formData.append("pdf", file);
      const extractRes = await fetch("/api/extract", { method: "POST", body: formData });
      const extractData = await extractRes.json();
      if (!extractRes.ok) throw new Error(extractData.error || "Failed to extract PDF text");

      setStage("generating");
      const flashRes = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: extractData.text.slice(0, 20000), mood }),
      });
      const flashData = await flashRes.json();
      if (!flashRes.ok) throw new Error(flashData.error || "Failed to generate flashcards");

      const newDeck: FlashcardDeck = {
        id: `deck-${Date.now()}`,
        name: deckName.trim() || file.name.replace(".pdf", ""),
        createdAt: Date.now(),
        flashcards: flashData.flashcards.map((card: { question: string; answer: string }, i: number) => ({
          id: `${Date.now()}-${i}`,
          question: card.question,
          answer: card.answer,
          createdAt: Date.now(),
        })),
      };

      const existing = loadDecks();
      saveDecks([...existing, newDeck]);
      onCreated(newDeck);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setStage(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">New Deck</h1>
          <p className="text-gray-600 mt-2">
            {createMode === "pdf" ? "Upload a PDF to generate flashcards" : "Describe a topic and let AI generate flashcards"}
          </p>
        </div>
        <button onClick={onCancel} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700">
          <X className="w-4 h-4" /> Cancel
        </button>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-6 w-fit">
        <button
          onClick={() => setCreateMode("pdf")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${createMode === "pdf" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
        >
          <Upload className="w-4 h-4" /> Upload PDF
        </button>
        <button
          onClick={() => setCreateMode("chat")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${createMode === "chat" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
        >
          <MessageSquare className="w-4 h-4" /> Chat with AI
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        {createMode === "chat" ? (
          <ChatDeckCreator onCreated={onCreated} />
        ) : (
        <>
        <label htmlFor="pdf-upload" className={`block border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${file ? "border-indigo-400 bg-indigo-50" : "border-gray-300 hover:border-indigo-400 hover:bg-gray-50"}`}>
          <input id="pdf-upload" type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
          <div className="flex flex-col items-center gap-4">
            {file ? (
              <>
                <FileText className="w-16 h-16 text-indigo-600" />
                <div>
                  <p className="text-lg font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </>
            ) : (
              <>
                <Upload className="w-16 h-16 text-gray-400" />
                <div>
                  <p className="text-lg font-medium text-gray-900">Click to upload a PDF</p>
                  <p className="text-sm text-gray-500 mt-1">Upload your study material to generate flashcards</p>
                </div>
              </>
            )}
          </div>
        </label>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-900">{error}</p>
          </div>
        )}

        {file && !stage && (
          <>
            {/* Deck name input */}
            <div className="mt-6">
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Deck name</label>
              <input
                value={deckName}
                onChange={e => setDeckName(e.target.value)}
                placeholder="e.g. Biology Chapter 4"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-indigo-400"
              />
            </div>

            <div className="mt-6">
              <p className="text-sm font-medium text-gray-700 mb-3">How are you feeling?</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {moods.map(m => (
                  <button key={m.value} onClick={() => setMood(m.value)} className={`p-3 rounded-lg border text-left transition-all ${mood === m.value ? "border-indigo-400 bg-indigo-50" : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"}`}>
                    <p className="font-medium text-sm text-gray-900">{m.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{m.description}</p>
                  </button>
                ))}
              </div>
            </div>
            <button onClick={handleGenerate} className="mt-4 w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
              <BookOpen className="w-5 h-5" /> Generate Flashcards
            </button>
          </>
        )}

        {stage && (
          <div className="mt-6 bg-indigo-50 border border-indigo-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
              <p className="font-medium text-indigo-900">Generating flashcards...</p>
            </div>
            <div className="space-y-2 text-sm text-indigo-700">
              <p className={stage === "extracting" ? "animate-pulse" : "opacity-50"}>{stage === "extracting" ? "⟳" : "✓"} Extracting text from PDF...</p>
              <p className={stage === "generating" ? "animate-pulse" : "opacity-30"}>{stage === "generating" ? "⟳" : "○"} Generating flashcards with AI...</p>
            </div>
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
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
          {decks.map((deck, i) => {
            const accent = deckAccentClasses[i % deckAccentClasses.length];
            return (
            <div key={deck.id} className={`bg-white rounded-xl shadow-sm border border-gray-200 border-l-4 ${accent.border} overflow-hidden hover:shadow-md transition-shadow`}>
              {/* Deck Header */}
              <div className="flex items-center gap-4 p-5">
                <button onClick={() => setExpandedDeck(expandedDeck === deck.id ? null : deck.id)} className="flex-1 flex items-center gap-3 text-left min-w-0">
                  <div className={`shrink-0 w-9 h-9 rounded-lg ${accent.iconBg} flex items-center justify-center`}>
                    <BookOpen className={`w-4 h-4 ${accent.iconText}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 truncate">{deck.name}</h3>
                      <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${accent.badge}`}>{deck.flashcards.length} cards</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5" suppressHydrationWarning>Created {new Date(deck.createdAt).toLocaleDateString()}</p>
                  </div>
                  {expandedDeck === deck.id ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                </button>
                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/cramming?deckId=${deck.id}`} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${accent.badge} hover:opacity-80`}>
                    <BookOpen className="w-3.5 h-3.5" /> Study
                  </Link>
                  <button onClick={() => { setEditingDeck(deck); setView("edit"); }} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteId(deck.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expanded Cards */}
              {expandedDeck === deck.id && (
                <div className="border-t border-gray-100 divide-y divide-gray-100 max-h-80 overflow-y-auto">
                  {deck.flashcards.map((card, ci) => (
                    <div key={card.id} className="flex gap-3 px-5 py-3">
                      <span className={`shrink-0 w-5 h-5 rounded-full ${accent.iconBg} ${accent.iconText} text-xs font-bold flex items-center justify-center mt-0.5`}>{ci + 1}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-1.5">
                          <span className={`shrink-0 text-xs font-semibold uppercase tracking-wide ${accent.iconText}`}>Q</span>
                          <p className="text-sm font-medium text-gray-900">{card.question}</p>
                        </div>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className="shrink-0 text-xs font-semibold text-green-500 uppercase tracking-wide">A</span>
                          <p className="text-sm text-gray-500">{card.answer}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
