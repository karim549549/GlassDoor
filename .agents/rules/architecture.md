# Architecture: domain-scoped data layer + component decomposition

Applies to: `lib/**`, `app/api/**`, `components/**`

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
