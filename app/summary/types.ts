export type Mood = "tired" | "stressed" | "annoyed" | "curious";

export type MoodOption = { value: Mood; label: string; description: string };

export const moods: MoodOption[] = [
    { value: "tired", label: "😴 Tired", description: "5 bullets, bare minimum" },
    { value: "stressed", label: "😰 Stressed", description: "Top 3 critical points" },
    { value: "annoyed", label: "😤 Annoyed", description: "Blunt, no fluff" },
    { value: "curious", label: "🤓 Curious", description: "Deep dive with context" },
];