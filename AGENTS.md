<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# What this product actually is

**Devs Arena is a community coding-challenge platform first, and a hiring
marketplace second — in that order, and the order is load-bearing.**

Read this before writing any user-facing copy. The PRD and most of this repo's
history are written around proof packets, Glicko ratings and verifiable hiring
credentials, because that is the engineering that was hard and therefore got
documented. That weighting has repeatedly misled agents — including in the
session that added this section — into putting the year-two revenue pitch on
the year-one front door.

**What it is in one line: Codeforces, for playful build challenges,
community-run.** Anyone can create an arena. The platform supplies the format,
the clock, the teams, the judging and the board; the community supplies the
briefs and the entries.

**There is no Devs Arena YouTube channel and no episodes.** Never write copy
implying a show, footage or a back catalogue. (An earlier draft of the PRD
claimed one; it was wrong and is retracted.)

**Who actually shows up:** developers who want a fun Saturday — the Codeforces /
Kaggle / Advent of Code audience. They are not job hunting. Fun, people, prize
money and a rating to climb are why they enter. Networking is an explicit goal,
not a side effect.

**Developers never pay. Companies are the only revenue.** Developers are not
customers — they are the supply, and what a company eventually buys is access to
a population with judged work attached. So every developer-facing decision
optimises for participation and retention, never conversion, because there is
nothing to convert to. Copy that suppresses participation destroys revenue
upstream, before a company is ever asked for money.

**Sell fun to developers. Sell developers to companies. Never both on the same
page.**

**Why leading with the credential is self-defeating.** A hiring credential is
worth nothing without a critical mass of competitors, and telling a casual
entrant that everything they do becomes a permanent public record judged by
named judges that recruiters will read is a job interview with an audience. It
suppresses exactly the participation the credential depends on. Game first,
density second, marketplace third — the order every comparable platform
followed.

**Judge reasoning is content, not just a credential feature.** Human judges with
mandatory written reasoning were built for scoring integrity, but
`JudgeVerdict.feedbackText` and every `JudgeScore.justification` are already
stored, already mandatory, and are the best prose the platform produces. They
are currently visible only inside a proof packet, framed as evidence for
recruiters — when they are also simply good reading, and the thing an
auto-graded site (Codeforces, LeetCode) has no equivalent of.

**The format follows CodeTV's _Web Dev Challenge_** — a brief, 30 minutes to
plan, 4 hours to build, in teams, ending in a demo. Referenced as a format
model only; no affiliation, and episodes are **not** modelled one-to-one onto
arenas. Two consequences worth knowing before you touch anything:

- `ideaPhaseStart/End` then `implPhaseStart/End` **is** "30 min to plan, 4 hours
  to build". Express format presets in those existing windows, not new fields.
- **That show is something you watch, with an invited cast. This is the same
  format anyone can create and enter,** online or offline at a real venue. The
  offline mode is why the Egypt venue and geocoding architecture exists — it is
  first-class, not an afterthought.

**Match the tone.** The reference format's briefs are jokes — "the most devious
video player", "a site with zero business value". Platform copy currently says
"unforgeable hiring credentials" and "conflict-of-interest database trigger".
Same activity, opposite universes. The integrity machinery is real and stays,
but it is plumbing: it belongs in docs and on employer surfaces, not in the
voice the product uses with entrants. And the format barely emphasises winning —
**it ends in a demo, and the demo is the point.**

## What this means when you write copy or build a surface

- Lead with fun, the brief itself, teams, people, prize money and rivalry. Not
  employability, and never a show that does not exist.
- The proof packet is a **souvenir the entrant may keep**, not the reason to
  enter. Mention it once, framed as theirs.
- Employer surfaces (`/companies`, `/recruiter`, packets-as-credential framing)
  are **correct work for a later phase**. Keep them, keep them working, keep
  them out of the primary navigation and off the hero.
- Never describe the platform to a developer as a hiring or assessment tool.

Full reasoning and phasing: `docs/PRODUCT_REQUIREMENTS_DOCUMENT.md` §1.2.

# Orient before you explore

**Read `.agents/reference/PROJECT_MAP.md` first.** It is generated from the repo
(`npm run map`) and lists every model, migration, API route with its auth gate,
page, domain library and test file. It exists because a subagent starts with a
cold context and otherwise rediscovers all of that by grepping — which measured
~300k tokens across three exploration agents in one session, for a map that was
discarded on exit. Reading one generated file instead is the difference.

Never hand-edit the map; regenerate it. A stale map is worse than none, because
it gets trusted.

# Facts that are easy to get wrong here

These come up in almost every task. Assume them rather than re-deriving them.

- **The database is currently unreachable** (invalid credentials, Prisma P1000).
  Nothing can be verified at runtime. `npm run build` will fail — it runs
  `prisma migrate deploy`. The green check is:
  `npx prisma generate && npx tsc --noEmit && npx eslint && npx next build && npm test`
- **Arena status is DERIVED, never stored.** There is no `status` column and no
  scheduler. `deriveArenaStatus(windows, now)` in `lib/arena/status.ts` takes
  `now` as a parameter — never call `Date.now()` inside it, or arenas near a
  phase boundary hydration-mismatch. List filtering uses `arenaStatusWhere`.
- **Migrations are hand-assembled.** Generate the DDL, never type it:
  `npx prisma migrate diff --from-empty --to-schema prisma/schema --script`
  works offline and emits Prisma's own constraint names. Hand-write only DROP,
  RENAME, backfill, CHECK and trigger statements. Never edit an applied migration.
- **Never run `prisma db push`.** It silently drops the conflict-of-interest
  trigger in `20260815190000_...`, which is what stops a judge scoring their own
  team. `lib/server/db-integrity.ts` asserts the trigger still exists.
- **`npm test`** runs `scripts/run-tests.mjs`, which walks `lib/` — Node 20 here
  cannot glob in `node --test`. Test files import with **no** `.ts` extension.
- **Anonymity and identity are enforced in the DTO layer**, never in components.
  `USER_PROFILE_SELECT` deliberately omits `email`; the public profile must not
  expose it.
- **Money is `Decimal`, never `Float`.** Rank is computed at read time, never stored.

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
