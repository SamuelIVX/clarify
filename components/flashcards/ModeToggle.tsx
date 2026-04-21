import { ModeToggleProps } from "./types"

export default function ModeToggle({ mode, onModeChange, icon }: ModeToggleProps) {
    return (
        <button
            onClick={() => onModeChange(mode === "pdf" ? "chat" : "pdf")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all 
                ${mode === "pdf" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
        >
            {icon}
        </button>
    )
}