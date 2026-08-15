export function fmt(n: number) {
  return n.toLocaleString("en-EG");
}

export function ratingColorClass(rating: number): string {
  if (rating >= 4.0) return "text-[#1A7A3A]";
  if (rating >= 3.5) return "text-[#C47A00]";
  return "text-accent";
}

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 60 * 60 * 1000],
  ["month", 30 * 24 * 60 * 60 * 1000],
  ["day", 24 * 60 * 60 * 1000],
  ["hour", 60 * 60 * 1000],
  ["minute", 60 * 1000],
];

/**
 * "18 hours ago" for a feed timestamp. The DTOs emit ISO strings, so this takes
 * one and both the server render and the post-submit client refresh format it
 * identically.
 */
export function formatRelativeDate(iso: string): string {
  const elapsed = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(elapsed) || elapsed < 60 * 1000) return "Just now";

  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (const [unit, ms] of RELATIVE_UNITS) {
    if (elapsed >= ms) {
      return formatter.format(-Math.floor(elapsed / ms), unit);
    }
  }
  return "Just now";
}
