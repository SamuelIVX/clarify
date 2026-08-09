import { ModeToggleProps } from "./types"

export default function ModeToggle({ mode, targetMode, onModeChange, icon }: ModeToggleProps) {
    const isActive = mode === targetMode;

    return (
        <button
            type="button"
            onClick={() => onModeChange(targetMode)}
            aria-label={targetMode === "pdf" ? "PDF mode" : "Chat mode"}
            aria-pressed={isActive}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all 
                ${isActive ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
        >
            {icon}
        </button>
    )
}
