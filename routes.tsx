import { createBrowserRouter } from "react-router";

import { Root } from "@/app/components/Root";
/*import { Home } from "@/app/components/Home";
import { PdfToFlashcards } from "@/app/components/PdfToFlashcards";
import { CrammingSession } from "@/app/components/CrammingSession";
import { Summary } from "@/app/components/Summary";
import { Settings } from "@/app/components/Settings";*/

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "flashcards", Component: PdfToFlashcards },
      { path: "cramming", Component: CrammingSession },
      { path: "summary", Component: Summary },
      { path: "settings", Component: Settings },
    ],
  },
]);