import { jsPDF } from "jspdf";

export function handleDownload(file: File | null, summary: string) {
    type TextSegment = { text: string; bold: boolean };

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 48;
    const maxWidth = 432;
    let y = 60;

    const addPage = () => {
        doc.addPage();
        y = 48;
    };

    const checkY = (needed: number) => {
        if (y + needed > doc.internal.pageSize.getHeight() - 48) addPage();
    };

    const cleanInline = (value: string): TextSegment[] => {
        const parts = value.split(/(\*\*[^*]+\*\*)/g);
        return parts.map(part => ({
            text: part.replace(/\*\*/g, ""),
            bold: part.startsWith("**") && part.endsWith("**")
        }));
    };

    const writeSegments = (segments: TextSegment[], x: number, lineHeight = 14) => {
        let currentX = x;
        const pageBottom = doc.internal.pageSize.getHeight() - 48;

        for (const seg of segments) {
            doc.setFont("helvetica", seg.bold ? "bold" : "normal");
            const words = seg.text.split(/(\s+)/);

            for (const word of words) {
                if (!word) continue;
                const width = doc.getTextWidth(word);
                if (currentX + width > margin + maxWidth) {
                    y += lineHeight;
                    currentX = x;
                    if (y > pageBottom) addPage();
                    if (word.trim() === '') continue;
                }
                doc.text(word, currentX, y);
                currentX += width;
            }
        }
        y += lineHeight + 4;
    };

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(17, 24, 39);
    const baseName = file?.name.replace(/\.pdf$/i, "") ?? "Summary";
    doc.text(baseName, margin, y); y += 32;

    for (const line of summary.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed) { y += 8; continue; }

        if (/^#{1,2}\s/.test(trimmed)) {
            checkY(28);
            doc.setFontSize(13);
            doc.setTextColor(17, 24, 39);
            writeSegments(
                cleanInline(trimmed.replace(/^#{1,2}\s/, "")).map(s => ({ ...s, bold: true })),
                margin,
                20,
            );
        } else if (/^###\s/.test(trimmed)) {
            checkY(22);
            doc.setFontSize(11);
            doc.setTextColor(55, 65, 81);
            writeSegments(
                cleanInline(trimmed.replace(/^###\s/, "")).map(s => ({ ...s, bold: true })),
                margin,
                16,
            );
        } else if (/^[-•*]\s/.test(trimmed)) {
            const segments = cleanInline(trimmed.replace(/^[-•*]\s/, ""));
            checkY(14);
            doc.setFontSize(10);
            doc.setTextColor(55, 65, 81);
            doc.text("•", margin, y);
            writeSegments(segments, margin + 12, 14);
        } else if (/^\d+\.\s/.test(trimmed)) {
            const segments = cleanInline(trimmed.replace(/^\d+\.\s/, ""));
            checkY(14);
            doc.setFontSize(10);
            doc.setTextColor(55, 65, 81);
            const num = trimmed.match(/^\d+\./)?.[0] ?? "1.";
            doc.text(num, margin, y);
            writeSegments(segments, margin + 16, 14);
        } else {
            const segments = cleanInline(trimmed);
            checkY(14);
            doc.setFontSize(10);
            doc.setTextColor(75, 85, 99);
            writeSegments(segments, margin, 14);
        }
    }

    doc.save(`${file?.name.replace(".pdf", "") ?? "summary"}-summary.pdf`);
};