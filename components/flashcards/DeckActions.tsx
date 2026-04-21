import { DeckActionProps } from "./types"

export default function DeckActions({ onEdit, ariaLabel, hoverColor, icon }: DeckActionProps) {
    return (
        <button
            onClick={onEdit}
            aria-label={ariaLabel}
            className={`p-1.5 text-gray-400 hover:text-${hoverColor}-600 hover:bg-${hoverColor}-50 rounded-lg transition-colors`}
        >
            {icon}
        </button>
    )
}