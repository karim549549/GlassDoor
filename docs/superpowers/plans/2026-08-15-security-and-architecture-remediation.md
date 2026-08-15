# Security & Architecture Remediation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the account-takeover-class security holes, replace the mock-data prototype layer with real persistence, and stop the design-token and client-boundary debt from compounding — before the codebase grows past the point where refactor cost exceeds rewrite cost.

**Architecture:** Three seams get fixed, in order of blast radius. (1) Auth stops handing long-lived credentials to the browser and stops trusting client-supplied redirect targets. (2) The data seam collapses from "RSC → HTTP self-fetch → route → service" to "RSC → service" with `app/api/*` as a parallel thin adapter over the same services — same split-readiness, no per-render round trip. (3) The presentation layer moves off 1,252 hardcoded hex literals onto the token system that already exists in `globals.css`.

**Tech Stack:** Next.js 16.2.10 (App Router, `proxy.ts` middleware), React 19.2.4, Prisma 7.8 + `@prisma/adapter-pg`, Supabase Auth + Storage, zod 4, react-hook-form, Tailwind 4, GSAP, zustand.

**Spec:** This document is self-contained — the audit in Part 1–3 is the spec the plan in Part 4 implements.

## Global Constraints

- **No automated test suite exists in this repo, by design** (`AGENTS.md`). TDD steps below are therefore replaced with an explicit verification step per task: `npx tsc --noEmit` and `npx eslint <touched paths>` must both pass, plus the named manual check. Where a task introduces genuinely testable pure logic (redirect validation, JSON-LD escaping), the plan adds a minimal test file and the test runner alongside it — those two are security controls and must not rely on eyeballing.
- **Baseline as of 2026-08-15:** `npx tsc --noEmit` → clean. `npx eslint app components lib prisma` → **14 errors, 8 warnings**. The lint baseline is currently red, contrary to the AGENTS.md verification rule. Task 0 makes it green so later tasks have a meaningful gate.
- Conventional Commits, imperative mood. No AI/Claude/Gemini attribution trailer of any kind.
- Domain data layer stays `lib/<domain>/{schema,service,dto,types,constants}.ts` per AGENTS.md.
- Do not introduce a new state library, CSS framework, or ORM. Every fix below uses what is already in `package.json`.
- Prisma migrations go in `prisma/schema/migrations/` and are applied by `npm run build` (`prisma migrate deploy`).

---

# Part 1 — Verdict

The engineering *discipline* in this codebase is well above typical vibe-coded work. There is a real domain data layer, shared route infrastructure (`withApiErrorHandling`, `requireUser`), a memoized Supabase client, a DTO layer that flattens join tables, and comments that explain *why* rather than *what*. `tsc --noEmit` is clean. That is not nothing, and the refactor plan below preserves all of it.

The problem is that the discipline is unevenly distributed. Three things are true at once:

1. **The auth layer has a critical, exploitable flaw** that the codebase already knows about and documented as "accepted short-term debt" (`lib/client/saved-accounts.ts:9-13`). That comment understates it: the leak is not confined to login, and the accompanying `/api/auth/login-saved` endpoint turns the leaked credential into a complete, password-less, non-expiring account takeover primitive. Combined with a verified open redirect and zero rate limiting, this is the part that cannot ship as-is.

2. **The product's core feature has no persistence at all.** This is a Glassdoor-for-Egypt salary transparency app. The Prisma schema contains 13 models — `User`, `Arena`, `ArenaTeam`, `Tag`, `Skill`, `Role`… and **no `Company`, no `Review`, no `Salary`, no `Comment`**. Companies are a static TypeScript array. The salary submission modal writes nowhere. The arena detail page — which has a working, tested-looking API route sitting right next to it — renders a hardcoded `MOCK_ARENA_DATA` constant and ignores that route entirely.

3. **The presentation layer is where the refactor cost is actually accumulating.** 1,252 hardcoded hex color literals across 93 of ~160 files, against a complete design-token system that already exists in `globals.css` and is barely used. `#0E0E0D` appears **888 times**. 52% of the app is `"use client"`.

The honest framing: this is a **well-structured backend skeleton wearing a prototype's clothes**. The instinct to audit now is correct, and the timing is good — the abstractions worth keeping are already in place, so remediation is mostly *finishing* and *propagating* patterns rather than inventing them. The exception is the auth layer, which needs deletion, not refinement.

**Recommended order:** Phase 1 (security) before any further feature work. Phase 2 (architecture) before wiring more pages. Phase 3 (frontend debt) can run in parallel with feature work, incrementally.

---

# Part 2 — Security Audit

Severity uses: **Critical** (exploitable now, full account/data compromise) · **High** (exploitable, scoped impact, or one condition away from critical) · **Medium** · **Low**.

## SEC-1 · Critical — Refresh tokens are minted to the browser and persisted in `localStorage`

**Evidence:**

| File | Line | What it does |
|---|---|---|
| `app/api/auth/login/route.ts` | 56-58 | Returns `session.refreshToken` in the JSON login response |
| `app/api/auth/me/route.ts` | 65-67 | Returns `session.refreshToken` **on every authenticated page load** |
| `app/api/auth/login-saved/route.ts` | 9-36 | Accepts *any* refresh token in a request body and mints a full session from it |
| `lib/client/saved-accounts.ts` | 27 | `localStorage.setItem(...)` — token persisted in plaintext |
| `components/providers/AuthProvider.tsx` | 18-22 | Writes the token to `localStorage` on every mount |
| `components/login/LoginForm.tsx` | 77-81 | Same, on login |
| `components/signup/SignupForm.tsx` | 86 | Same, on signup |
| `components/login/AccountSwitcher.tsx` | 59-63 | Reads it back and POSTs it to `/api/auth/login-saved` |

**Why this is worse than the in-code comment claims.** `lib/client/saved-accounts.ts:9-13` frames this as "a refresh token readable by any XSS on the page outlives the httpOnly session cookie." Three things it misses:

- **The leak is not login-scoped.** `/api/auth/me` is called by `AuthProvider` on *every* mount of *every* page. A refresh token is handed to the browser continuously, for every authenticated user, on every navigation.
- **`/api/auth/login-saved` weaponizes it.** Normally a stolen refresh token requires the attacker to talk to Supabase's token endpoint directly. This app provides a first-party, same-origin, unauthenticated endpoint that exchanges an arbitrary refresh token for a live session cookie. No password, no email confirmation, no rate limit, no logging.
- **`localStorage` is not origin-partitioned against XSS the way an httpOnly cookie is.** The httpOnly session cookie Supabase already manages is unreadable to script; this feature deliberately routes around that protection. There is no CSP on this app (see SEC-5), so a single injected script — from a dependency, a markdown render, an ad, a browser extension — reads every saved account for every user who has ever logged in on that browser.

**Attack:** any XSS, or physical/shared-device access, or a malicious npm package in the client bundle → read `devs_arena_saved_users` → POST each `refreshToken` to `/api/auth/login-saved` → full session as each user, indefinitely, surviving password changes on other devices.

**Fix:** delete the client-side token path entirely. "Saved accounts" keeps `email` + display `name` only, and switching accounts re-prompts for the password. Remove `refreshToken` from all three API responses, delete `/api/auth/login-saved`, and purge existing tokens from users' `localStorage` on next load via a storage-key version bump. → **Task 1**

## SEC-2 · Critical — Open redirect in the OAuth callback

**Evidence:** `app/api/auth/callback/route.ts:45-46`

```ts
const finalRedirect = redirectTo || `/user/${user.id}`;
return NextResponse.redirect(new URL(finalRedirect, request.url));
```

`redirectTo` comes straight from the query string (line 9), unvalidated. `app/api/auth/oauth/route.ts:21` passes an equally unvalidated `redirectTo` through into that callback URL, and `proxy.ts:52` populates it on every protected-route bounce.

**Verified behavior** (`new URL(target, "https://devsarena.app/api/auth/callback?code=x")`):

```
"https://evil.com/steal"  ->  https://evil.com/steal      ← escapes origin
"//evil.com/steal"        ->  https://evil.com/steal      ← protocol-relative also escapes
"/user/123"               ->  https://devsarena.app/user/123
```

**Attack:** send a victim `https://devsarena.app/api/auth/oauth?provider=google&redirectTo=https://evil.com/login`. The domain is genuine, the Google consent screen is genuine, the user really does authenticate — and then lands on an attacker-controlled page that looks like the app and asks them to "re-enter your password." Classic OAuth phishing laundering, using the real domain as the trust anchor. Also usable to leak the `code`/referrer to an external host.

Note that `lib/url.ts` already exports `isSafeHttpUrl` — but it is only used for profile link validation, and it would *not* help here anyway, since it accepts any `https:` URL. The correct check for a redirect target is stricter: same-origin relative paths only.

**Fix:** an allow-list validator — accept only strings starting with a single `/` and not `//` or `/\`, reject everything else to a safe default. Apply at both the callback and the OAuth initiation. → **Task 2**

## SEC-3 · Critical — No rate limiting on any endpoint

**Evidence:** no rate-limiting code exists anywhere in the repo. Unprotected:

- `POST /api/auth/login` — unlimited credential stuffing / password brute force.
- `POST /api/auth/login-saved` — unlimited refresh-token guessing (compounds SEC-1).
- `POST /api/auth/reset-password` — unlimited password-reset emails to any address. Mail-bombing an arbitrary third party, from your domain, damaging your sending reputation.
- `POST /api/auth/signup` — unlimited account creation; also the enumeration oracle in SEC-6.
- `POST /api/arena/upload`, `POST /api/profile/upload` — unlimited 5 MB writes through the **service-role** Supabase client (`lib/server/upload.ts:37`), which bypasses storage RLS. Arena covers use `crypto.randomUUID()` paths (`app/api/arena/upload/route.ts:26-27`) and are never garbage-collected, so this is also an unbounded storage-cost amplifier.

**Fix:** a small in-process token-bucket limiter keyed by IP for auth endpoints and by user id for uploads. Given Vercel's serverless model this is best-effort per-instance, which is still a meaningful cost increase for an attacker; document the limitation and note Upstash/Vercel KV as the durable follow-up. → **Task 3**

## SEC-4 · High — `proxy.ts` fails open

**Evidence:** `proxy.ts:55-59`

```ts
} catch (err) {
  console.error("Proxy middleware error:", err);
}
return supabaseResponse;   // ← request proceeds as if authenticated
```

If `supabase.auth.getUser()` throws — Supabase outage, network blip, expired project key, rate limit from Supabase's side — the protected-route check at lines 44-54 is skipped entirely and the request is served. The `if (!supabaseUrl || !supabaseAnonKey) return supabaseResponse` at lines 12-14 does the same thing on misconfiguration.

Impact is bounded because pages and routes do their own authoritative checks (`requireUser()`, and `app/profile/page.tsx` re-checks) — the comment at `proxy.ts:42-43` correctly describes this as an optimistic layer. But "the defense-in-depth layer silently disables itself under load" is not a property you want, and it hides the outage: `console.error` here bypasses `lib/server/logger.ts` entirely, contrary to `.agents/rules/logging.md`.

Separately, **`/arena/create` is not in `protectedPrefixes`** (line 44). The API route behind it is protected, so this is a UX leak (unauthenticated users reach a full form and only discover the problem on submit), not an authz hole.

**Fix:** fail closed for protected prefixes — on error, redirect to `/login` rather than passing through. Route the log through `logger`. Add `/arena/create`. → **Task 4**

## SEC-5 · High — No security headers at all

**Evidence:** `next.config.ts` defines `images` and `rewrites` only. There is no `headers()` export.

Missing: `Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options`/`frame-ancestors`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`.

