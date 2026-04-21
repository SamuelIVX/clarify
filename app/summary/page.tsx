"use client";
import { useState, type ChangeEvent } from "react";
import { Upload, FileText, Loader2, AlertCircle, Copy, Check, Download } from "lucide-react";
import { Mood, moods } from "./types";
import { handleDownload } from "@/utils/pdfExport";
import FileUpload from "@/components/summary/FileUpload";
import SummaryContent from "@/components/summary/SummaryContent";
import ActionsSection from "@/components/summary/ActionsSection";
import ProcessingPDF from "@/components/summary/ProcessingPDF";
import MoodSelector from "@/components/summary/MoodSelector";

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
                  <FileUpload
                    title={file.name}
                    description={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                    icon={<FileText className="w-16 h-16 text-pink-600" />}
                  />
                ) : (
                  <FileUpload
                    title="Click to upload a PDF"
                    description="Upload your study material to get an AI summary"
                    icon={<Upload className="w-16 h-16 text-gray-400" />}
                  />
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
              <MoodSelector
                moods={moods}
                mood={mood}
                onMoodChange={setMood}
                onGenerate={handleGenerateSummary}
              />
            )}

            {stage && (
              <ProcessingPDF stage={stage} />
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
                  onClick={() => handleDownload(file, summary)}
                  className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>
          </div>

          {/* Summary Content */}
          <SummaryContent summary={summary} />

          {/* Actions */}
          <ActionsSection handleReset={handleReset} />

        </div>
      )}
    </div>
  );
}
