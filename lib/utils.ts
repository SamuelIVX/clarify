/**
 * Tailwind `cn` helper — merges class names with clsx and resolves Tailwind
 * conflicts via tailwind-merge.
 */
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines class values into a single Tailwind class string.
 * @param inputs - class expressions (strings, arrays, conditionals).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
