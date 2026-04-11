import Link from "next/link";
import { BookOpen, Brain, FileText } from "lucide-react";
import { FeatureCardProps } from "./types";

export function FeatureCard({ page, icon, title, description, bg_color, border_color }: FeatureCardProps) {
    return (
        <Link
            href={page}
            className={`group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-200 hover:${border_color}`}
        >
            <div className={`bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mb-4 mx-auto group-hover:${bg_color} transition-colors`}>
                {icon}
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {title}
            </h2>
            <p className="text-gray-600">
                {description}
            </p>
        </Link>
    )
}

export default function Home() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 bg-white">
            <div className="max-w-4xl w-full text-center space-y-8">

                {/* Logo and Title */}
                <div className="space-y-4">
                    <div className="flex justify-center">
                        <div className="bg-indigo-600 rounded-full p-6">
                            <Brain className="w-16 h-16 text-white" />
                        </div>
                    </div>
                    <h1 className="text-5xl font-bold text-gray-900">Clarify</h1>
                    <p className="text-xl text-gray-600">
                        Transform your study materials into powerful learning tools
                    </p>
                </div>

                {/* Feature Cards */}
                <div className="grid md:grid-cols-3 gap-6 mt-12">
                    <FeatureCard
                        page="/flashcards"
                        icon={<BookOpen className="w-8 h-8 text-indigo-600" />}
                        bg_color="bg-indigo-200"
                        border_color="border-indigo-300"
                        title="PDF to Flashcards"
                        description="Upload any PDF and generate AI-powered flashcards instantly"
                    />

                    <FeatureCard
                        page="/cramming"
                        icon={<Brain className="w-8 h-8 text-purple-600" />}
                        bg_color="bg-purple-200"
                        border_color="border-purple-300"
                        title="Cramming Session"
                        description="Review your flashcards with an interactive study session"
                    />

                    <FeatureCard
                        page="/summary"
                        icon={<FileText className="w-8 h-8 text-pink-600" />}
                        bg_color="bg-pink-200"
                        border_color="border-pink-300"
                        title="AI Summary"
                        description="Get concise, AI-generated summaries of your study materials"
                    />

                </div>
            </div>
        </div >
    );
}
