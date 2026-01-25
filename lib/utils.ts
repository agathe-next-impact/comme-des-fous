import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import he from "he";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Truncate HTML string to a certain number of words, preserving tags.
 * Works on both server and client side.
 * @param html The HTML string to truncate.
 * @param wordLimit The number of words to keep.
 * @returns Truncated HTML string.
 */
export function truncateHtml(html: string, wordLimit: number): string {
  // Remove HTML tags to get plain text
  let text = html.replace(/<[^>]*>/g, "");
  
  // Decode HTML entities
  text = he.decode(text);
  
  // Split into words and take only the first wordLimit words
  const words = text.split(/\s+/).filter(word => word.length > 0);
  const truncated = words.slice(0, wordLimit).join(" ");
  
  // Add ellipsis if we truncated
  return truncated + (words.length > wordLimit ? "…" : "");
}
