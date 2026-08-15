export function isSafeHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Validates a caller-supplied redirect target. Only same-origin relative
 * paths are allowed: anything that could resolve to another origin gets the
 * fallback instead.
 *
 * `new URL(target, requestUrl)` resolves "https://evil.com" AND "//evil.com"
 * to the attacker's origin, so a prefix check for "/" alone is not enough -
 * the second character has to be rejected too, including the backslash forms
 * that some browsers normalize to "//".
 */
export function safeRedirectPath(value: string | null | undefined, fallback: string): string {
  if (!value || typeof value !== "string") return fallback;
  if (!value.startsWith("/")) return fallback;
  if (value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}
