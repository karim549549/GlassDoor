<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Codebase conventions

Established during the 2026-08 refactor (see `docs/superpowers/plans/2026-08-02-codebase-refactor-and-performance.md`). Follow these for any new feature or further refactor — they exist to keep files small and prevent the duplicated-logic/oversized-component debt that refactor paid down from re-accumulating.

## Domain-scoped data layer

Each feature domain (`contest`, `profile`, `companies`, etc.) keeps its data layer in `lib/<domain>/`:

- **`schema.ts`** — zod schema(s); the single source of truth for validation rules *and* any enum/option-list values. Both the client form and the API route import from here. Never hardcode an enum's values (e.g. status/seniority options) directly in a component's `<option>` list or in a route handler's local consts — that's exactly the drift bug this refactor fixed in the profile module (see `lib/profile/schema.ts`).
- **`service.ts`** — Prisma/DB logic. API route handlers stay thin: auth check → `schema.safeParse(body)` → call the service function → respond. Reference: `lib/contest/service.ts`, `lib/profile/service.ts`, `app/api/contest/route.ts`.
- **`types.ts`** / **`constants.ts`** — shared types and static data (option lists, mock data), never inline in a component.

## Frontend/backend boundary — pages never touch Prisma or Supabase directly for data

This app is one Next.js codebase today but is intentionally being kept ready to split into a separately-deployed backend later. So `app/api/**` is treated as if it already were a different service: pages and components (including Server Components) fetch it over HTTP via `fetchInternalApi` in `lib/server/api-client.ts` — they don't import `prisma`, construct a Supabase client, or call a `lib/<domain>/service.ts` function directly for business data. If the route doesn't exist yet, create it instead of taking the direct-call shortcut. See `.agents/rules/architecture.md` for the full rule, including the one confirmed exception (statically-generated/ISR pages can't self-fetch at build time — verified by an actual failed build — so they call the service function directly, same as the API route does).

## Component decomposition

- If a client component crosses ~200–250 lines or mixes more than one concern (form validation + upload logic + animation + layout), split it.
- Form sections take `register`/`errors` (react-hook-form + zod) as explicit typed props, plus specific watched values by name as their own props — never the whole form object, never context, for this.
- Extract non-trivial `useEffect`/state logic (animations, upload flows, GSAP timelines) into a dedicated hook.
- Reference: `app/contest/create/page.tsx` + `components/contest/create/*`, `components/profile/EditProfileModal.tsx` + `components/profile/edit/*`.

## Performance (apply where it's a real win, not reflexively)

- `next/image` for any user-facing image — never a raw `<img>`.
- `next/dynamic` for modals/rarely-shown subtrees (croppers, dialogs) so they're excluded from the initial bundle.
- `React.memo` on list-item/section components that re-render from unrelated parent state.
- `useMemo`/`useCallback` only when feeding a memoized child or avoiding genuine recomputation cost.
- Don't keep `"use client"` on a component whose only reason for it is a small interactive child — extract that child into its own client component instead, where it's a safe, real win.
- Prisma calls: `select`/`include` only the fields the response actually uses; watch for N+1 (a list query followed by a per-row query in a loop).
- If a page's data doesn't depend on per-request/per-user state, add `export const revalidate = <seconds>` instead of leaving it fully dynamic.

## Accessibility

- Every `<input>`/`<select>`/`<textarea>` needs an associated `<label htmlFor>` or `aria-label`.
- Don't rely on color alone to convey state — pair it with text or an icon (the "[✓] DONE" pattern already used across this codebase is the model to follow).

## Verification and commits

- No automated test suite exists in this repo, by design — this is a vibe-coded project with no local testing; the deployed Vercel build is the review surface. Verify with `npx tsc --noEmit` and `npx eslint <touched paths>` before considering work done.
- Conventional Commits (`feat:`, `fix:`, `refactor:`, `perf:`, etc.), imperative mood, matching this repo's existing `git log` style. No AI/Claude/Gemini/Antigravity attribution trailer of any kind in any commit message.
