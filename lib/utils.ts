import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Truncate HTML string to a certain number of words, preserving tags.
 * @param html The HTML string to truncate.
 * @param wordLimit The number of words to keep.
 * @returns Truncated HTML string.
 */
export function truncateHtml(html: string, wordLimit: number): string {
  const div = document.createElement("div");
  div.innerHTML = html;
  const text = div.textContent || div.innerText || "";
  const words = text.split(/\s+/).slice(0, wordLimit).join(" ");
  return words + (text.split(/\s+/).length > wordLimit ? "…" : "");
}
