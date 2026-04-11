'use client'
import { useState } from "react";
import { Upload, FileText, AlertCircle, BookOpen } from "lucide-react";
import Link from "next/link";

export function PdfToFlashcards() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    if (uploadedFile.type !== "application/pdf") {
      setError("Please upload a PDF file");
      return;
    }

    setFile(uploadedFile);
    setError(null);
  };

  const handleReset = () => {
    setFile(null);
    setError(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">PDF to Flashcards</h1>
        <p className="text-gray-600 mt-2">
          Upload a PDF (processing feature coming soon)
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-8">
          <label
            htmlFor="pdf-upload"
            className={`block border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
              file
                ? "border-indigo-400 bg-indigo-50"
                : "border-gray-300 hover:border-indigo-400 hover:bg-gray-50"
            }`}
          >
            <input
              id="pdf-upload"
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
            />

            <div className="flex flex-col items-center gap-4">
              {file ? (
                <>
                  <FileText className="w-16 h-16 text-indigo-600" />
                  <div>
                    <p className="text-lg font-medium text-gray-900">
                      {file.name}
                    </p>
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
                      or drag and drop your study material here
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

          {file && !error && (
            <button
              className="mt-6 w-full bg-gray-400 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 cursor-not-allowed"
              disabled
            >
              <BookOpen className="w-5 h-5" />
              Generate Flashcards (Coming Soon)
            </button>
          )}
        </div>

      </div>

    </div>
  );
}

export default function FlashcardsPage() {
  return <PdfToFlashcards />;
}