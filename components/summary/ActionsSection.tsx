export default function ActionsSection({ handleReset }: { handleReset: () => void }) {
    return (
        <div className="flex justify-center">
            <button
                onClick={handleReset}
                className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
                Summarize Another PDF
            </button>
        </div>
    )
}