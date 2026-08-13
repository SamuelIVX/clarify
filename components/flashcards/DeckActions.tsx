/**
 * Small icon-button group for per-deck actions (edit/delete), colorized by
 * the `hoverColor` prop.
 */
import { DeckActionProps } from "./types"

/**
 * Icon button for a single deck action (edit/delete).
 * @param onChange - Click handler.
 * @param ariaLabel - Accessible name for the control.
 * @param hoverColor - Hover accent key (`indigo` | `red`).
 * @param icon - Icon node to render inside the button.
 * @returns The action button.
 */
export default function DeckActions({ onChange, ariaLabel, hoverColor, icon }: DeckActionProps) {

    const hoverClasses: Record<string, string> = {
        indigo: "hover:text-indigo-600 hover:bg-indigo-50",
        red: "hover:text-red-600 hover:bg-red-50",
    };

    return (
        <button
            onClick={onChange}
            aria-label={ariaLabel}
            className={`p-1.5 text-gray-400 ${hoverClasses[hoverColor] ?? ""} rounded-lg transition-colors`}
        >
            {icon}
        </button>
    )
}