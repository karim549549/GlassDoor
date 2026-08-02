# Architecture: domain-scoped data layer + component decomposition

Applies to: `lib/**`, `app/api/**`, `app/**/page.tsx`, `components/**`

## Frontend/backend boundary — pages never touch Prisma or Supabase directly for data

This project is built as one Next.js app today, but with an explicit intent to eventually split into a separately-deployed backend for scalability. To keep that split possible without a rewrite, treat `app/api/**` as if it were already a different service: **pages and components (including Server Components) fetch it over HTTP — they never import `prisma`, construct a Supabase client, or call a `lib/<domain>/service.ts` function directly to read/write business data.**

- **Dynamic pages** (anything that already depends on the current viewer — auth-gated content, per-request data): fetch the API route with `fetchInternalApi` from `lib/server/api-client.ts`, which forwards the request's cookies so the route's own auth check sees the same session. Reference: `app/user/[id]/page.tsx` → `GET /api/user/[id]`, `app/contest/[id]/page.tsx` → `GET /api/contest/[id]`.
- **If the API route a page needs doesn't exist yet, create it** — don't reach for the service function as a shortcut. Move any inline Prisma logic you find in a page into `lib/<domain>/service.ts` and wrap it with a real route handler, the way `lib/user/service.ts` + `app/api/user/[id]/route.ts` were added for what used to be raw Prisma calls inside `app/user/[id]/page.tsx`.
- **The one confirmed exception: statically-generated / ISR pages** (`export const revalidate = N` with no per-request dependency). A build-time prerender has no live server to self-fetch against — this was verified by an actual failed `next build` (`fetch failed` / `ECONNREFUSED`) when `app/contest/page.tsx`'s ISR'd listing page was pointed at a self-fetch. These pages call their domain's service function directly instead (see the comment in `app/contest/page.tsx` for the full reasoning) — the API route calls that same function, so there's still exactly one place the query logic lives, even though the page doesn't reach it over HTTP.
- A plain `supabase.auth.getUser()` call to identify the current request's viewer (not to read business data) is infrastructure, not a boundary violation — every dynamic page and API route needs to know who's asking.

If you're unsure which case a new page falls into: does it need `export const revalidate` (or is it otherwise safe to statically generate) — if yes, direct service call; if it's inherently per-request, HTTP fetch through `fetchInternalApi`.

## Domain-scoped data layer

Every feature domain (`contest`, `profile`, `companies`, etc.) keeps its data layer in `lib/<domain>/`:

- **`schema.ts`** — zod schema(s). This is the single source of truth for validation rules AND for any enum/option-list values used in dropdowns or selects. Both the client-side form and the API route import from here.
  - Never hardcode enum values in a component's `<option>` list or in a route handler's local consts — if the same set of values (e.g. status/seniority options) needs to exist on both the client and the server, it lives in exactly one `schema.ts` and both sides import it. This is the fix applied to `lib/profile/schema.ts` after `EMPLOYMENT_STATUS_VALUES`/`SENIORITY_VALUES` were found duplicated between `EditProfileModal.tsx` and `app/api/profile/update/route.ts`.
- **`service.ts`** — Prisma/DB logic lives here, not in the route handler. API routes stay thin: authenticate → `schema.safeParse(body)` → call the service function → respond with its result. Reference implementations: `lib/contest/service.ts` + `app/api/contest/route.ts`, `lib/profile/service.ts` + `app/api/profile/update/route.ts`.
- **`types.ts`** / **`constants.ts`** — shared TypeScript types and static data (option lists, mock/seed data). Never inline a data array of more than a few entries directly in a component file — put it in `constants.ts` (or a domain-specific data file) and import it.

## Component decomposition

- If a client component crosses roughly 200–250 lines, or mixes more than one concern (e.g. form validation + file-upload logic + entrance animation + layout markup all in one file), split it.
- Extracted form-section components take `register` and `errors` (typed against the domain's zod-inferred form type) as explicit props, plus any specific watched values the section needs, passed individually by name. Do not pass the whole form object down, and do not reach for React context for this — the prop list should make each section's dependencies obvious at the call site.
- Extract non-trivial `useEffect`/state logic — GSAP animation timelines, file-upload/crop flows, anything with more than a couple of effects — into a dedicated custom hook, either colocated with the component or placed in the domain's `lib/` folder if it's data-adjacent.
- Reference examples to follow: `app/contest/create/page.tsx` (orchestrator) + `components/contest/create/*` (sections) + `lib/contest/useCoverImageUpload.ts` (extracted hook); `components/profile/EditProfileModal.tsx` + `components/profile/edit/*`.
