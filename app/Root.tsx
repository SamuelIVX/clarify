import { Outlet, Link, useLocation } from "react-router";
import { BookOpen, Brain, FileText, Settings as SettingsIcon } from "lucide-react";

import { ChatBox } from "./ChatBox";

export function Root() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {!isHome && (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className="flex items-center gap-2">
                <Brain className="w-8 h-8 text-indigo-600" />
                <span className="text-xl font-semibold text-gray-900">Clarify</span>
              </Link>

              <nav className="flex gap-6">
                <Link
                  to="/flashcards"
                  className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                    location.pathname === "/flashcards"
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <BookOpen className="w-5 h-5" />
                  Flashcards
                </Link>
                <Link
                  to="/cramming"
                  className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                    location.pathname === "/cramming"
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <Brain className="w-5 h-5" />
                  Cramming
                </Link>
                <Link
                  to="/summary"
                  className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                    location.pathname === "/summary"
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  Summary
                </Link>
                <Link
                  to="/settings"
                  className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                    location.pathname === "/settings"
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <SettingsIcon className="w-5 h-5" />
                  Settings
                </Link>
              </nav>
            </div>
          </div>
        </header>
      )}
      <Outlet />
      <ChatBox />
    </div>
  );
}
