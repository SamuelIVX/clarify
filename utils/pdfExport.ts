import { jsPDF } from "jspdf";

export function handleDownload(file: File | null, summary: string) {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 48;
    const maxWidth = pageWidth - margin * 2;
    let y = 60;

    const addPage = () => {
        doc.addPage();
        y = 48;
    };

    const checkY = (needed: number) => {
        if (y + needed > doc.internal.pageSize.getHeight() - 48) addPage();
    };

    const writeWrapped = (wrapped: string[], x: number, lineHeight = 14, gap = 2) => {
        const pageBottom = doc.internal.pageSize.getHeight() - 48;

        while (wrapped.length > 0) {
            const available = Math.floor((pageBottom - y) / lineHeight);
            if (available <= 0) {
                addPage();
                continue;
            }

            const chunk = wrapped.splice(0, available);
            doc.text(chunk, x, y);
            y += chunk.length * lineHeight + gap;

            if (wrapped.length > 0) addPage();
        }
    };

    const cleanInline = (value: string) => value.replace(/\*\*([^*]+)\*\*/g, "$1");

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(17, 24, 39);
    doc.text(file?.name.replace(".pdf", "") ?? "Summary", margin, y);
    y += 32;

    for (const line of summary.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed) { y += 8; continue; }

        if (/^#{1,2}\s/.test(trimmed)) {
            checkY(28);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(13);
            doc.setTextColor(17, 24, 39);
            doc.text(trimmed.replace(/^#{1,3}\s/, ""), margin, y);
            y += 20;
        } else if (/^###\s/.test(trimmed)) {
            checkY(22);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.setTextColor(55, 65, 81);
            doc.text(trimmed.replace(/^###\s/, ""), margin, y);
            y += 16;
        } else if (/^[-•*]\s/.test(trimmed)) {
            const text = cleanInline(trimmed.replace(/^[-•*]\s/, ""));
            const wrapped = doc.splitTextToSize(`• ${text}`, maxWidth - 12);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.setTextColor(55, 65, 81);
            writeWrapped([...wrapped], margin + 8);
        } else if (/^\d+\.\s/.test(trimmed)) {
            const wrapped = doc.splitTextToSize(cleanInline(trimmed), maxWidth - 12);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.setTextColor(55, 65, 81);
            writeWrapped([...wrapped], margin + 8);
        } else {
            const clean = cleanInline(trimmed);
            const wrapped = doc.splitTextToSize(clean, maxWidth);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.setTextColor(75, 85, 99);
            writeWrapped([...wrapped], margin, 14, 4);
        }
    }

    doc.save(`${file?.name.replace(".pdf", "") ?? "summary"}-summary.pdf`);
};