import { Loader2 } from "lucide-react";

export default function ProcessingPDF({ stage }: { stage: "extracting" | "summarizing" }) {
    return (
        <div className="mt-6 bg-pink-50 border border-pink-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
                <Loader2 className="w-6 h-6 text-pink-600 animate-spin" />
                <p className="font-medium text-pink-900">Generating summary...</p>
            </div>
            <div className="space-y-2 text-sm text-pink-700">
                <p className={stage === "extracting" ? "animate-pulse" : "opacity-50"}>
                    {stage === "extracting" ? "⟳" : "✓"} Extracting text from PDF...
                </p>
                <p className={stage === "summarizing" ? "animate-pulse" : "opacity-30"}>
                    {stage === "summarizing" ? "⟳" : "·"} Summarizing with AI...
                </p>
            </div>
        </div>
    )
}