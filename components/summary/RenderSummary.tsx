export default function RenderSummary({ summary }: { summary: string }) {
    const lines = summary.split("\n");
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

    let bulletList: string[] = [];
    let numberedList: { num: string; text: string }[] = [];
    let listType: "bullet" | "numbered" | null = null;

    const flushBulletList = (startIdx: number) => {
        if (bulletList.length > 0) {
            elements.push(
                <ul key={`bullet-${startIdx}`} className="list-none my-2 space-y-1">
                    {bulletList.map((text, idx) => (
                        <li key={idx} className="flex items-start gap-2 py-0.5">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-pink-400 shrink-0" />
                            <span className="text-gray-700 text-sm leading-relaxed">
                                {renderInline(text, startIdx + idx)}
                            </span>
                        </li>
                    ))}
                </ul>
            );
            bulletList = [];
        }
    };

    const flushNumberedList = (startIdx: number) => {
        if (numberedList.length > 0) {
            elements.push(
                <ol key={`numbered-${startIdx}`} className="list-none my-2 space-y-1">
                    {numberedList.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3 py-0.5">
                            <span className="shrink-0 w-5 h-5 rounded-full bg-pink-100 text-pink-700 text-xs font-bold flex items-center justify-center mt-0.5">
                                {item.num}
                            </span>
                            <span className="text-gray-700 text-sm leading-relaxed">
                                {renderInline(item.text, startIdx + idx)}
                            </span>
                        </li>
                    ))}
                </ol>
            );
            numberedList = [];
        }
    };

    const flushLists = (idx: number) => {
        flushBulletList(idx);
        flushNumberedList(idx);
        listType = null;
    };

    lines.forEach((line, i) => {
        const trimmed = line.trim();

        if (!trimmed) {
            flushLists(i);
            elements.push(<div key={i} className="h-2" />);
        } else if (/^#{1,2}\s/.test(trimmed)) {
            flushLists(i);
            elements.push(
                <h2 key={i} className="text-lg font-bold text-gray-900 mt-4 mb-1 border-b border-gray-100 pb-1">
                    {renderInline(trimmed.replace(/^#{1,2}\s/, ""), i)}
                </h2>
            );
        } else if (/^###\s/.test(trimmed)) {
            flushLists(i);
            elements.push(
                <h3 key={i} className="text-base font-semibold text-gray-800 mt-3 mb-1">
                    {renderInline(trimmed.replace(/^###\s/, ""), i)}
                </h3>
            );
        } else if (/^[-•*]\s/.test(trimmed)) {
            if (listType !== "bullet") {
                flushLists(i);
                listType = "bullet";
            }
            bulletList.push(trimmed.replace(/^[-•*]\s/, ""));
        } else if (/^\d+\.\s/.test(trimmed)) {
            if (listType !== "numbered") {
                flushLists(i);
                listType = "numbered";
            }
            const num = trimmed.match(/^(\d+)\./)?.[1] ?? "1";
            numberedList.push({ num, text: trimmed.replace(/^\d+\.\s/, "") });
        } else {
            flushLists(i);
            elements.push(
                <p key={i} className="text-gray-700 text-sm leading-relaxed">
                    {renderInline(trimmed, i)}
                </p>
            );
        }
    });

    flushLists(lines.length);

    return elements;
}