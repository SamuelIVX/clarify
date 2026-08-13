/**
 * Scrollable wrapper that hosts the rendered summary inside a styled card.
 */
import RenderSummary from "./RenderSummary";

/**
 * Scrollable card that hosts the rendered summary.
 * @param summary - Raw model summary text.
 * @returns The summary card wrapper.
 */
export default function SummaryContent({ summary }: { summary: string }) {
    return (
        <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="overflow-y-auto max-h-[60vh] p-8">
                <div className="space-y-1">
                    <RenderSummary summary={summary} />
                </div>
            </div>
        </div>
    )
}