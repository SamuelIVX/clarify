import { DeckActionProps } from "./types"

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