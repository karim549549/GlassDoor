# Architecture: domain-scoped data layer + component decomposition

Applies to: `lib/**`, `app/api/**`, `app/**/page.tsx`, `components/**`

## Frontend/backend boundary — the service layer is the seam, not HTTP

This project is built as one Next.js app today, but with an explicit intent to eventually split into a separately-deployed backend. The seam that makes that split cheap is **`lib/<domain>/service.ts`: every piece of data logic lives there, and nothing else talks to Prisma.**

- **Pages and components (including Server Components) never import `prisma`, construct a Supabase client for business data, or inline a query.** That restriction is unchanged and is what this rule was always really protecting.
- **Server Components call the domain service function directly.** Reference: `app/user/[id]/page.tsx` → `getUserProfileById()` + `toUserProfileDto()`, `app/arena/page.tsx` → `listArenas()`.
- **`app/api/**` is a parallel thin adapter over the *same* service functions**, for client components and any future external consumer. Neither side calls the other. `app/api/user/[id]/route.ts` calls the exact same `getUserProfileById` + `toUserProfileDto` pair the page does.
- **If the service function a page needs doesn't exist yet, create it** — don't inline Prisma in the page. Add the API route too when a client component will need the same data.
- A plain `supabase.auth.getUser()` call to identify the current viewer (not to read business data) is infrastructure, not a boundary violation.

### Why this changed (2026-08-15)

This rule previously required Server Components to HTTP-fetch the app's own `/api/*` routes via `fetchInternalApi`. That was reversed, and `lib/server/api-client.ts` deleted, for three reasons:

1. **Security.** It built its target URL from the client-controlled `Host` header and attached the caller's session cookie — a request-forgery primitive that sent the victim's session to whatever host an attacker named. The hosting platform happened to block it; the code did not.
2. **Cost.** Every render became page → HTTP request to self → route → service → Prisma: an extra network hop and a second billed serverless invocation per page view, outside React's request-level dedup.
3. **It was already breaking down.** `app/arena/page.tsx` is `force-dynamic` and called `listArenas()` directly, which the old "statically-generated pages only" exception did not cover. The codebase paid the round-trip cost on one page while ignoring the rule on another.

Split-readiness is unaffected: when the backend is extracted, `lib/*/service.ts` and `app/api/*` move to it and the call sites change either way — whether they currently say `await listArenas(params)` or `await fetchInternalApi("/api/arena?…")`. The HTTP hop bought nothing a typed service call doesn't.

For absolute URLs that must not come from the request (sitemap, robots, OG tags), use `getSiteUrl()` from `lib/site-url.ts`, which reads configuration rather than the `Host` header.

## Domain-scoped data layer

Every feature domain (`arena`, `profile`, `companies`, `user`, etc.) keeps its data layer in `lib/<domain>/`:

- **`schema.ts`** — zod schema(s). This is the single source of truth for validation rules AND for any enum/option-list values used in dropdowns or selects. Both the client-side form and the API route import from here.
  - Never hardcode enum values in a component's `<option>` list or in a route handler's local consts — if the same set of values (e.g. status/seniority options) needs to exist on both the client and the server, it lives in exactly one `schema.ts` and both sides import it. This is the fix applied to `lib/profile/schema.ts` after `EMPLOYMENT_STATUS_VALUES`/`SENIORITY_VALUES` were found duplicated between `EditProfileModal.tsx` and `app/api/profile/update/route.ts`.
- **`service.ts`** — Prisma/DB logic lives here, returning the *raw* Prisma-shaped result — not the route handler. API routes stay thin: `requireUser()`/`getOptionalUser()` (see below) → `schema.safeParse(body)` → call the service function → transform through `dto.ts` if there's a relation to flatten → respond, all inside `withApiErrorHandling`. Reference implementations: `lib/arena/service.ts` + `app/api/arena/route.ts`, `lib/user/service.ts` + `app/api/user/[id]/route.ts`.
- **`dto.ts`** — only for domains whose Prisma result includes a many-to-many or other relation that would otherwise leak its join-table wrapper into the API response. Prisma returns `skills: { skill: { id, name } }[]` for a many-to-many through a join table — that's an implementation detail of how the relation is modeled, not something an API consumer should have to unwrap. `dto.ts` exports a zod schema for the public shape (`skills: { id, name }[]`) and a transform function that flattens+validates the raw service result into it before it ever reaches `NextResponse.json()`. Reference: `lib/user/dto.ts`'s `toUserProfileDto`. A future relation-heavy domain (e.g. a tagging system) should follow the same shape: raw fetch in `service.ts`, flatten+validate in `dto.ts`.
- **`types.ts`** / **`constants.ts`** — shared TypeScript types and static data (option lists, mock/seed data). Never inline a data array of more than a few entries directly in a component file — put it in `constants.ts` (or a domain-specific data file) and import it.

## Route handler infrastructure

- **`requireUser()`** / **`getOptionalUser()`** (`lib/server/auth/require-user.ts`) replace the hand-rolled `createClient()` → `getUser()` → 401-if-missing sequence every protected route used to repeat. `requireUser()` returns `{ user }` or `{ response }` (a ready-to-return `NextResponse` — `if ("response" in auth) return auth.response;`); `getOptionalUser()` returns `User | null` for routes where the viewer is optional.
- **`withApiErrorHandling(label, fn, errorMessage?)`** (`lib/server/api-route.ts`) replaces the try/catch → log → 500-JSON boilerplate every route repeated. Only the unhandled-exception path logs — a route returning its own 4xx from inside `fn` doesn't hit this.
- **Supabase clients are memoized, never reconstructed per call within a request or across the process**: `lib/server/supabase/server.ts`'s `createClient` is wrapped in React's `cache()` (de-dupes within one request, since the client is bound to that request's cookies — it can't be a cross-request singleton). `lib/server/supabase/admin.ts`'s `createAdminClient()` *is* a true module-level singleton, since the service-role client carries no request-scoped state.
- Reference implementation: `app/api/arena/route.ts`.

## Component decomposition

- If a client component crosses roughly 200–250 lines, or mixes more than one concern (e.g. form validation + file-upload logic + entrance animation + layout markup all in one file), split it.
- Extracted form-section components take `register` and `errors` (typed against the domain's zod-inferred form type) as explicit props, plus any specific watched values the section needs, passed individually by name. Do not pass the whole form object down, and do not reach for React context for this — the prop list should make each section's dependencies obvious at the call site.
- Extract non-trivial `useEffect`/state logic — GSAP animation timelines, file-upload/crop flows, anything with more than a couple of effects — into a dedicated custom hook, either colocated with the component or placed in the domain's `lib/` folder if it's data-adjacent.
- Reference examples to follow: `app/arena/create/page.tsx` (orchestrator) + `components/arena/create/*` (sections) + `lib/arena/useCoverImageUpload.ts` (extracted hook); `components/profile/EditProfileModal.tsx` + `components/profile/edit/*`.

## Logging

See `.agents/rules/logging.md` for the full policy (short version: `error`/`warn` only, nothing on the success path). `withApiErrorHandling` and `requireUser()` already log through `lib/server/logger.ts` — don't add a duplicate log around a call to either.
