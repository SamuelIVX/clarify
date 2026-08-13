/**
 * Inline Q/A label row (e.g. "Q:", "A:") with per-type accent colors.
 */
import { QACardProps } from "./types"

/**
 * Inline Q/A label row with accent colors.
 * @param type - Short label (e.g. "Q:" / "A:").
 * @param description - Question or answer text.
 * @param color - Tailwind class bags for span/accent/text.
 * @param padding - Wrapper padding classes.
 * @param fontSize - Text size classes for the description.
 * @returns The labeled Q/A row.
 */
export default function QACard({ type, description, color, padding, fontSize }: QACardProps) {
    return (
        <div className={`flex items-baseline gap-1.5 ${padding}`}>
            <span className={`shrink-0 text-xs font-semibold uppercase ${color.span} tracking-wide ${color.accent}`}>
                {type}
            </span>
            <p className={`text-sm ${fontSize} ${color.text} `}>{description}</p>
        </div>
    )
}