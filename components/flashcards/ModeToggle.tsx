/**
 * Toggle button used to switch between the PDF and chat creation modes.
 */
import { ModeToggleProps } from "./types"

/**
 * Segment control button for PDF vs chat create modes.
 * @param mode - Currently active create mode.
 * @param targetMode - Mode this button selects.
 * @param onModeChange - Called with `targetMode` on click.
 * @param icon - Leading icon for the button.
 * @returns The mode toggle button.
 */
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
