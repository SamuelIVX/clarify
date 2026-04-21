'use client';
import { useEffect, useRef } from "react";
import { Trash2 } from "lucide-react";

export default function ConfirmDeleteModal({ message, onConfirm, onCancel }: {
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    const cancelRef = useRef<HTMLButtonElement>(null);
    const dialogRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        cancelRef.current?.focus();


        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onCancel();
                return;
            }

            if (e.key !== "Tab") return;

            const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (!focusable?.length) return;

            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            previousFocus?.focus();
        };
    }, [onCancel]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/30" onClick={onCancel} />
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-describedby="confirm-delete-description"
                className="relative bg-white rounded-xl shadow-xl border border-gray-200 p-6 max-w-sm w-full mx-4"
            >
                <div className="flex items-start gap-3 mb-5">
                    <div className="shrink-0 w-9 h-9 rounded-full bg-red-100 flex items-center justify-center">
                        <Trash2 className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                        <p id="confirm-delete-title" className="font-semibold text-gray-900">Confirm Delete</p>
                        <p id="confirm-delete-description" className="text-sm text-gray-500 mt-0.5">{message}</p>
                    </div>
                </div>
                <div className="flex gap-2 justify-end">
                    <button ref={cancelRef} onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}