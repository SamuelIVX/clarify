"use client";
import { useState, type ChangeEvent } from "react";
import { Upload, FileText, Loader2, AlertCircle, Copy, Check, Download } from "lucide-react";

export default function SummaryPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
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

  const handleGenerateSummary = () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    window.setTimeout(() => {
      const generatedSummary = [
        `Summary preview for ${file.name}`,
        "",
        "This is a frontend-only placeholder summary.",
        "",
        "Main ideas:",
        "- Key concepts are grouped into a short, readable format.",
        "- Important details are highlighted for quick review.",
        "- Complex sections are condensed into actionable points.",
        "",
        "Next steps:",
        "- Replace this placeholder with your real summary service when ready.",
      ].join("\n");

      setSummary(generatedSummary);
      setLoading(false);
    }, 900);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([summary], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${file?.name.replace(".pdf", "")}-summary.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
              className={`block border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                file
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
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-900">{error}</p>
              </div>
            )}

            {file && !loading && !error && (
              <button
                onClick={handleGenerateSummary}
                className="mt-6 w-full bg-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-pink-700 transition-colors flex items-center justify-center gap-2"
              >
                <FileText className="w-5 h-5" />
                Generate Summary
              </button>
            )}

            {loading && (
              <div className="mt-6 bg-pink-50 border border-pink-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Loader2 className="w-6 h-6 text-pink-600 animate-spin" />
                  <p className="font-medium text-pink-900">Generating summary...</p>
                </div>
                <div className="space-y-2 text-sm text-pink-700">
                  <p>✓ Extracting text from PDF</p>
                  <p className="animate-pulse">⟳ Analyzing and summarizing content...</p>
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
          <div className="bg-white rounded-lg shadow border border-gray-200 p-8">
            <div
              className="prose prose-sm max-w-none"
              style={{
                whiteSpace: "pre-wrap",
                lineHeight: "1.8",
              }}
            >
              {summary}
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
