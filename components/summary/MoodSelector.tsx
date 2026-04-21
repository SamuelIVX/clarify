"use client";

import { FileText } from "lucide-react";
import type { Mood, MoodOption } from "@/app/summary/types";

interface MoodSelectorProps {
  moods: MoodOption[];
  mood: Mood;
  onMoodChange: (value: Mood) => void;
  onGenerate: () => void;
}

export default function MoodSelector({ moods, mood, onMoodChange, onGenerate }: MoodSelectorProps) {
  return (
    <div className="mt-6">
      <p className="text-sm font-medium text-gray-700 mb-3">How are you feeling?</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {moods.map((m) => (
          <button
            type="button"
            key={m.value}
            onClick={() => onMoodChange(m.value)}
            className={`p-3 rounded-lg border text-left transition-all ${mood === m.value
              ? "border-pink-400 bg-pink-50"
              : "border-gray-200 hover:border-pink-300 hover:bg-gray-50"
              }`}
          >
            <p className="font-medium text-sm text-gray-900">{m.label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{m.description}</p>
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onGenerate}
        className="mt-4 w-full bg-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-pink-700 transition-colors flex items-center justify-center gap-2"
      >
        <FileText className="w-5 h-5" />
        Generate Summary
      </button>
    </div>
  );
}
