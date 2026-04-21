'use client';

import { useState } from "react";
import { AlertCircle, BookOpen, MessageSquare, Upload, X, FileText, Loader2 } from "lucide-react";
import ChatDeckCreator from "./ChatDeckCreator";
import { FlashcardDeck, CreateMode, Mood, moods } from "@/app/flashcards/types";
import { loadDecks, saveDecks } from "@/utils/flashcardStorage";
import ModeToggle from "./ModeToggle";

export default function CreateDeckView({ onCreated, onCancel }: {
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
                <ModeToggle
                    mode={"pdf"}
                    onModeChange={setCreateMode}
                    icon={<Upload className="w-4 h-4" />}
                />

                <ModeToggle
                    mode={"chat"}
                    onModeChange={setCreateMode}
                    icon={<MessageSquare className="w-4 h-4" />}
                />
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