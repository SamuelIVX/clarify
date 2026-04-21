import { QACardProps } from "./types"

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