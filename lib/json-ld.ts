/**
 * JSON.stringify does not escape "<", so a value containing
 * "</script><script>..." breaks out of a <script type="application/ld+json">
 * block and executes. Escaping the three characters that can start a tag or
 * an HTML entity keeps the payload inert while remaining valid JSON - the
 * \uXXXX forms parse back to the original characters.
 */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}
