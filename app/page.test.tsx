/**
 * Landing page smoke tests.
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "./page";

describe("Home page", () => {
    it("renders the app title and tagline", () => {
        render(<Home />);
        expect(screen.getByRole("heading", { name: /clarify/i })).toBeInTheDocument();
        expect(screen.getByText(/transform your study materials/i)).toBeInTheDocument();
    });

    it("renders all three feature cards linking to the right routes", () => {
        render(<Home />);
        expect(screen.getByRole("heading", { name: "PDF to Flashcards" })).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Cramming Session" })).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "AI Summary" })).toBeInTheDocument();

        expect(screen.getByRole("link", { name: /pdf to flashcards/i })).toHaveAttribute("href", "/flashcards");
        expect(screen.getByRole("link", { name: /cramming session/i })).toHaveAttribute("href", "/cramming");
        expect(screen.getByRole("link", { name: /ai summary/i })).toHaveAttribute("href", "/summary");
    });
});
