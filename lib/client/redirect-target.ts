/**
 * The `redirectTo` currently in the address bar, read at call time.
 *
 * Deliberately not `useSearchParams()`. That hook opts the nearest Suspense
 * boundary out of server rendering, so on the statically prerendered auth
 * pages it shipped an empty panel and only painted the form after hydration -
 * for a value nothing needs until the reader has already submitted something.
 * Every consumer here uses it inside an event handler, where the window is
 * available anyway.
 */
export function currentRedirectTo(): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("redirectTo");
}
