'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Brain, FileText } from "lucide-react";

const navItems = [
    { label: "Flashcards", href: "/flashcards", icon: BookOpen },
    { label: "Cramming", href: "/cramming", icon: Brain },
    { label: "Summary", href: "/summary", icon: FileText },
];

export function Navbar() {
    const pathname = usePathname();

    if (pathname === "/") return null;

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link href="/" className="flex items-center gap-2">
                        <Brain className="w-8 h-8 text-indigo-600" />
                        <span className="text-xl font-semibold text-gray-900">Clarify</span>
                    </Link>

                    <nav className="flex gap-6">
                        {navItems.map(({ label, href, icon: Icon }) => (
                            <Link
                                key={href}
                                href={href}
                                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${pathname === href
                                    ? "bg-indigo-100 text-indigo-700"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                {label}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>
        </header>
    );
}
