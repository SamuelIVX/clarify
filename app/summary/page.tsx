"use client";
import { useState, type ChangeEvent } from "react";
import { Upload, FileText, Loader2, AlertCircle, Copy, Check, Download } from "lucide-react";
import jsPDF from "jspdf";

function renderSummary(text: string) {
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

type Mood = "tired" | "stressed" | "annoyed" | "curious";

const moods: { value: Mood; label: string; description: string }[] = [
  { value: "tired", label: "😴 Tired", description: "5 bullets, bare minimum" },
  { value: "stressed", label: "😰 Stressed", description: "Top 3 critical points" },
  { value: "annoyed", label: "😤 Annoyed", description: "Blunt, no fluff" },
  { value: "curious", label: "🤓 Curious", description: "Deep dive with context" },
];

export default function SummaryPage() {
  const [file, setFile] = useState<File | null>(null);
  const [mood, setMood] = useState<Mood>("curious");
  const [stage, setStage] = useState<"extracting" | "summarizing" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    if (uploadedFile.type !== "application/pdf") {
      setError("Please upload a PDF file");
      return;
    }

    setFile(uploadedFile);
    setError(null);
    setSummary("");
  };

  const handleGenerateSummary = async () => {
    if (!file) return;

    setStage("extracting");
    setError(null);

    try {
      // Step 1: Extract text from PDF
      const formData = new FormData();
      formData.append("pdf", file);
      const extractRes = await fetch("/api/extract", { method: "POST", body: formData });
      const extractData = await extractRes.json();
      if (!extractRes.ok) throw new Error(extractData.error || "Failed to extract PDF text");

      // Step 2: Generate summary
      setStage("summarizing");
      const summarizeRes = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: extractData.text, mood }),
      });
      const summarizeData = await summarizeRes.json();
      if (!summarizeRes.ok) throw new Error(summarizeData.error || "Failed to generate summary");

      setSummary(summarizeData.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setStage(null);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
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

  const handleReset = () => {
    setFile(null);
    setSummary("");
    setError(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">AI Summary</h1>
        <p className="text-gray-600 mt-2">
          Upload a PDF and get a concise AI-generated summary for quick review
        </p>
      </div>

      {!summary ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Upload Area */}
          <div className="p-8">
            <label
              htmlFor="pdf-upload-summary"
              className={`block border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${file
                ? "border-pink-400 bg-pink-50"
                : "border-gray-300 hover:border-pink-400 hover:bg-gray-50"
                }`}
            >
              <input
                id="pdf-upload-summary"
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div className="flex flex-col items-center gap-4">
                {file ? (
                  <>
                    <FileText className="w-16 h-16 text-pink-600" />
                    <div>
                      <p className="text-lg font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <Upload className="w-16 h-16 text-gray-400" />
                    <div>
                      <p className="text-lg font-medium text-gray-900">
                        Click to upload a PDF
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Upload your study material to get an AI summary
                      </p>
                    </div>
                  </>
                )}
              </div>
            </label>

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-900">{error}</p>
              </div>
            )}

            {file && !stage && (
              <>
                <div className="mt-6">
                  <p className="text-sm font-medium text-gray-700 mb-3">How are you feeling?</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {moods.map((m) => (
                      <button
                        key={m.value}
                        onClick={() => setMood(m.value)}
                        className={`p-3 rounded-lg border text-left transition-all ${mood === m.value
                          ? "border-pink-400 bg-pink-50"
                          : "border-gray-200 hover:border-pink-300 hover:bg-gray-50"
                          }`}
                      >
                        <p className="font-medium text-sm text-gray-900">{m.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{m.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={handleGenerateSummary}
                  className="mt-4 w-full bg-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-pink-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  Generate Summary
                </button>
              </>
            )}

            {stage && (
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
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Header */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{file?.name}</h2>
                <p className="text-gray-600 mt-1">Summary generated successfully</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-green-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>
          </div>

          {/* Summary Content */}
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="overflow-y-auto max-h-[60vh] p-8">
              <div className="space-y-1">
                {renderSummary(summary)}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center">
            <button
              onClick={handleReset}
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Summarize Another PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
