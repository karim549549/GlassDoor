<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Codebase conventions

Established during the 2026-08 refactor (see `docs/superpowers/plans/2026-08-02-codebase-refactor-and-performance.md`). Follow these for any new feature or further refactor — they exist to keep files small and prevent the duplicated-logic/oversized-component debt that refactor paid down from re-accumulating.

## Domain-scoped data layer

Each feature domain (`arena`, `profile`, `companies`, `user`, etc.) keeps its data layer in `lib/<domain>/`:

- **`schema.ts`** — zod schema(s); the single source of truth for validation rules *and* any enum/option-list values. Both the client form and the API route import from here. Never hardcode an enum's values (e.g. status/seniority options) directly in a component's `<option>` list or in a route handler's local consts — that's exactly the drift bug this refactor fixed in the profile module (see `lib/profile/schema.ts`).
- **`service.ts`** — Prisma/DB logic, returning the *raw* Prisma shape. API route handlers stay thin: `requireUser()`/`getOptionalUser()` for auth → `schema.safeParse(body)` → call the service function → transform through `dto.ts` if the shape has relations → respond, all inside `withApiErrorHandling`. Reference: `lib/arena/service.ts`, `lib/profile/service.ts`, `lib/user/service.ts` + `app/api/arena/route.ts`.
- **`dto.ts`** — for domains whose Prisma shape includes a many-to-many or other relation that shouldn't leak its join-table wrapper into the API response (e.g. `skills: { skill: { id, name } }[]` should become `skills: { id, name }[]`), a zod-validated transform function from the raw service shape to the public response shape. Reference: `lib/user/dto.ts`'s `toUserProfileDto`. Not every domain needs one — only add it where there's a real relation to flatten.
- **`types.ts`** / **`constants.ts`** — shared types and static data (option lists, mock data), never inline in a component.

## Route handler infrastructure — don't hand-roll auth checks or try/catch

Every protected route used to repeat the same `createClient()` → `getUser()` → 401-if-missing sequence, and every route repeated its own `try/catch` → `console.error` → 500 JSON response. Both are now shared:

- **`requireUser()`** / **`getOptionalUser()`** (`lib/server/auth/require-user.ts`) — the former returns `{ user }` or `{ response }` (a ready-to-return 401); the latter returns `User | null` for routes where auth is optional. Both reuse the same per-request Supabase client instead of constructing a new one.
- **`withApiErrorHandling(label, fn, errorMessage?)`** (`lib/server/api-route.ts`) — wraps a route handler's body, catching unhandled exceptions and logging+responding consistently. `label` is what gets logged, `errorMessage` is what the caller sees.
- **Supabase clients are memoized, not reconstructed per call**: `lib/server/supabase/server.ts`'s `createClient` is wrapped in React's `cache()` so multiple calls within one request share an instance; `lib/server/supabase/admin.ts`'s `createAdminClient()` is a true module-level singleton since it carries no request-scoped state.
- Reference implementation: `app/api/arena/route.ts`.

## Logging — see `.agents/rules/logging.md` for the full policy

`lib/server/logger.ts` (server) and `lib/client/logger.ts` (client) — `error`/`warn` only, nothing on the success path. `withApiErrorHandling` and `requireUser()` already log through these; don't add a duplicate log around a call to either.

## Frontend/backend boundary — the service layer is the seam, not HTTP

This app is one Next.js codebase today but is intentionally kept ready to split into a separately-deployed backend later. The seam that makes that possible is `lib/<domain>/service.ts`: all data logic lives there, and nothing else talks to Prisma.

Server Components call those service functions directly. `app/api/**` is a parallel thin adapter over the *same* functions, for client components and future external consumers — neither calls the other. Pages and components still must never import `prisma`, construct a Supabase client for business data, or inline a query; that restriction is unchanged and is what this rule actually protects.

**Changed 2026-08-15** (was: Server Components HTTP-fetch their own `/api/*` routes via `fetchInternalApi`). That function derived its target URL from the client-controlled `Host` header while forwarding the caller's session cookie — a request-forgery primitive — and cost an extra hop plus a second serverless invocation per render. It has been deleted. Full reasoning in `.agents/rules/architecture.md`. For absolute URLs that must not come from the request, use `getSiteUrl()` from `lib/site-url.ts`.

## Component decomposition

- If a client component crosses ~200–250 lines or mixes more than one concern (form validation + upload logic + animation + layout), split it.
- Form sections take `register`/`errors` (react-hook-form + zod) as explicit typed props, plus specific watched values by name as their own props — never the whole form object, never context, for this.
- Extract non-trivial `useEffect`/state logic (animations, upload flows, GSAP timelines) into a dedicated hook.
- Reference: `app/arena/create/page.tsx` + `components/arena/create/*`, `components/profile/EditProfileModal.tsx` + `components/profile/edit/*`.

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
