/**
 * Landing-page accessibility check using axe.
 */
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import axe from "axe-core";
import Home from "./page";

describe("a11y", () => {
    it("home page has no critical or serious axe violations", async () => {
        const { container } = render(<Home />);
        const results = await axe.run(container, {
            rules: {
                "color-contrast": { enabled: false },
            },
        });
        const violations = results.violations.filter((v) =>
            v.impact === "critical" || v.impact === "serious"
        );
        expect(violations).toEqual([]);
    });
});