The CSP gap is what makes SEC-1 catastrophic rather than merely bad: with no script-src restriction, any injection point becomes a full credential harvest. `Referrer-Policy` matters specifically here too — auth URLs in this app carry `code` and `redirectTo` in the query string, and the default referrer policy leaks those to any third-party image or link target on the landing page.

**Fix:** add a `headers()` block. CSP starts in `Content-Security-Policy-Report-Only` because the app uses GSAP and inline JSON-LD, then tightens after observing violations. → **Task 5**

## SEC-6 · Medium — User enumeration and weak password policy

**Evidence:**
- `app/api/auth/signup/route.ts:18-24` — queries Prisma for the email *before* calling Supabase and returns `"Email address is already registered."` This is a direct, unauthenticated, unrate-limited oracle for "does this person have an account on a salary-transparency site." For this product that is a meaningful privacy leak, not a generic checkbox item.
- `app/api/auth/change-password/route.ts:15` — `password.length < 6`. Six characters, no complexity, no breach-list check.
- `components/login/LoginForm.tsx:20` — client schema also `min(6)`.
- `app/api/auth/signup/route.ts` — validates *no* password rules at all server-side; relies entirely on the Supabase project default.

**Fix:** signup returns the same generic "check your email" response whether or not the account exists (Supabase's `signUp` is already enumeration-safe by default; the Prisma pre-check is what breaks it). Raise the floor to 8 characters with a shared `passwordSchema` in `lib/auth/schema.ts` used by client and both server routes. → **Task 6**

## SEC-7 · Medium — Internal error messages returned to clients

**Evidence:**
- `app/api/arena/route.ts:31-38` — catches, then returns `err.message` verbatim with a 500. Prisma errors carry table names, column names, and constraint names.
- `app/api/arena/upload/route.ts:34-35` and `app/api/profile/upload/route.ts:44-45` — return the raw Supabase storage error, which `lib/server/upload.ts:44` has already decorated with the literal bucket name: `` `Upload failed: ${msg}. Make sure the '${bucket}' bucket exists.` ``

This inner try/catch also defeats the point of the `withApiErrorHandling` wrapper it sits inside, and uses `console.error` instead of `logger`, bypassing the logging policy in three places.

**Fix:** delete the inner catches; let `withApiErrorHandling` log via `logger` and return its generic message. → **Task 7**

## SEC-8 · Medium — `fetchInternalApi` builds its target from the `Host` header and forwards session cookies to it

**Evidence:** `lib/server/api-client.ts:29-40`

```ts
const host = headersList.get("host");
...
return fetch(`${protocol}://${host}${path}`, { headers: { ...(cookie ? { cookie } : {}) } });
```

The `Host` header is client-controlled. A request with `Host: attacker.com` causes the server to make an outbound request to `attacker.com` **carrying the victim's session cookie**. That is a server-side request forgery with credential exfiltration in one primitive.

Vercel validates `Host` against configured domains, so this is not exploitable on the current deployment — but the mitigation lives entirely in the hosting platform, not the code, and it evaporates on any self-hosted or preview-proxy setup. Task 11 removes this function outright as part of the architecture fix; if that task is deferred, pin the host to an env var instead.

## SEC-9 · Medium — JSON-LD injection (latent)

**Evidence:** `app/arena/[id]/page.tsx:150-153`

```tsx
<script type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
```

`JSON.stringify` does **not** escape `<`, so a value containing `</script><script>…` breaks out of the block and executes. Right now `jsonLd` is built from the hardcoded `MOCK_ARENA_DATA` constant, so it is not exploitable — but Task 12 wires this page to real, user-submitted arena titles and descriptions, at which point it becomes stored XSS on a public SEO-indexed page. Fix it *before* the data goes live, not after.

**Fix:** escape `<`, `>`, and `&` to their `\uXXXX` forms after stringifying. → **Task 8** (ordered before Task 12 deliberately.)

## SEC-10 · Low — Unvalidated OAuth provider, and decorative RBAC

- `app/api/auth/oauth/route.ts:19` — `provider: provider as Provider`. An unchecked cast of a raw query param. Supabase rejects unknown providers, so impact is a confusing error, not a breach; still, validate against an explicit allow-list. → **Task 2**
- `lib/server/auth/auth-service.ts:88-91` — `hasRole()` is **never called anywhere in the codebase**. `getUserRoles()` is called only by `/api/auth/me`, purely to display. `proxy.ts:44` protects `/admin`, but no `/admin` route exists. The role system is currently decorative: there is no authorization layer, only authentication. This is fine while every resource is either public or self-owned, but it must exist before the first admin/moderation feature. Noted, not scheduled — flagging so it isn't mistaken for working RBAC.

## SEC-11 · Low — CSRF posture is undocumented and incidental

All mutations are cookie-authenticated JSON POSTs with no CSRF token and no `Origin` check. In practice Supabase's SSR cookies are `SameSite=Lax`, which blocks cross-site POST, so the app is *currently* protected — by a library default it never states a dependency on. One cookie-config change breaks every mutation endpoint silently. Add an `Origin`/`Sec-Fetch-Site` assertion in `withApiErrorHandling` for non-GET requests. → folded into **Task 5**.

## Not findings — checked and clean

- `.env` is correctly gitignored (`.gitignore` covers `.env*`) and is not tracked. No secrets in the repo.
- The service-role key is server-only, guarded by `import "server-only"` (`lib/server/supabase/admin.ts:1`), and never referenced from a client component.
- Profile upload paths are derived from the verified session's `user.id`, never client input (`app/api/profile/upload/route.ts:37`) — the comment claiming this is accurate.
- `requireUser()` uses `getUser()` (server-revalidated), not `getSession()` (cookie-trusting). Correct choice, and correctly explained at `app/api/auth/me/route.ts:11-12`.
- No raw SQL anywhere; all DB access via Prisma's query builder. No SQL injection surface.
- No `<img>` tags — `next/image` is used throughout.
- `extractUuidFromSlug` (`lib/arena-slug.ts:30-37`) feeds Prisma's typed `where: { id: uuid }`, so a malformed slug is a failed lookup, not an injection.

---

# Part 3 — Architecture & Frontend Audit

## ARCH-1 · The self-fetch boundary costs more than it buys — and is already violated

`AGENTS.md` mandates that pages never call a service directly; they must HTTP-fetch their own `/api/*` routes via `fetchInternalApi`, to keep the app "ready to split into a separately-deployed backend later."

I want to disagree with this rule explicitly, because it is the single most expensive architectural decision in the codebase:

**Cost.** Every RSC page render becomes: page → HTTP request to self → route handler → service → Prisma. That is a full extra network hop, TLS handshake, and (on Vercel) a **second serverless invocation billed per page view**. It doubles cold starts, adds latency on the critical render path, forwards the user's session cookie over the wire (SEC-8), and cannot participate in React's request-level `cache()` dedup the way a direct call can.

**Benefit claimed.** Split-readiness. But the split-readiness actually comes from `lib/<domain>/service.ts` being the single seam where data logic lives — not from the transport. If you later extract a backend, you move `lib/*/service.ts` and `app/api/*` into it, and rewrite the *call sites* either way. Whether those call sites currently say `await listArenas(params)` or `await fetchInternalApi("/api/arena?...")`, they both need to change to point at a remote base URL. The HTTP hop today buys nothing that a typed service call doesn't.

**It's already breaking down.** `app/arena/page.tsx:6-9` is `export const dynamic = "force-dynamic"` and calls `listArenas()` directly. The documented exception in `AGENTS.md` covers only statically-generated/ISR pages that physically cannot self-fetch at build time. This page is neither. So the codebase currently pays the round-trip cost on `/user/[id]` while silently ignoring the rule on `/arena` — the worst of both: cost *and* inconsistency.

**Recommendation:** invert the rule. RSCs call `lib/<domain>/service.ts` directly. `app/api/*` remains a parallel thin adapter over the *same* service functions, for client components and future external consumers. One place the query logic lives, no round trip, no cookie forwarding, no `Host`-header primitive. `AGENTS.md` gets updated to match. → **Task 11**

This is your call, not mine — it contradicts a rule you deliberately wrote and documented. If you want the HTTP boundary kept, say so and Task 11 becomes "pin `fetchInternalApi`'s host to an env var and fix `app/arena/page.tsx` to comply," which closes SEC-8 without the inversion. Everything else in the plan is unaffected either way.

## ARCH-2 · The core product has no persistence

The Prisma schema's complete model list: `User`, `Role`, `UserRole`, `Skill`, `UserSkill`, `JobType`, `UserJobType`, `Follows`, `Arena`, `ArenaInvitation`, `ArenaTeam`, `ArenaTeamMember`, `Tag`, `TagOnArena`.

There is **no `Company`, no `Review`, no `SalarySubmission`, no `Comment`** — for an app whose own `<title>` is *"Devs Arena — Egypt tech salary transparency"* and whose tagline is *"Real salaries. Real reviews. Every Egyptian tech company, indexed."*

What exists instead:
- `lib/companies/data.ts` — a static `COMPANIES` array. `lib/companies/service.ts` is a filter over it. `app/api/companies/route.ts` serves it.
- `components/companies/SubmitSalaryModal.tsx` + its six section components — a complete, polished submission form that persists nothing.
- `components/companies/CommentSection.tsx` / `lib/companies/mockComments.ts` — mock.

**The arena domain is half-wired in a way that's easy to miss.** `app/api/arena/[id]/route.ts` is a correct, working, auth-aware endpoint calling `getArenaDetail()`. And `app/arena/[id]/page.tsx` **does not call it** — it renders `MOCK_ARENA_DATA` (lines 12-70) and casts it through `as ArenaDetailClientProps["arena"]` (line 154) to silence the type mismatch. Same for `app/arena/[id]/teams/page.tsx`. `generateMetadata()` at line 72 ignores its `params` entirely, so **every arena page in the app emits identical `<title>`, OG tags, and JSON-LD** — actively harmful for the SEO the JSON-LD block was added to serve.

So: a working API route, a working service, a working page, and no wire between them. That is the cheapest high-value fix in this plan. → **Tasks 12, 13**

## ARCH-3 · 52% of the app is a client component

83 of 160 files under `app/` and `components/` carry `"use client"`. Consequences visible in the code:

- `AuthProvider` (`components/providers/AuthProvider.tsx`) fetches `/api/auth/me` from a `useEffect` on every mount. User state is therefore *never* available on first paint — the Nav renders logged-out, then flips. That is both a layout shift and an extra round trip on every navigation, and it exists only because auth state isn't read server-side in the root layout where it's already available.
- `ArenasListClient` receives SSR data then immediately discards it (below).

**Fix:** read the user once in the RSC root layout, pass it as the store's initial state, and let `AuthProvider` hydrate rather than fetch. → **Task 14**

## ARCH-4 · No CI, and the lint gate is already red

No `.github/`, no `.gitlab-ci.yml`, no `vercel.json`. `AGENTS.md` requires `npx tsc --noEmit` and `npx eslint` before considering work done — but nothing enforces it, and `npx eslint app components lib prisma` currently reports **14 errors and 8 warnings**. The stated policy and the actual state have already diverged, which means the policy isn't functioning as a gate. With no test suite and "the deployed Vercel build is the review surface," an unenforced lint rule is the only automated quality signal there is. → **Task 0** (fix the baseline) and **Task 15** (enforce it).

## ARCH-5 · Dependency hygiene

- **`yup` (^1.7.1) is dead** — zero imports across the entire repo (`grep` for `from "yup"` → 0 hits). Left over from the zod migration. Remove.
- **`shadcn` (^4.13.0) is in `dependencies`, not `devDependencies`** — that's the scaffolding CLI, shipped into every production install.
- **No error monitoring.** `lib/server/logger.ts` writes to console; on Vercel that means errors are visible only if someone is watching the log stream. For an app handling auth and (soon) salary data, add Sentry or equivalent.

## Frontend findings

**FE-1 · 1,252 hardcoded hex literals across 93 files — against a token system that already exists.**

`app/globals.css:10-33` defines a complete palette (`--background: #F1EFE9`, `--foreground: #0E0E0D`, `--card`, `--muted`, `--accent`, `--orange`…) and wires it into Tailwind via `@theme inline` (lines 35-67). So `bg-background`, `text-foreground`, `border-border` all work today. They are largely unused. Instead:

| Literal | Occurrences | Token that already exists |
|---|---:|---|
| `#0E0E0D` | 888 | `--foreground` / `text-foreground` |
| `#F1EFE9` | 210 | `--background` / `bg-background` |
| `#FAF8F5` | 86 | ≈ `--card` (note: `--card` is `#FAFAF8`, a *third* near-identical off-white — the drift has already started) |
| `#E4E1D9` | 8 | `--secondary` / `--muted` |

This is the largest single source of future refactor cost in the repo. A dark mode, a rebrand, or an accessibility contrast pass currently means a 93-file sweep with no compiler help. It is also *mechanically* fixable — these are exact-string substitutions. → **Task 16**

**FE-2 · `ArenasListClient` double-fetches on every page load and computes stale counts.**

`app/arena/page.tsx` server-renders the first page of arenas and passes it as `initialArenas`. Then `app/arena/ArenasListClient.tsx:48-82` runs a `useEffect` on mount whose dependency array is all-defaults on first render — so it immediately re-requests `/api/arena?page=1&limit=50&status=all&access=all&search=&sortBy=newest&tab=all`, the exact data the server just sent. Every visit to `/arena` costs two full list queries.

Worse, three derived values never update: `billboardArenas` (line 85), `myCount` (line 96), and `allCount={initialArenas.length}` (line 165) are all computed from `initialArenas` only. The moment a user filters or paginates, the sidebar counts and the billboard describe a data set that is no longer on screen. `totalCount` from the API is available and unused for this.

Also: the fetch has no error surface — `console.error` (line 73) and the UI shows nothing.

→ **Task 17**

**FE-3 · Production ships a form pre-filled with test fixtures.**

`app/arena/create/page.tsx:68-96` — `defaultValues` hardcodes `"CYBERPUNK ALGORITHM BATTLE 2026"`, an Unsplash cover URL, `"CAIRO TECH INNOVATION HUB"`, fixed 2026 dates, and a full `rulesText`. Introduced by commit `e1dfb2f` (`test(arena): add pre-populated testing defaultValues to arena creation form for 1-click test creation`) — a deliberate dev convenience that was never gated and is live for real users. → **Task 18**

**FE-4 · ~22 unlabeled form controls.** 58 `<input>`/`<select>`/`<textarea>` elements; 23 `htmlFor` associations and 12 `aria-label`s. The gap is roughly 22 controls with no accessible name, against an `AGENTS.md` rule that explicitly requires one. → **Task 19**

**FE-5 · React Compiler bailouts.** Four `react-hooks/set-state-in-effect` errors (`components/auth/AuthModal.tsx:35,42`; `components/ui/SearchableDropdown.tsx:51`; `lib/client/useRecentSearches.ts:12`) cause cascading renders. Three `react-hooks/incompatible-library` warnings (`app/arena/create/page.tsx:99`, `components/profile/EditProfileModal.tsx:117`, `components/signup/SignupForm.tsx:55`) mean **the React Compiler silently skips optimizing those components entirely** — including the two largest forms in the app. All three trace to the same pattern: `watch("field") as SomeType`, a cast used to paper over the zod input/output generic mismatch (14 such casts in the create page alone at lines 99-117). → **Task 0** and **Task 20**

**FE-6 · Missing App Router conventions.** No `loading.tsx`, no `not-found.tsx`, no `robots.ts`, no `sitemap.ts` anywhere in `app/`. `app/user/[id]/page.tsx:22` calls `notFound()` with no `not-found.tsx` to render it, and `app/arena/page.tsx` is `force-dynamic` with no streaming fallback. For an SEO-driven salary site, the missing `sitemap.ts` is a product gap, not just a polish item. → **Task 21**

**FE-7 · `<a>` where `<Link>` belongs.** `app/error.tsx:31` and `app/billboard/page.tsx:17` — full page reloads on the two pages users hit when something has already gone wrong. → **Task 0**

---

# Part 4 — Remediation Plan

## Phasing

| Phase | Tasks | Theme | Gate before proceeding |
|---|---|---|---|
| **0** | 0 | Green the lint baseline | `npx eslint` exits 0 |
| **1** | 1–8 | Security. **Ship before any feature work.** | All Part 2 Critical/High closed |
| **2** | 9–15 | Architecture: real data, one seam, CI | Arena detail serves real data; CI blocks red builds |
| **3** | 16–21 | Frontend debt. Can run in parallel with features. | — |

Phase 1 tasks 1–3 are the ones that genuinely gate a public launch. Everything else is cost management.

---

## Phase 0

### Task 0: Green the lint baseline

**Files:**
- Modify: `components/ui/Button.tsx:10`
- Modify: `prisma/seed.ts:179-184`, `prisma/seed.ts:232`
- Modify: `app/error.tsx:31`, `app/billboard/page.tsx:17`
- Modify: `components/auth/AuthModal.tsx:30-45`
- Modify: `components/ui/SearchableDropdown.tsx:49-53`
- Modify: `lib/client/useRecentSearches.ts:8-20`

**Interfaces:**
- Produces: a clean `npx eslint app components lib prisma` exit 0, which every later task's verification step depends on.

- [ ] **Step 1: Confirm the current baseline**

```bash
npx eslint app components lib prisma
```
Expected: `✖ 22 problems (14 errors, 8 warnings)`. Record the list — you will diff against it.

- [ ] **Step 2: Auto-fix the mechanical errors**

```bash
npx eslint app components lib prisma --fix
npx eslint app components lib prisma
```
This clears the 7 `prefer-const` errors (`Button.tsx:10`, `seed.ts:179-184`). Expected after: 7 errors remain.

- [ ] **Step 3: Type the seed's `status` cast**

In `prisma/seed.ts:232`, replace `status: status as any` with the real enum:

```ts
import { ArenaStatus } from "@prisma/client";
// ...
status: status as ArenaStatus,
```

- [ ] **Step 4: Replace `<a>` with `<Link>` on the two internal navigations**

`app/error.tsx` — add `import Link from "next/link";` and change line 31's `<a href="/" className={...}>` to `<Link href="/" className={...}>` (closing tag too). Same in `app/billboard/page.tsx:17`.

- [ ] **Step 5: Fix `set-state-in-effect` in `useRecentSearches`**

`lib/client/useRecentSearches.ts` reads `localStorage` in an effect and immediately `setSearches`. Move the read into lazy initial state so it never causes a second render:

```ts
const [searches, setSearches] = useState<string[]>(() => {
  if (typeof window === "undefined") return [];
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch {
    // A corrupted or stale-format value is expected, not a bug - see the
    // original comment at the old catch site.
    return [];
  }
});
```

Delete the now-empty `useEffect` that did the initial read. Keep any effect that *writes* to localStorage on change — writing to an external system is exactly what effects are for.

- [ ] **Step 6: Fix `set-state-in-effect` in `SearchableDropdown` and `AuthModal`**

`components/ui/SearchableDropdown.tsx:49-53` syncs `searchQuery` from `displayValue` when closed. Derive it during render instead of storing a mirror:

```ts
// Instead of a searchQuery state mirrored from displayValue via an effect,
// keep only the user's in-progress typing and fall back to displayValue.
const [typedQuery, setTypedQuery] = useState<string | null>(null);
const searchQuery = isOpen ? (typedQuery ?? displayValue) : displayValue;
```
Reset `setTypedQuery(null)` in the existing open/close handler rather than in an effect.

`components/auth/AuthModal.tsx:30-45` sets state from `pathname`/`isOpen` in an effect. Compute both values during render from `usePathname()`/`useSearchParams()` — they are already synchronous reads, so no state is needed.

- [ ] **Step 7: Verify**

```bash
npx tsc --noEmit
npx eslint app components lib prisma
```
Expected: both exit 0. Then manually confirm the login modal still opens on `/login`, the searchable dropdown still filters, and recent searches still persist across reload.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "fix(lint): clear eslint baseline and remove react-hooks effect violations"
```

---

## Phase 1 — Security

### Task 1: Stop issuing refresh tokens to the browser (SEC-1)

**Files:**
- Modify: `app/api/auth/login/route.ts:49-59`
- Modify: `app/api/auth/me/route.ts:26-30, 55-68`
- Delete: `app/api/auth/login-saved/route.ts`
- Modify: `lib/client/saved-accounts.ts`
- Modify: `components/providers/AuthProvider.tsx:18-22`
- Modify: `components/login/LoginForm.tsx:77-81`
- Modify: `components/signup/SignupForm.tsx:86`
- Modify: `components/login/AccountSwitcher.tsx:45-80`

**Interfaces:**
- Produces: `SavedAccount` narrows to `{ email: string; name: string }` — no `refreshToken` field. `AccountSwitcher` selecting an account now calls `onSelectAccount(email)` and renders `LoginForm` with `prefilledEmail`, which it already supports (`components/login/LoginForm.tsx:26-30`).
- Consumes: nothing from other tasks.

- [ ] **Step 1: Remove the token from the three API responses**

`app/api/auth/login/route.ts` — delete the `session` block at lines 56-58, leaving:

```ts
return NextResponse.json({
  success: true,
  user: {
    id: data.user.id,
    email: data.user.email,
    fullName: data.user.user_metadata?.full_name || null,
  },
});
```

`app/api/auth/me/route.ts` — delete the `getSession()` call at lines 26-30 entirely (its only consumer was the token) and the `session` block at lines 65-67.

- [ ] **Step 2: Delete the token-exchange endpoint**

```bash
git rm app/api/auth/login-saved/route.ts
```

- [ ] **Step 3: Narrow `SavedAccount` and version the storage key**

Rewrite `lib/client/saved-accounts.ts`. The key change bumps the storage key so every existing browser abandons its stored tokens, and adds an explicit one-time purge of the old key:

```ts
// v2: the previous key stored a Supabase refresh token per account, which
// made any XSS on this origin a permanent account takeover. Tokens are now
// never sent to the browser (see app/api/auth/*). This key holds only the
// email and display name needed to prefill the login form.
const STORAGE_KEY = "devs_arena_saved_users_v2";
const LEGACY_STORAGE_KEY = "devs_arena_saved_users";

export interface SavedAccount {
  email: string;
  name: string;
}

function purgeLegacyStorage() {
  try {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // Storage unavailable (private mode, quota) - nothing to purge.
  }
}

export function getSavedAccounts(): SavedAccount[] {
  purgeLegacyStorage();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((a): a is SavedAccount =>
        typeof a === "object" && a !== null &&
        typeof (a as SavedAccount).email === "string" &&
        typeof (a as SavedAccount).name === "string"
      )
      .map(({ email, name }) => ({ email, name }));
  } catch {
    return [];
  }
}
```

Keep `setSavedAccounts`, `upsertSavedAccount`, and `removeSavedAccount` as they are, but they now operate on the narrowed type — TypeScript will point at every caller passing `refreshToken`.

- [ ] **Step 4: Drop `refreshToken` from all three call sites**

`components/providers/AuthProvider.tsx:18-22`, `components/login/LoginForm.tsx:77-81`, and `components/signup/SignupForm.tsx:86` each pass `refreshToken:` into `upsertSavedAccount`. Delete that property from all three. Example, `AuthProvider.tsx`:

```ts
upsertSavedAccount({
  email: data.user.email,
  name: data.user.fullName || data.user.email.split("@")[0],
});
```

- [ ] **Step 5: Rewrite `AccountSwitcher` to prefill instead of auto-login**

`components/login/AccountSwitcher.tsx` — the handler at lines 45-80 POSTs to the deleted endpoint. Replace the whole `fetch` flow with a callback that hands the email up to the parent so it renders `<LoginForm prefilledEmail={email} onBackToSwitcher={...} />`. The parent already supports both props. Remove the `if (!account.refreshToken)` guard at line 49 and any "session expired, please sign in" branch it fed, since password entry is now always required.

- [ ] **Step 6: Verify**

```bash
npx tsc --noEmit
npx eslint app components lib prisma
grep -rn "refreshToken\|refresh_token\|login-saved" app components lib
```
Expected: tsc and eslint exit 0; the grep returns **no results**.

Manual: log in → open DevTools → Application → Local Storage. Confirm `devs_arena_saved_users` is gone and `devs_arena_saved_users_v2` contains only `email` and `name`. Log out, click the saved account, confirm it prefills the email and demands a password.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "fix(security): stop issuing Supabase refresh tokens to the browser

Refresh tokens were returned by /api/auth/login and /api/auth/me (the
latter on every authenticated page load) and persisted in localStorage,
while /api/auth/login-saved exchanged any such token for a live session
with no password. Any XSS on the origin was therefore a permanent,
password-less account takeover for every account saved in that browser.

Saved accounts now store email and display name only; switching accounts
prefills the login form and requires the password. The storage key is
versioned so existing browsers drop their stored tokens on next load."
```

---

### Task 2: Validate redirect targets and the OAuth provider (SEC-2, SEC-10)

**Files:**
- Modify: `lib/url.ts`
- Create: `lib/url.test.ts`
- Modify: `app/api/auth/callback/route.ts:9, 45-46`
- Modify: `app/api/auth/oauth/route.ts:8-23`
- Modify: `package.json` (add a `test` script)

**Interfaces:**
- Produces: `safeRedirectPath(value: string | null, fallback: string): string` in `lib/url.ts` — returns `value` only if it is a same-origin relative path, otherwise `fallback`. Used by Tasks 2 and 4.

- [ ] **Step 1: Write the failing test**

This is a security control with a precise contract and cheap pure-function tests — the one place in this repo where a test file earns itself. Create `lib/url.test.ts`:

```ts
import { describe, it, expect } from "node:test/reporters" // placeholder, see Step 2
```

Use Node's built-in runner — no new dependency. Create `lib/url.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { safeRedirectPath } from "./url.ts";

const FALLBACK = "/";

test("accepts same-origin relative paths", () => {
  assert.equal(safeRedirectPath("/user/123", FALLBACK), "/user/123");
  assert.equal(safeRedirectPath("/arena?tab=my", FALLBACK), "/arena?tab=my");
});

test("rejects absolute URLs to another origin", () => {
  assert.equal(safeRedirectPath("https://evil.com/steal", FALLBACK), FALLBACK);
  assert.equal(safeRedirectPath("http://evil.com", FALLBACK), FALLBACK);
});

test("rejects protocol-relative URLs", () => {
  assert.equal(safeRedirectPath("//evil.com/steal", FALLBACK), FALLBACK);
  assert.equal(safeRedirectPath("/\\evil.com", FALLBACK), FALLBACK);
  assert.equal(safeRedirectPath("/\/evil.com", FALLBACK), FALLBACK);
});

test("rejects non-http schemes and empty input", () => {
  assert.equal(safeRedirectPath("javascript:alert(1)", FALLBACK), FALLBACK);
  assert.equal(safeRedirectPath("", FALLBACK), FALLBACK);
  assert.equal(safeRedirectPath(null, FALLBACK), FALLBACK);
});
```

- [ ] **Step 2: Add the test script and run it to verify it fails**

In `package.json` `scripts`, add:

```json
"test": "tsx --test \"lib/**/*.test.ts\""
```

`tsx` is already a devDependency. Run:

```bash
npm test
```
Expected: FAIL — `safeRedirectPath` is not exported from `lib/url.ts`.

- [ ] **Step 3: Implement `safeRedirectPath`**

Append to `lib/url.ts`:

```ts
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
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
npm test
```
Expected: all 4 tests PASS.

- [ ] **Step 5: Apply it at the callback**

`app/api/auth/callback/route.ts` — import it and replace line 45:

```ts
import { safeRedirectPath } from "@/lib/url";
// ...
const finalRedirect = safeRedirectPath(redirectTo, `/user/${user.id}`);
return NextResponse.redirect(new URL(finalRedirect, request.url));
```

- [ ] **Step 6: Apply it at OAuth initiation, and allow-list the provider**

`app/api/auth/oauth/route.ts` — replace lines 8-23:

```ts
import { safeRedirectPath } from "@/lib/url";

const ALLOWED_PROVIDERS = ["google", "github"] as const;
type AllowedProvider = (typeof ALLOWED_PROVIDERS)[number];

function isAllowedProvider(value: string | null): value is AllowedProvider {
  return value !== null && (ALLOWED_PROVIDERS as readonly string[]).includes(value);
}
```

Then in the handler:

```ts
const provider = searchParams.get("provider");
if (!isAllowedProvider(provider)) {
  return NextResponse.json({ error: "Unsupported provider." }, { status: 400 });
}
const redirectTo = safeRedirectPath(searchParams.get("redirectTo"), "");
```

and drop the `as Provider` cast at line 19 — `provider` is now correctly narrowed.

Adjust `ALLOWED_PROVIDERS` to match whatever is actually enabled in the Supabase project; check `components/login/shared/OAuthOptions.tsx` for the buttons the UI renders.

- [ ] **Step 7: Verify**

```bash
npm test && npx tsc --noEmit && npx eslint app lib
```

Manual, against a running dev server:
```
/api/auth/oauth?provider=google&redirectTo=https://example.com   → lands back on the app, not example.com
/api/auth/oauth?provider=google&redirectTo=//example.com         → lands back on the app
/api/auth/oauth?provider=notareal                                → 400 "Unsupported provider."
```

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "fix(security): reject off-origin redirect targets and unknown OAuth providers

new URL(target, base) resolves both 'https://evil.com' and '//evil.com' to
the attacker's origin, so /api/auth/callback's unvalidated redirectTo was
an open redirect reachable via /api/auth/oauth - a phishing flow that
authenticates the victim for real on the genuine domain before handing
them to an attacker page. Redirect targets are now restricted to
same-origin relative paths, covered by tests in lib/url.test.ts."
```

---

### Task 3: Rate-limit auth and upload endpoints (SEC-3)

**Files:**
- Create: `lib/server/rate-limit.ts`
- Modify: `app/api/auth/login/route.ts`, `app/api/auth/signup/route.ts`, `app/api/auth/reset-password/route.ts`, `app/api/auth/change-password/route.ts`
- Modify: `app/api/arena/upload/route.ts`, `app/api/profile/upload/route.ts`

**Interfaces:**
- Produces: `checkRateLimit(key: string, opts: { limit: number; windowMs: number }): { ok: true } | { ok: false; retryAfterSeconds: number }` and `clientKey(request: Request, prefix: string): string`.

- [ ] **Step 1: Implement the limiter**

Create `lib/server/rate-limit.ts`:

```ts
import "server-only";

/**
 * In-process fixed-window limiter. On Vercel each serverless instance keeps
 * its own map, so the effective limit is (limit x instances) rather than a
 * hard global cap - this raises an attacker's cost substantially without
 * external infrastructure, but it is NOT a durable guarantee. Move to Vercel
 * KV / Upstash Redis before relying on it for anything stronger than
 * slowing down credential stuffing.
 */
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const MAX_TRACKED_KEYS = 10_000;

export type RateLimitResult = { ok: true } | { ok: false; retryAfterSeconds: number };

export function checkRateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now >= existing.resetAt) {
    // Cheap unbounded-growth guard: a full sweep only when the map is large.
    if (buckets.size >= MAX_TRACKED_KEYS) {
      for (const [k, b] of buckets) {
        if (now >= b.resetAt) buckets.delete(k);
      }
    }
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (existing.count >= limit) {
    return { ok: false, retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000) };
  }

  existing.count += 1;
  return { ok: true };
}

/**
 * Vercel sets x-forwarded-for; the leftmost entry is the client. Falls back
 * to a shared bucket when absent, which is intentionally conservative.
 */
export function clientKey(request: Request, prefix: string): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";
  return `${prefix}:${ip}`;
}
```

- [ ] **Step 2: Apply to `POST /api/auth/login`**

Inside the `withApiErrorHandling` callback in `app/api/auth/login/route.ts`, before reading the body:

```ts
import { checkRateLimit, clientKey } from "@/lib/server/rate-limit";
// ...
const limit = checkRateLimit(clientKey(request, "login"), { limit: 10, windowMs: 60_000 });
if (!limit.ok) {
  return NextResponse.json(
    { error: "Too many attempts. Please try again shortly." },
    { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
  );
}
```

- [ ] **Step 3: Apply the same guard to the remaining endpoints**

Identical block, differing only in prefix and budget:

| Route | prefix | limit | windowMs |
|---|---|---:|---:|
| `app/api/auth/signup/route.ts` | `"signup"` | 5 | 3_600_000 |
| `app/api/auth/reset-password/route.ts` | `"reset"` | 3 | 3_600_000 |
| `app/api/auth/change-password/route.ts` | `"change-pw"` | 5 | 3_600_000 |
| `app/api/arena/upload/route.ts` | `"upload-arena"` | 20 | 3_600_000 |
| `app/api/profile/upload/route.ts` | `"upload-profile"` | 20 | 3_600_000 |

For the two upload routes and `change-password`, key on the authenticated user instead of the IP — place the check *after* `requireUser()` and use `` `upload-arena:${user.id}` `` directly rather than `clientKey`.

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit && npx eslint app lib
```

Manual, against a running dev server:
```bash
for i in $(seq 1 12); do
  curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/auth/login \
    -H 'Content-Type: application/json' -d '{"email":"a@b.co","password":"wrong"}'
done
```
Expected: ten `401`s, then `429`s with a `Retry-After` header.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(security): rate-limit auth and upload endpoints

Login, signup, password reset, and both upload routes accepted unlimited
requests - enabling credential stuffing, reset-email bombing of arbitrary
third parties from our domain, and unbounded writes through the
service-role storage client. Adds an in-process fixed-window limiter;
see the module comment for why this is a cost increase rather than a hard
cap on serverless, and what to replace it with."
```

---

### Task 4: Make `proxy.ts` fail closed (SEC-4)

**Files:**
- Modify: `proxy.ts:12-14, 44-59`

- [ ] **Step 1: Extract the protected-route decision so both paths share it**

Replace the body of `proxy.ts` from line 12 onward:

```ts
const PROTECTED_PREFIXES = ["/admin", "/profile", "/user", "/arena/create"];

function isProtected(pathname: string) {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("redirectTo", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}
```

- [ ] **Step 2: Fail closed on both the misconfiguration and the exception path**

```ts
if (!supabaseUrl || !supabaseAnonKey) {
  // Fail closed: without Supabase configured we cannot establish identity,
  // so a protected route must not be served.
  return isProtected(request.nextUrl.pathname) ? redirectToLogin(request) : supabaseResponse;
}
```

and replace the catch at lines 55-57:

```ts
} catch (err) {
  logger.error("Proxy auth check failed", {
    error: err instanceof Error ? err.message : String(err),
    pathname: request.nextUrl.pathname,
  });
  // Fail closed - a Supabase outage must not silently disable the
  // optimistic auth layer for protected routes.
  if (isProtected(request.nextUrl.pathname)) return redirectToLogin(request);
}
```

Add `import { logger } from "@/lib/server/logger";` at the top and delete the `console.error`.

- [ ] **Step 3: Rewrite the main check to use the helpers**

Lines 44-54 become:

```ts
if (isProtected(request.nextUrl.pathname) && !user) {
  return redirectToLogin(request);
}
```

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit && npx eslint proxy.ts
```

Manual: while logged out, hit `/arena/create` — expect a redirect to `/login?redirectTo=/arena/create` (previously it rendered the full form). Then temporarily blank `NEXT_PUBLIC_SUPABASE_URL` in `.env`, restart, and confirm `/profile` redirects rather than rendering. Restore `.env`.

- [ ] **Step 5: Commit**

```bash
git add proxy.ts
git commit -m "fix(security): fail closed in proxy auth check and protect /arena/create

The catch block returned the pass-through response, so any error from
supabase.auth.getUser() - an outage, a network blip, a bad key - silently
disabled the protected-route check instead of denying. Same for the
missing-env early return. Both now redirect to /login for protected
prefixes, and the log goes through lib/server/logger per the logging policy."
```

---

### Task 5: Add security headers and an Origin check (SEC-5, SEC-11)

**Files:**
- Modify: `next.config.ts`
- Modify: `lib/server/api-route.ts`

- [ ] **Step 1: Add the headers block**

In `next.config.ts`, add to `nextConfig`:

```ts
const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    // Report-Only first: this app uses GSAP and an inline JSON-LD <script>,
    // and Next injects inline bootstrap scripts, so 'unsafe-inline' is
    // required until a nonce is wired through. Promote to the enforcing
    // header once the violation reports are quiet.
    key: "Content-Security-Policy-Report-Only",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://*.supabase.co https://images.unsplash.com",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

// inside nextConfig:
async headers() {
  return [{ source: "/:path*", headers: SECURITY_HEADERS }];
},
```

- [ ] **Step 2: Add the same-origin assertion for mutations**

`withApiErrorHandling` is the one place every route already passes through. Extend it in `lib/server/api-route.ts`:

```ts
/**
 * Supabase's SSR cookies are SameSite=Lax, which already blocks cross-site
 * POSTs - but that is a library default this app never declared a dependency
 * on. This makes the requirement explicit so a cookie-config change surfaces
 * as a 403 rather than a silent CSRF exposure.
 */
function isSameOriginMutation(request: Request): boolean {
  if (request.method === "GET" || request.method === "HEAD") return true;

  const site = request.headers.get("sec-fetch-site");
  if (site) return site === "same-origin" || site === "none";

  // Older clients without Sec-Fetch-Site: compare Origin to Host.
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) return true;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
```

Change the signature to accept the request and check it first:

```ts
export async function withApiErrorHandling(
  label: string,
  fn: () => Promise<NextResponse>,
  errorMessage = "Internal server error.",
  request?: Request
): Promise<NextResponse> {
  if (request && !isSameOriginMutation(request)) {
    logger.warn("Cross-origin mutation rejected", { label });
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  try {
    return await fn();
  } catch (err) {
    logger.error(label, { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
```

The optional 4th parameter keeps all existing call sites compiling. Pass `request` at every non-GET route: `app/api/arena/route.ts` (POST), `app/api/arena/upload/route.ts`, `app/api/profile/update/route.ts`, `app/api/profile/upload/route.ts`, `app/api/user/follow/route.ts`, and all four remaining `app/api/auth/*` POSTs.

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit && npx eslint app lib next.config.ts
```

Manual, against a running dev server:
```bash
curl -sI http://localhost:3000/ | grep -iE 'x-frame|x-content|referrer|permissions|content-security'
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/user/follow \
  -H 'Content-Type: application/json' -H 'Origin: https://evil.com' -d '{"targetUserId":"x"}'
```
Expected: all five headers present; the cross-origin POST returns `403`. Then click through the app — create an arena, edit a profile, follow a user — and confirm the browser console shows **no** CSP violation reports that would break the page once the header is enforced.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(security): add security headers and reject cross-origin mutations

No CSP, HSTS, frame-ancestors, nosniff, or Referrer-Policy were set. The
referrer gap matters specifically here because auth URLs carry code and
redirectTo in the query string. CSP ships Report-Only until the inline
JSON-LD and GSAP usage are confirmed clean. Mutations now assert
same-origin explicitly rather than relying on an undeclared SameSite=Lax
default."
```

---

### Task 6: Close the enumeration oracle and raise the password floor (SEC-6)

**Files:**
- Create: `lib/auth/schema.ts`
- Modify: `app/api/auth/signup/route.ts:11-24`
- Modify: `app/api/auth/change-password/route.ts:13-17`
- Modify: `components/login/LoginForm.tsx:18-21`
- Modify: `components/signup/SignupForm.tsx` (its local schema)

**Interfaces:**
- Produces: `passwordSchema` and `signupSchema` in `lib/auth/schema.ts`, per the AGENTS.md rule that validation rules live in one place shared by client and route.

- [ ] **Step 1: Create the shared schema**

```ts
import * as z from "zod";

/**
 * Single source of truth for password rules - imported by the login and
 * signup forms, the signup route, and the change-password route. Previously
 * each of those had its own min(6) (or, in the signup route's case, no
 * server-side rule at all, deferring entirely to the Supabase project default).
 */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters"); // bcrypt's input limit

export const signupSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: passwordSchema,
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
  roleName: z.enum(["USER", "COMPANY"]).default("USER"),
});

export const loginSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
```

Note `roleName` is now an allow-list that **excludes `ADMIN`** — `app/api/auth/signup/route.ts:11` currently destructures `roleName` straight from the request body and passes it to `syncUser()`, whose signature accepts `"ADMIN"`. Whether that grants anything today depends on the seeded roles, but self-assigning a role name at signup is not something to leave open ahead of the RBAC work noted in SEC-10.

- [ ] **Step 2: Rewrite the signup route to be enumeration-safe**

In `app/api/auth/signup/route.ts`, replace the ad-hoc destructure at line 11 and **delete the Prisma pre-check at lines 18-24 entirely**:

```ts
const parsed = signupSchema.safeParse(await request.json());
if (!parsed.success) {
  const first = parsed.error.issues[0];
  return NextResponse.json({ error: first?.message ?? "Invalid request." }, { status: 400 });
}
const { email, password, fullName, roleName } = parsed.data;
```

Then make the response uniform. Supabase's `signUp` is already enumeration-safe — it returns a success-shaped response for an existing address rather than an error — so the only thing that leaked was our own pre-check. Return the same body regardless:

```ts
// Deliberately uniform: revealing whether an address is registered is a
// privacy leak on a salary-transparency site, and this endpoint is
// unauthenticated. Supabase's own signUp response is already
// enumeration-safe; the Prisma pre-check that used to sit here was not.
return NextResponse.json({
  success: true,
  message: "Check your email to confirm your account.",
});
```

Keep the `syncUser` call, but only when `data.user` is present.

- [ ] **Step 3: Use `passwordSchema` in change-password and both forms**

`app/api/auth/change-password/route.ts` — replace the `password.length < 6` check with `passwordSchema.safeParse(password)` and return its first issue message.

`components/login/LoginForm.tsx:18-21` — delete the local `loginSchema` and import it from `@/lib/auth/schema`. Same for the signup form's local schema.

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit && npx eslint app components lib
```

Manual: sign up with an address that already exists → expect the same "Check your email" message as a fresh address, with no indication either way. Try a 7-character password on signup and on change-password → both rejected with the same message.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "fix(security): remove signup enumeration oracle and share the password schema

The signup route queried Prisma for the email and returned 'Email address
is already registered', an unauthenticated oracle for account existence on
a salary-transparency site. Responses are now uniform. Password rules move
to lib/auth/schema.ts at an 8-character floor, replacing three independent
min(6) checks and the signup route's complete absence of a server-side
rule. roleName is now an allow-list that excludes ADMIN."
```

---

### Task 7: Stop leaking internal errors (SEC-7)

**Files:**
- Modify: `app/api/arena/route.ts:25-38`
- Modify: `app/api/arena/upload/route.ts:29-36`
- Modify: `app/api/profile/upload/route.ts:38-46`
- Modify: `lib/server/upload.ts:43-45`

- [ ] **Step 1: Delete the inner catch in the arena route**

`app/api/arena/route.ts` lines 25-38 wrap `createArena` in a try/catch that returns `err.message` with a 500 and logs via `console.error`. Both jobs already belong to the enclosing `withApiErrorHandling`. Collapse to:

```ts
const result = await createArena({ ...parsed.data, creatorId: user.id });
if ("error" in result) {
  return NextResponse.json({ error: result.error }, { status: 400 });
}
return NextResponse.json({ success: true, id: result.id });
```

The `{ error: string }` branch is the service's own *expected* validation failure ("This invitation code is already in use") and is safe to surface — it's the unexpected exception path that was leaking.

- [ ] **Step 2: Do the same for both upload routes**

In `app/api/arena/upload/route.ts` and `app/api/profile/upload/route.ts`, replace the try/catch around `uploadImageToStorage` with a bare `const { publicUrl } = await uploadImageToStorage({ ... });` and let the wrapper handle failure.

- [ ] **Step 3: Stop embedding the bucket name in the thrown message**

`lib/server/upload.ts:44` — the message is what reached the client. Log the detail, throw a plain error:

```ts
import { logger } from "@/lib/server/logger";
// ...
if (uploadError) {
  logger.error("Supabase storage upload failed", { bucket, path, error: uploadError.message });
  throw new Error("Upload failed.");
}
```

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit && npx eslint app lib
grep -rn "console\." app/api lib/server
```
Expected: tsc and eslint clean; the grep returns only `lib/client/logger.ts` and `lib/server/logger.ts` (the logger implementations themselves) — no API route hits.

Manual: submit an arena with a duplicate `inviteCode` → still see the friendly 400. Then temporarily rename the storage bucket in `lib/server/upload.ts`'s default and attempt an upload → the client sees a generic message while the server log carries the bucket name.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "fix(security): stop returning internal error detail to API clients

Three routes caught exceptions and returned err.message verbatim with a
500 - Prisma errors carry table, column, and constraint names, and the
storage helper had already decorated its error with the literal bucket
name. These inner catches also bypassed withApiErrorHandling and logged
through console instead of lib/server/logger."
```

---

### Task 8: Escape the JSON-LD payload (SEC-9)

**Files:**
- Modify: `lib/url.ts` (or create `lib/server/json-ld.ts`)
- Modify: `lib/url.test.ts`
- Modify: `app/arena/[id]/page.tsx:150-153`

**Interfaces:**
- Produces: `serializeJsonLd(value: unknown): string`. Task 12 depends on this existing *before* it wires real data into that page.

- [ ] **Step 1: Write the failing test**

Append to `lib/url.test.ts` (or a new `lib/json-ld.test.ts` matching wherever you put the function):

```ts
import { serializeJsonLd } from "./json-ld.ts";

test("escapes script-closing sequences", () => {
  const out = serializeJsonLd({ name: "</script><script>alert(1)</script>" });
  assert.ok(!out.includes("</script>"));
  assert.ok(out.includes("\\u003c"));
});

test("round-trips to the same value", () => {
  const input = { name: "Cairo <Arena> & Co", n: 3 };
  assert.deepEqual(JSON.parse(serializeJsonLd(input)), input);
});
```

- [ ] **Step 2: Run it to verify it fails**

```bash
npm test
```
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

Create `lib/json-ld.ts`:

```ts
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
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
npm test
```
Expected: PASS.

- [ ] **Step 5: Use it at the render site**

`app/arena/[id]/page.tsx:150-153`:

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
/>
```

- [ ] **Step 6: Verify**

```bash
npm test && npx tsc --noEmit && npx eslint app lib
```
Manual: load an arena page, View Source, confirm the `ld+json` block is present and contains `<` where a `<` would be. Paste the block into Google's Rich Results Test to confirm it still validates.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "fix(security): escape JSON-LD payload before injecting into a script tag

JSON.stringify leaves '<' intact, so once real arena titles reach this
page (see the mock-data removal task) a title containing </script> would
be stored XSS on a public, SEO-indexed page. Fixed ahead of that wiring
rather than after."
```

---

## Phase 2 — Architecture

### Task 9: Model the core product — `Company`, `Review`, `SalarySubmission`

**Files:**
- Create: `prisma/schema/company/company.prisma`
- Create: `prisma/schema/migrations/<timestamp>_add_company_review_salary/migration.sql`
- Modify: `prisma/schema/user/user.prisma` (back-relations)
- Modify: `prisma/seed.ts`

This is the largest task in the plan and the one that turns the prototype into a product. It is scheduled after security and before the frontend work because Tasks 10 and 13 depend on the models existing.

- [ ] **Step 1: Define the models**

Create `prisma/schema/company/company.prisma`. Field choices mirror what `components/companies/SubmitSalaryModal*.tsx` and `lib/companies/types.ts` already collect — read those first and match them exactly rather than inventing a shape:

```prisma
model Company {
  id          String    @id @default(uuid()) @db.Uuid
  name        String    @unique
  slug        String    @unique
  logoUrl     String?
  website     String?
  industry    String?
  headcount   String?
  description String?   @db.Text

  reviews     Review[]
  salaries    SalarySubmission[]

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([slug])
  @@map("companies")
}

model Review {
  id                String   @id @default(uuid()) @db.Uuid
  companyId         String   @db.Uuid
  company           Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  authorId          String   @db.Uuid
  author            User     @relation(fields: [authorId], references: [id], onDelete: Cascade)

  overallRating     Int
  compensationRating Int
  cultureRating     Int
  managementRating  Int
  title             String
  body              String   @db.Text
  isAnonymous       Boolean  @default(true)

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([companyId, createdAt])
  @@index([authorId])
  @@map("reviews")
}

model SalarySubmission {
  id             String   @id @default(uuid()) @db.Uuid
  companyId      String   @db.Uuid
  company        Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  authorId       String   @db.Uuid
  author         User     @relation(fields: [authorId], references: [id], onDelete: Cascade)

  jobTitle       String
  seniority      String
  employmentType String
  baseMonthlyEgp Int
  bonusAnnualEgp Int?
  yearsExperience Int
  yearsAtCompany Int
  location       String

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@index([companyId, jobTitle])
  @@index([authorId])
  @@map("salary_submissions")
}
```

**On anonymity:** `authorId` is retained (needed for rate limiting, moderation, and one-submission-per-company-per-user), but it must never appear in any API response for a review marked `isAnonymous`. That is exactly the job of a `dto.ts` — Task 10 enforces it there, not in the component.

- [ ] **Step 2: Add the back-relations on `User`**

In `prisma/schema/user/user.prisma`, alongside the existing relation fields:

```prisma
  reviews       Review[]
  salaries      SalarySubmission[]
```

- [ ] **Step 3: Generate and inspect the migration**

```bash
npx prisma migrate dev --name add_company_review_salary --create-only
```
Read the generated SQL before applying — this repo has a history of hand-checking migrations (see commit `5240df9`). Confirm the indexes are present and no destructive statement snuck in.

- [ ] **Step 4: Apply and regenerate**

```bash
npx prisma migrate dev
npx prisma generate
```

- [ ] **Step 5: Seed real companies from the existing static array**

`lib/companies/data.ts` already contains the company list. Add a seed block in `prisma/seed.ts` that upserts each entry by `slug`, so the DB starts with the same data the static page showed. Keep the array as the seed source for now; Task 10 removes it as a *runtime* dependency.

```bash
npx prisma db seed
```

- [ ] **Step 6: Verify**

```bash
npx prisma migrate status
npx tsc --noEmit
```
Expected: migrations up to date, tsc clean. Open Prisma Studio and confirm the `companies` table is populated with the same rows the `/companies/[id]` pages currently render.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(db): add Company, Review, and SalarySubmission models

The app's core feature - salary and review transparency - had no
persistence at all: companies were a static TypeScript array and the
submission modal wrote nowhere. Adds the three models with indexes on the
columns the list and detail queries filter by, and seeds companies from
the existing static array."
```

---

### Task 10: Build the `companies` domain data layer over the new models

**Files:**
- Create: `lib/companies/schema.ts`
- Rewrite: `lib/companies/service.ts`
- Create: `lib/companies/dto.ts`
- Modify: `lib/companies/types.ts`
- Modify: `app/api/companies/route.ts`
- Create: `app/api/companies/[id]/reviews/route.ts`
- Create: `app/api/companies/[id]/salaries/route.ts`
- Delete (runtime use): `lib/companies/data.ts`, `lib/companies/mockComments.ts`

**Interfaces:**
- Consumes: the Prisma models from Task 9.
- Produces: `listCompanies(query)`, `getCompanyBySlug(slug)`, `createReview(authorId, data)`, `createSalarySubmission(authorId, data)` in `lib/companies/service.ts`; `toCompanyDetailDto(raw)` and `toReviewDto(raw)` in `lib/companies/dto.ts`.

- [ ] **Step 1: Write the zod schemas**

`lib/companies/schema.ts` — mirror the field-by-field shape the existing modal sections collect. Read `components/companies/SalaryModalCompensationSection.tsx`, `SalaryModalJobDetailsSection.tsx`, `SalaryModalDurationSection.tsx`, and `SalaryModalRatingsSection.tsx` and derive the schema from what they actually render, then export the option lists from here so those components stop hardcoding them — the exact drift `lib/profile/schema.ts` already fixed for the profile module.

- [ ] **Step 2: Rewrite the service against Prisma**

Follow `lib/arena/service.ts` as the reference: a `COMPANY_LIST_SELECT` const, a `where` built from validated query params, `Promise.all([findMany, count])`, and the raw Prisma shape returned.

- [ ] **Step 3: Write the DTO — this is where anonymity is enforced**

`lib/companies/dto.ts`:

```ts
/**
 * A review marked isAnonymous must never carry its author's identity into a
 * response. This is enforced here rather than in the component because the
 * DTO is the only layer every consumer of a review passes through - a
 * component-level omission is one careless render away from a leak.
 */
export function toReviewDto(raw: RawReview): ReviewDto {
  return reviewDtoSchema.parse({
    ...raw,
    author: raw.isAnonymous
      ? null
      : { id: raw.author.id, fullName: raw.author.fullName, avatarUrl: raw.author.avatarUrl },
    authorId: undefined,
  });
}
```

- [ ] **Step 4: Update the routes**

`app/api/companies/route.ts` currently has no `withApiErrorHandling` and no validation at all (it is four lines). Bring it in line with `app/api/arena/route.ts`: validate the query with a zod schema, wrap in `withApiErrorHandling`, call the service. Add the two new POST routes for reviews and salaries, each `requireUser()`-gated and rate-limited using Task 3's helper.

- [ ] **Step 5: Delete the mock modules**

```bash
git rm lib/companies/mockComments.ts
```
Keep `lib/companies/data.ts` only if `prisma/seed.ts` imports it; otherwise remove it too. Fix the resulting type errors — `tsc` will point at every consumer.

- [ ] **Step 6: Verify**

```bash
npx tsc --noEmit && npx eslint app lib
```
Manual: `curl localhost:3000/api/companies` returns DB rows, not the static array. POST a review as a logged-in user and confirm it persists; POST it with `isAnonymous: true` and confirm the GET response contains **no** author id or name anywhere in the JSON.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(companies): back the companies domain with real persistence

Replaces the static COMPANIES array and mockComments with a Prisma-backed
service, zod schemas shared by form and route, and a DTO that strips
author identity from anonymous reviews before it can reach a response."
```

---

### Task 11: Collapse the data seam — RSCs call services directly

> **Decision required before starting.** This task inverts the rule in `AGENTS.md` ("Frontend/backend boundary"). See ARCH-1 for the reasoning and the alternative. If you want the HTTP boundary kept, skip to the variant in Step 5 instead.

**Files:**
- Modify: `app/user/[id]/page.tsx:19`
- Modify: `AGENTS.md` and `.agents/rules/architecture.md`
- Delete: `lib/server/api-client.ts`

- [ ] **Step 1: Find every call site**

```bash
grep -rn "fetchInternalApi" app components lib
```
Expected today: `lib/server/api-client.ts` (the definition) and `app/user/[id]/page.tsx:19`. Confirm before proceeding — if Phase 2 added more, they all change together.

- [ ] **Step 2: Convert `app/user/[id]/page.tsx` to a direct service call**

```tsx
import { notFound } from "next/navigation";
import { getUserProfileById } from "@/lib/user/service";
import { toUserProfileDto } from "@/lib/user/dto";
import { getOptionalUser } from "@/lib/server/auth/require-user";
import { ProfileView } from "@/components/profile/ProfileView";

export default async function UserPage({ params }: UserPageProps) {
  const { id } = await params;
  const viewer = await getOptionalUser();
  const raw = await getUserProfileById(id, viewer?.id ?? null);
  if (!raw) notFound();

  const { isOwner, ...profileData } = toUserProfileDto(raw);
  return (
    <main className="min-h-screen bg-background text-foreground">
      <ProfileView userProfile={profileData} isOwner={isOwner} />
    </main>
  );
}
```

Note this removes the `SerializedUserProfileDto` shim at lines 6-10 — `createdAt`/`lastActiveAt` are now real `Date` objects crossing the RSC boundary, which React serializes natively. `ProfileView`'s prop type needs updating from `string` to `Date` for those two fields; `tsc` will point at it.

`app/api/user/[id]/route.ts` stays exactly as it is — it calls the same `getUserProfileById` + `toUserProfileDto`, and remains the entry point for client components and any future external consumer.

- [ ] **Step 3: Delete the client**

```bash
git rm lib/server/api-client.ts
```

- [ ] **Step 4: Update the written rules**

In `AGENTS.md`, replace the "Frontend/backend boundary" section:

```markdown
## Frontend/backend boundary — services are the seam, not HTTP

This app is one Next.js codebase today but is intentionally kept ready to
split into a separately-deployed backend later. The seam that makes that
possible is `lib/<domain>/service.ts`: every piece of data logic lives
there, and nothing else talks to Prisma.

Server Components call those service functions directly. `app/api/**` is a
parallel thin adapter over the *same* functions, for client components and
future external consumers. Neither calls the other.

Pages and components must still never import `prisma` or construct a
Supabase client for business data - that restriction is unchanged and is
what the rule was actually protecting. What changed is the transport: an
RSC self-fetching over HTTP cost a full extra network hop and serverless
invocation per page render, forwarded the user's session cookie over the
wire, and made the target host depend on a client-controlled `Host` header.
A typed service call gives the same split-readiness at none of that cost:
when the backend is extracted, `lib/*/service.ts` and `app/api/*` move to
it and the call sites change either way.
```

Mirror the change in `.agents/rules/architecture.md`, removing the "one confirmed exception" paragraph — it no longer applies, since static and dynamic pages now use the same mechanism.

- [ ] **Step 5 (variant — only if keeping the HTTP boundary): pin the host instead**

Skip Steps 2-4. In `lib/server/api-client.ts`, replace the `Host`-header read with a configured origin, closing SEC-8 without the inversion:

```ts
const base = process.env.NEXT_PUBLIC_SITE_URL;
if (!base) throw new Error("NEXT_PUBLIC_SITE_URL must be set for internal API calls.");
return fetch(`${base}${path}`, { ... });
```

Then fix `app/arena/page.tsx:9` to comply with the rule it currently breaks, by routing through `fetchInternalApi` — noting it is `force-dynamic`, so the build-time exception does not cover it.

- [ ] **Step 6: Verify**

```bash
npx tsc --noEmit && npx eslint app lib && npm test
grep -rn "fetchInternalApi" app components lib
```
Expected: clean; grep returns nothing (or, on the variant path, only the pinned-host definition and its call sites).

Manual: load `/user/<some-id>` and confirm the profile renders identically. In the dev server log, confirm **one** request per page load rather than two.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "refactor(arch): call domain services directly from Server Components

RSCs previously HTTP-fetched this app's own /api routes, costing an extra
network hop and serverless invocation per render, forwarding the session
cookie over the wire, and deriving the target URL from the client-supplied
Host header. Split-readiness comes from lib/<domain>/service.ts being the
single data seam, not from the transport - app/api/* remains a parallel
adapter over the same functions. Rules in AGENTS.md updated to match."
```

---

### Task 12: Wire the arena detail page to real data

**Files:**
- Modify: `app/arena/[id]/page.tsx` (delete `MOCK_ARENA_DATA`, lines 12-70)
- Modify: `app/arena/[id]/teams/page.tsx` (delete its `MOCK_ARENA_DATA`)

**Interfaces:**
- Consumes: `getArenaDetail(uuid, viewerId)` from `lib/arena/service.ts` (already exists and is correct), and `serializeJsonLd` from Task 8.

- [ ] **Step 1: Replace the page body with a real fetch**

```tsx
export default async function ArenaDetailPage({ params }: PageProps) {
  const { id: slugParam } = await params;
  const uuid = extractUuidFromSlug(decodeURIComponent(slugParam));
  const viewer = await getOptionalUser();
  const result = await getArenaDetail(uuid, viewer?.id ?? null);
  if (!result) notFound();

  const { arena, meta } = result;
  const jsonLd = { /* built from `arena`, not the constant - see Step 2 */ };

  return (
    <>
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
      <ArenaDetailClient arena={arena} meta={meta} />
    </>
  );
}
```

The `as ArenaDetailClientProps["arena"]` cast at line 154 goes away — with real data the types line up, and if they don't, that mismatch is a genuine bug the cast was hiding. Fix the component's props rather than re-adding the cast.

- [ ] **Step 2: Make `generateMetadata` use its params**

It currently ignores `params` entirely (line 72), so every arena page emits identical title, OG tags, and JSON-LD:

```tsx
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id: slugParam } = await params;
  const uuid = extractUuidFromSlug(decodeURIComponent(slugParam));
  const result = await getArenaDetail(uuid, null);
  if (!result) return { title: "Arena Not Found | Devs Arena" };

  const { arena } = result;
  const cleanDescription = arena.description.replace(/[#*`>]/g, "").slice(0, 160).trim();
  // ...rest unchanged, reading from `arena`
}
```

Build the JSON-LD `location` from `arena.locationType`/`locationName` rather than the hardcoded `"CAIRO TECH INNOVATION HUB"`, and set `eventAttendanceMode` from `locationType` instead of always `OfflineEventAttendanceMode`.

- [ ] **Step 3: Do the same for the teams page**

`app/arena/[id]/teams/page.tsx` passes ~15 individual `MOCK_ARENA_DATA.*` props into its children. Replace with the real `arena` object from the same `getArenaDetail` call.

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit && npx eslint app && npm test
grep -rn "MOCK_ARENA_DATA" app
```
Expected: clean; the grep returns nothing.

Manual: create an arena via `/arena/create`, open it from `/arena`, and confirm the detail page shows *your* title, description, cover, dates, and rules. Open a second arena and confirm the browser tab title differs. View source on both and confirm the JSON-LD differs.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(arena): render arena detail and teams pages from real data

Both pages rendered a hardcoded MOCK_ARENA_DATA constant while a working,
auth-aware getArenaDetail service and /api/arena/[id] route sat unused
beside them. generateMetadata also ignored its params, so every arena URL
emitted an identical title, OG card, and JSON-LD payload."
```

---

### Task 13: Wire the salary and review UI to the new endpoints

**Files:**
- Modify: `components/companies/SubmitSalaryModal.tsx` and its six section components
- Modify: `components/companies/CommentSection.tsx`, `CommentComposer.tsx`, `CommentNode.tsx`
- Modify: `components/companies/SalaryBenchmarkSection.tsx`, `SalaryTrendChart.tsx`
- Modify: `app/companies/[id]/page.tsx`

- [ ] **Step 1: Point the modal at the real endpoint**

`SubmitSalaryModal` currently collects a complete payload and discards it. Add the `react-hook-form` + `zodResolver(salarySubmissionSchema)` wiring (Task 10's schema) and POST to `/api/companies/[id]/salaries`, following the submit handler in `app/arena/create/page.tsx:136-170` as the pattern — including its `useToast` success/error handling.

- [ ] **Step 2: Replace the option lists with schema imports**

The modal sections hardcode their `<option>` values. Import them from `lib/companies/schema.ts` per the AGENTS.md rule.

- [ ] **Step 3: Convert the page to fetch real aggregates**

`app/companies/[id]/page.tsx` is `revalidate = 3600` over static data (line 9). With real submissions the comment at lines 7-8 is no longer true. Keep ISR — company aggregates are a good fit for it — but note the tradeoff in an updated comment, and call `getCompanyBySlug()` directly (Task 11's pattern).

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit && npx eslint app components lib && npm test
```
Manual: submit a salary → confirm the row appears in Prisma Studio → confirm the benchmark section reflects it after revalidation. Post a review anonymously and confirm no author name appears anywhere in the rendered page or the network response.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(companies): persist salary submissions and reviews from the UI"
```

---

### Task 14: Hydrate auth state server-side

**Files:**
- Modify: `app/layout.tsx`
- Modify: `components/providers/AuthProvider.tsx`
- Modify: `lib/client/useAuthStore.ts`

- [ ] **Step 1: Read the user in the root layout**

`app/layout.tsx` is already a Server Component. Fetch the viewer once and pass it down:

```tsx
import { getOptionalUser } from "@/lib/server/auth/require-user";
import { getUserRoles } from "@/lib/server/auth/auth-service";

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getOptionalUser();
  const roles = user ? await getUserRoles(user.id) : ["GUEST"];
  // ...
  <AuthProvider initialUser={user ? { id: user.id, email: user.email!, fullName: user.user_metadata?.full_name ?? null } : null} initialRoles={roles}>
```

Note this makes the root layout dynamic for every route. That is already effectively true — `AuthProvider` forces a client fetch on every page anyway — and it trades a client round trip for a server one that was already happening inside `/api/auth/me`.

- [ ] **Step 2: Make `AuthProvider` hydrate instead of fetch**

Replace the mount-time `fetch("/api/auth/me")` with a one-shot store initialization from props, so `isLoading` is never true on first paint:

```tsx
export function AuthProvider({ initialUser, initialRoles, children }: Props) {
  // Initialize once, synchronously, before first paint - the store's default
  // isLoading: true existed only because auth state used to arrive from a
  // client fetch. It now arrives with the server render.
  const [hydrated] = useState(() => {
    useAuthStore.getState().setAuth(initialUser, initialRoles);
    return true;
  });
  void hydrated;
  return <>{children}</>;
}
```

Keep `/api/auth/me` — client components still use it after login to re-verify (`components/login/LoginForm.tsx:83-88`), and it still owns the `lastActiveAt` presence write.

- [ ] **Step 3: Change the store default**

`lib/client/useAuthStore.ts:33` — `isLoading: true` was correct when state arrived asynchronously. Set it to `false`; any component branching on it will now render the correct state immediately.

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit && npx eslint app components lib && npm test
```
Manual: log in, then hard-reload any page with DevTools Network throttled to Slow 3G. The Nav must render the logged-in avatar on first paint with **no** logged-out flash. Confirm in the Network tab that `/api/auth/me` is no longer called on plain navigation.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "perf(auth): hydrate auth state from the server render

AuthProvider fetched /api/auth/me from a useEffect on every mount, so the
Nav always painted logged-out first and then flipped - a layout shift plus
a round trip on every navigation, for state the server already had."
```

---

### Task 15: Add CI

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Write the workflow**

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      # Generate the Prisma client so tsc can resolve @prisma/client types.
      # No DATABASE_URL is needed for generate - only for migrate/deploy.
      - run: npx prisma generate
      - run: npx tsc --noEmit
      - run: npx eslint app components lib prisma proxy.ts
      - run: npm test
```

- [ ] **Step 2: Verify locally first**

```bash
npx prisma generate && npx tsc --noEmit && npx eslint app components lib prisma proxy.ts && npm test
```
All four must pass before pushing, or the first CI run is red for reasons unrelated to the workflow.

- [ ] **Step 3: Commit and confirm the run is green**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: gate pushes on typecheck, lint, and tests

AGENTS.md required tsc and eslint before considering work done, but
nothing enforced it and the lint baseline had already drifted to 14
errors. With no test suite and the deployed build as the review surface,
this is the only automated quality signal there is."
```

Then open a PR and confirm the check runs and passes. Enable branch protection on `main` requiring it.

---

## Phase 3 — Frontend debt

### Task 16: Migrate hardcoded hex literals onto the design tokens

**Files:** 93 files under `app/` and `components/`. Do this **one directory at a time**, committing per directory — a single 93-file commit is unreviewable and will conflict with everything.

- [ ] **Step 1: Reconcile the three near-identical off-whites first**

`--card` is `#FAFAF8` (`app/globals.css:13`) but components use `#FAF8F5` 86 times, and `#F1EFE9` is `--background`. Decide which of `#FAFAF8`/`#FAF8F5` is correct, update the token, and treat the other as an alias to be replaced. Doing this *before* the sweep avoids baking the drift into the tokens.

- [ ] **Step 2: Establish the mapping**

| Literal | Replace with |
|---|---|
| `#0E0E0D` | `foreground` (`text-foreground`, `bg-foreground`, `border-foreground`) |
| `#F1EFE9` | `background` |
| `#FAF8F5` / `#FAFAF8` | `card` |
| `#E4E1D9` | `secondary` |
| `#6A6860` | `muted-foreground` |
| `#C11A1A` | `destructive` / `accent` |
| `#E8621A`, `#FF5722` | `orange` |

Note the arbitrary-value shadows (`shadow-[4px_4px_0px_0px_rgba(14,14,13,1)]`, ~dozens of occurrences) encode `#0E0E0D` as rgba. Add a `--shadow-brutal` token and a `shadow-brutal` utility rather than substituting inline.

- [ ] **Step 3: Sweep one directory**

Start with `components/ui/` (smallest, highest reuse). For each file, replace `bg-[#0E0E0D]` → `bg-foreground`, `text-[#F1EFE9]` → `text-background`, and so on.

- [ ] **Step 4: Verify the directory visually**

```bash
npx tsc --noEmit && npx eslint components/ui
grep -rn '#[0-9A-Fa-f]\{6\}' components/ui
```
The grep should return nothing for that directory. Then load the app and compare against a screenshot taken before the change — this is a pure refactor and **any** visual difference is a bug.

- [ ] **Step 5: Commit per directory**

```bash
git add components/ui
git commit -m "refactor(ui): replace hardcoded hex literals with design tokens in components/ui"
```

- [ ] **Step 6: Repeat for the remaining directories**

Order: `components/ui` → `components/home` → `components/arena` → `components/profile` → `components/companies` → `components/login` + `components/signup` → `app/`. Track progress with:

```bash
grep -roh '#[0-9A-Fa-f]\{6\}' app components | wc -l
```
Starting value: **1252**. Target: 0 outside `app/globals.css`.

- [ ] **Step 7: Lock it in**

Once the count is 0, add a lint rule so it cannot regress. `eslint-plugin-tailwindcss` or a simple `no-restricted-syntax` rule matching `/#[0-9A-Fa-f]{6}/` in JSX `className` literals both work; the latter needs no new dependency.

---

### Task 17: Fix the arena list double-fetch and stale counts

**Files:** `app/arena/ArenasListClient.tsx:37-103, 165`

- [ ] **Step 1: Skip the mount-time refetch**

The effect at lines 48-82 fires on mount with exactly the params the server already used. Guard it:

```ts
// The server already rendered page 1 with the default filters (see
// app/arena/page.tsx), so the first run of this effect would re-request
// identical data. Skip it and let the effect take over from the first
// real filter change onward.
const isInitialRender = useRef(true);

useEffect(() => {
  if (isInitialRender.current) {
    isInitialRender.current = false;
    return;
  }
  // ...existing fetch
}, [currentPage, statusFilter, accessFilter, debouncedSearch, sortBy, activeTab, selectedTag]);
```

- [ ] **Step 2: Derive the counts from live data, not the initial snapshot**

`allCount={initialArenas.length}` at line 165 should be `totalCount` (already in state from the API response, currently unused for this). `myCount` (line 96) and `billboardArenas` (line 85) are computed from `initialArenas` and go stale on the first filter change. Either move both server-side as dedicated counts in the list response, or recompute them from `arenas`. Server-side is correct — a "my arenas" count derived from page 1 of 50 is wrong regardless of when it is computed.

Add `myCount` to `ListArenasResult` in `lib/arena/service.ts` (a `prisma.arena.count` with the same `tab: "my"` where-clause, run in the existing `Promise.all`) and return it from the route.

- [ ] **Step 3: Surface fetch errors**

Line 73's `console.error` leaves the user staring at stale results. Add an `error` state and render a retry affordance in `ArenasRegistry`.

- [ ] **Step 4: Abort in-flight requests properly**

The `cancelled` flag prevents the state update but lets the request complete. Use `AbortController` and pass `signal` to `fetch`.

- [ ] **Step 5: Verify**

```bash
npx tsc --noEmit && npx eslint app components lib && npm test
```
Manual: open DevTools Network, load `/arena` → expect **one** `/api/arena` request on the document load, not two. Filter to "Private" → the sidebar count must change to match what is displayed. Kill the dev server and change a filter → an error message appears rather than silence.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "perf(arena): stop refetching the server-rendered first page

The list effect ran on mount with the same default params app/arena/page.tsx
had just used server-side, so every visit cost two identical list queries.
Sidebar and billboard counts were also computed from the initial snapshot
only, so they described a data set no longer on screen after any filter."
```

---

### Task 18: Remove the test fixtures from the create form

**Files:** `app/arena/create/page.tsx:68-96`

- [ ] **Step 1: Replace `defaultValues` with real empty defaults**

Keep only the genuine defaults the schema implies — the booleans and numeric minimums — and drop every hardcoded string, URL, and date:

```ts
defaultValues: {
  locationType: "ONLINE",
  isPrivate: false,
  isTeam: false,
  minTeamSize: 1,
  maxTeamSize: 1,
  allowLeaderAccessControl: true,
  requireGithubUrl: true,
  requireFigmaUrl: false,
  requireVideoUrl: false,
  requireWriteup: true,
},
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit && npx eslint app
```
Manual: open `/arena/create` — every text field, date, and the cover uploader must be empty. Confirm the `ProgressHud` starts with all sections incomplete (previously it started fully green, which made the whole indicator meaningless).

- [ ] **Step 3: Commit**

```bash
git add app/arena/create/page.tsx
git commit -m "fix(arena): remove pre-populated test fixtures from the create form

Commit e1dfb2f added a full set of fake defaultValues for one-click test
creation and it shipped to production - real users saw the form pre-filled
with 'CYBERPUNK ALGORITHM BATTLE 2026', a stock cover image, and fixed
2026 dates, with the progress indicator already fully green."
```

---

### Task 19: Label every form control

**Files:** the ~22 controls without an accessible name across `components/arena/create/*`, `components/profile/edit/*`, `components/companies/SalaryModal*`, `components/home/Nav/NavSearch.tsx`

- [ ] **Step 1: Find them**

```bash
grep -rn '<input\|<select\|<textarea' app components > /tmp/controls.txt
grep -rn 'htmlFor=\|aria-label' app components > /tmp/labels.txt
```
58 controls, 35 accessible names. Work file by file and pair each control with either a `<label htmlFor="…">` matching its `id`, or an `aria-label` where the visual design has no room for a visible label.

- [ ] **Step 2: Enforce it**

Add `jsx-a11y` to the eslint config so this cannot regress:

```js
// eslint.config.mjs — the rules that catch exactly this class of bug
rules: {
  "jsx-a11y/label-has-associated-control": "error",
  "jsx-a11y/control-has-associated-label": "error",
},
```
`eslint-config-next` already bundles `eslint-plugin-jsx-a11y`, so no new dependency is needed — the rules just aren't enabled at error level.

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit && npx eslint app components
```
Manual: tab through the create-arena form and the profile edit modal with a screen reader (or Chrome DevTools → Accessibility pane) and confirm every control announces a name.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "fix(a11y): give every form control an accessible name

58 form controls had 35 accessible names between them. Enables the
jsx-a11y label rules that eslint-config-next already ships but does not
turn on, so the gap cannot silently reopen."
```

---

### Task 20: Unblock the React Compiler on the two largest forms

**Files:** `app/arena/create/page.tsx:99-117`, `components/profile/EditProfileModal.tsx:117`, `components/signup/SignupForm.tsx:55`

- [ ] **Step 1: Understand what the warning means**

`react-hooks/incompatible-library` is not cosmetic — the React Compiler **skips optimizing the entire component**. All three sites trace to `watch("field") as SomeType`: 14 such casts in the create page alone. The casts exist because `useForm<ArenaFormInput, unknown, ArenaFormOutput>` makes `watch` return the *input* type, where zod defaults are still optional.

- [ ] **Step 2: Replace `watch()` calls with `useWatch`**

`useWatch` from react-hook-form subscribes per-field and is compiler-compatible:

```ts
import { useWatch } from "react-hook-form";
// ...
const watchIsPrivate = useWatch({ control, name: "isPrivate" });
```

Add `control` to the `useForm` destructure. Do this for all 14 fields at lines 99-117 and the equivalents in the other two files, and delete the `as` casts — `useWatch` infers correctly from the field name.

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit && npx eslint app components
```
Expected: the three `incompatible-library` warnings are gone and no new type errors appear (if the casts were hiding a real mismatch, `tsc` now says so — fix the schema, don't re-add the cast).

Manual: the live card preview on `/arena/create` must still update as you type, the `ProgressHud` sections must still flip to complete, and the conditional sections (private → invite code, in-person → maps URL, team → sizes) must still show and hide.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "perf(forms): switch watch() to useWatch so the React Compiler can optimize

react-hooks/incompatible-library made the compiler skip the create-arena
page, the profile edit modal, and the signup form entirely - the three
largest forms in the app. Also removes 14 'as' casts that existed only to
paper over watch()'s input-type inference."
```

---

### Task 21: Add the missing App Router conventions

**Files:** create `app/not-found.tsx`, `app/loading.tsx`, `app/arena/loading.tsx`, `app/robots.ts`, `app/sitemap.ts`

- [ ] **Step 1: `not-found.tsx`**

`app/user/[id]/page.tsx:22` and Task 12's arena page both call `notFound()` with nothing to render it. Build one matching the editorial style of `app/billboard/page.tsx`, using tokens rather than hex (Task 16's rules apply to new code immediately).

- [ ] **Step 2: `loading.tsx` for the dynamic routes**

`app/arena/page.tsx` is `force-dynamic` with no streaming fallback, so navigation blocks on the DB query. A skeleton at `app/arena/loading.tsx` gives Next something to stream immediately.

- [ ] **Step 3: `robots.ts` and `sitemap.ts`**

For an SEO-driven salary site this is a product feature, not polish. `sitemap.ts` should enumerate company slugs and public arena slugs from the services:

```ts
import type { MetadataRoute } from "next";
import { listArenas } from "@/lib/arena/service";
import { listCompanies } from "@/lib/companies/service";
import { buildArenaSlug } from "@/lib/arena-slug";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ arenas }, companies] = await Promise.all([
    listArenas({ ...DEFAULT_LIST_PARAMS, limit: 100, access: "public" }),
    listCompanies({}),
  ]);
  // ...map to { url, lastModified }
}
```

Ensure private arenas are excluded — `access: "public"` above is doing security work, not just filtering.

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit && npx eslint app && npm test
```
Manual: hit `/user/does-not-exist` → the styled 404 renders. Hit `/sitemap.xml` and `/robots.txt` → both return valid content. Confirm **no private arena** appears in the sitemap.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(seo): add not-found, loading, robots, and sitemap routes"
```

---

## Deferred — recorded, not scheduled

These are real but do not justify a task in this plan. Recorded so they are not rediscovered as surprises.

- **RBAC is decorative** (SEC-10). `hasRole()` is never called; `/admin` is protected in `proxy.ts` but no admin route exists. Build the authorization layer as part of the first moderation feature, not speculatively.
- **Orphaned arena cover images.** `app/api/arena/upload/route.ts` writes to a random UUID path with no cleanup on failed or abandoned arena creation. Needs a reconciliation job once volume matters.
- **Upload content-type is trusted from the client.** `validateImageUpload` checks `file.type`, which the client sets. Mitigated by forcing `contentType: "image/jpeg"` on the stored object, so a mislabeled file cannot be served as script. Add magic-byte sniffing if untrusted uploads ever become public-facing beyond avatars.
- **`yup` is a dead dependency** and **`shadcn` (the CLI) is in `dependencies`.** Two-line `package.json` fix; fold into any convenient commit.
- **No error monitoring.** `lib/server/logger.ts` writes to console only. Add Sentry before real traffic.
- **`prisma/seed.ts`, `prisma/scripts/clear.ts`** import `lib/server/prisma.ts` directly, which is why it cannot carry `import "server-only"` (documented at lines 1-4). Correct as-is; noted so nobody "fixes" it.

---

## Self-Review

**Spec coverage.** Every Part 2 finding maps to a task: SEC-1→T1, SEC-2→T2, SEC-3→T3, SEC-4→T4, SEC-5→T5, SEC-6→T6, SEC-7→T7, SEC-8→T11, SEC-9→T8, SEC-10→T2 (provider) + Deferred (RBAC), SEC-11→T5. Part 3: ARCH-1→T11, ARCH-2→T9/T10/T12/T13, ARCH-3→T14, ARCH-4→T0/T15, ARCH-5→Deferred, FE-1→T16, FE-2→T17, FE-3→T18, FE-4→T19, FE-5→T0/T20, FE-6→T21, FE-7→T0.

**Ordering dependencies.** T8 (JSON-LD escaping) is deliberately ordered before T12 (real arena data) — the vulnerability is latent only while the data is mock. T9 (models) precedes T10 (service) precedes T13 (UI). T0 precedes everything, since every later task's verification step asserts a clean lint run. T2 introduces `npm test`, which T8, T11, T13, T14, T15, T17, T21 then use.

**Known gap.** Task 10 Step 1 and Task 13 Steps 1-2 intentionally say "read the existing modal components and derive the schema from what they render" rather than spelling out ~25 field definitions. This is a deviation from the no-placeholders rule, made knowingly: the modal components are the authoritative source for that shape, and transcribing them here would guarantee drift between this document and the code. Every other step contains the literal content needed.
