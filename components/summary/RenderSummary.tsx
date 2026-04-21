export default function RenderSummary(text: string) {
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];

    const renderInline = (line: string, key: number) => {
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
            <span key={key}>
                {parts.map((part, i) =>
                    part.startsWith("**") && part.endsWith("**")
                        ? <strong key={i} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>
                        : part
                )}
            </span>
        );
    };

    lines.forEach((line, i) => {
        const trimmed = line.trim();

        if (!trimmed) {
            elements.push(<div key={i} className="h-2" />);
        } else if (/^#{1,2}\s/.test(trimmed)) {
            elements.push(
                <h2 key={i} className="text-lg font-bold text-gray-900 mt-4 mb-1 border-b border-gray-100 pb-1">
                    {trimmed.replace(/^#{1,2}\s/, "")}
                </h2>
            );
        } else if (/^###\s/.test(trimmed)) {
            elements.push(
                <h3 key={i} className="text-base font-semibold text-gray-800 mt-3 mb-1">
                    {trimmed.replace(/^###\s/, "")}
                </h3>
            );
        } else if (/^[-•*]\s/.test(trimmed)) {
            elements.push(
                <div key={i} className="flex items-start gap-2 py-0.5">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-pink-400 shrink-0" />
                    <span className="text-gray-700 text-sm leading-relaxed">
                        {renderInline(trimmed.replace(/^[-•*]\s/, ""), i)}
                    </span>
                </div>
            );
        } else if (/^\d+\.\s/.test(trimmed)) {
            const num = trimmed.match(/^(\d+)\./)?.[1];
            elements.push(
                <div key={i} className="flex items-start gap-3 py-0.5">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-pink-100 text-pink-700 text-xs font-bold flex items-center justify-center mt-0.5">
                        {num}
                    </span>
                    <span className="text-gray-700 text-sm leading-relaxed">
                        {renderInline(trimmed.replace(/^\d+\.\s/, ""), i)}
                    </span>
                </div>
            );
        } else {
            elements.push(
                <p key={i} className="text-gray-700 text-sm leading-relaxed">
                    {renderInline(trimmed, i)}
                </p>
            );
        }
    });

    return elements;
}