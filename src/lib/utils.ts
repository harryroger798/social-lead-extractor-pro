import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Dynamic year utility - automatically updates each year
export function getCurrentYear(): number {
  return new Date().getFullYear();
}

// Helper to replace {year} placeholder in strings with current year
export function withCurrentYear(text: string): string {
  return text.replace(/\{year\}/g, getCurrentYear().toString());
}
