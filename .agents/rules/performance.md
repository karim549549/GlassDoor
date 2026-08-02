# Performance: rendering, bundling, and backend queries

Applies to: `app/**`, `components/**`, `lib/**`

Apply these where they're a genuine win for a specific component/page — not reflexively on every file. Judgment over blanket application.

## Rendering and bundle size

- Use `next/image` for any user-facing image (avatars, cover photos, logos). Never a raw `<img>` tag. Check the current rendered box (CSS classes/dimensions) before choosing `fill` vs explicit `width`/`height` — the visual result must match exactly.
- Use `next/dynamic` to lazy-load modals and rarely-shown subtrees (croppers, dialogs, anything gated behind a click) so their JS isn't part of the initial page bundle.
- Wrap list-item or section components in `React.memo` when they visibly re-render from unrelated parent state changes (e.g. a card in a filtered/sorted list re-rendering on every keystroke in an unrelated search box).
- Use `useMemo`/`useCallback` only when the value is expensive to recompute or is being passed to a component that is itself memoized — not as a default habit on every derived value.
- Don't keep a component marked `"use client"` if the only reason for the directive is a small interactive child it renders — extract that child into its own client component and let the parent stay a server component, when doing so is a safe, real win (not just because it's technically possible).

## Rendering strategy per page

- If a page's data doesn't depend on per-request or per-user state (no auth-gated content, no query params affecting what's shown), add `export const revalidate = <seconds>` (ISR) instead of leaving it fully dynamic.
- If a page does depend on per-request state (e.g. it calls `supabase.auth.getUser()` and uses the result to shape the response, like `isOwner`/`isRegistered` flags), leave it dynamic — don't force static generation onto pages with real per-request logic.

## Backend queries

- Prisma calls should `select`/`include` only the fields the response actually uses — don't over-fetch full records when a handful of fields are rendered.
- Watch for N+1 patterns: a list query followed by a separate query per row inside a loop. Batch these with a single query plus `include`, or a `WHERE ... IN (...)`.
- Not every domain has a real database behind it — check first. If a domain's "backend" is actually a static in-memory data source (no Prisma involvement), there's nothing to tighten; don't invent query optimizations for code that doesn't query anything.
