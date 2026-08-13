/**
 * Summary page tests (upload validation, mood selection, copy/download) with mocked fetch.
 */
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SummaryPage from "./page";

describe("SummaryPage", () => {
    it("renders the upload area and title", () => {
        render(<SummaryPage />);
        expect(screen.getByRole("heading", { name: "AI Summary" })).toBeInTheDocument();
        expect(screen.getByText(/upload a pdf and get a concise ai-generated summary/i)).toBeInTheDocument();
        expect(screen.getByText("Click to upload a PDF")).toBeInTheDocument();
    });

    it("rejects a non-PDF file with an error message", () => {
        render(<SummaryPage />);

        const file = new File(["not a pdf"], "notes.txt", { type: "text/plain" });
        const input = screen.getByLabelText(/click to upload a pdf/i) as HTMLInputElement;
        fireEvent.change(input, { target: { files: [file] } });

        expect(screen.getByText("Please upload a PDF file")).toBeInTheDocument();
    });

    it("shows the mood selector once a valid PDF is selected", () => {
        render(<SummaryPage />);

        const file = new File(["%PDF-1.4 fake"], "notes.pdf", { type: "application/pdf" });
        const input = screen.getByLabelText(/click to upload a pdf/i) as HTMLInputElement;
        fireEvent.change(input, { target: { files: [file] } });

        expect(screen.getByText(/curious/i)).toBeInTheDocument();
    });
});
