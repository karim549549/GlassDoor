# Codebase Decomposition & Performance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Decompose the codebase's oversized client components into focused, single-responsibility units; consolidate duplicated/drift-prone logic behind shared schema+service layers; and apply rendering, bundle, backend-query, and accessibility optimizations — all without changing the app's visual output or introducing new dependencies.

**Architecture:** Five directory-scoped, independent workstreams (Contest, Profile, Companies, Home/Nav, Auth). Each is self-contained — no two workstreams edit the same file — so they execute as parallel subagents in isolated git worktrees and merge back with zero conflicts.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind v4, react-hook-form + zod, Prisma 7 + Postgres, Supabase auth/storage, GSAP.

## Global Constraints

- **No visual change.** Same rendered markup, same class names, same DOM structure wherever feasible. This is a structural/perf refactor, not a redesign — the UI was intentionally designed and must look identical before/after.
- **No new npm dependencies.** Everything needed already exists in `package.json` (zod, react-hook-form, Prisma). Converging `EditProfileModal` from `yup` to `zod` is in scope — it's adopting an *existing* dependency's pattern (already used by the contest module), not new technology.
- **No new tech/architecture paradigm** (state management library, CSS framework, data-fetching layer) without flagging it first — everything in this plan works within Next.js App Router conventions already in use.
- **Verification per task:** `npx tsc --noEmit` and `npx eslint <touched paths>` must be clean. No test suite exists in this repo and none is being added — this is the agreed bar.
- **Public interfaces of shared components must not change** unless the plan explicitly says so (e.g. `ContestCardBody`'s props must stay stable — the Contest-create form imports it).
- **Commits:** Conventional Commits (`refactor:`, `perf:`, `fix:`, `style:`), no AI/Claude attribution trailer, matching this repo's existing log style (see `git log` — e.g. `refactor: consolidate contest feature into shared types/schema/service layer`). Commit at the end of each task, not once per file.
- **Rendering-perf checklist to apply where it actually matters (judgment call, not blanket):**
  - `next/image` instead of raw `<img>` for any user-facing image (cover photos, avatars).
  - `next/dynamic` for modal/rarely-shown subtrees (croppers, dialogs) so their JS isn't in the initial bundle.
  - `React.memo` on list-item components that re-render on unrelated parent state changes (e.g. card components inside a filtered/sorted list).
  - `useMemo`/`useCallback` only where a derived value or callback is passed to a memoized child or is expensive to recompute — not reflexively on every value.
  - Drop `"use client"` from a component if its only reason for the directive was a small interactive child that can be extracted instead.
- **Backend-perf checklist:** Prisma calls should `select`/`include` only the fields the response actually uses; watch for N+1 patterns (a list query followed by a per-row query in a loop).
- **Rendering strategy per page:** if a page's data doesn't depend on the request (no per-user auth check, no query params affecting content), it's a static/ISR candidate (`export const revalidate = <seconds>`); if it does, leave it dynamic. Apply this per page, don't force it.
- **Accessibility:** every form control needs an associated `<label htmlFor>` or `aria-label`; interactive non-button elements need proper roles; check color-contrast-independent state (don't rely on color alone for validation state, which this codebase already does reasonably well via text like "[✓] DONE").

---

## Task 1: Contest domain

**Files:**
- Modify: `app/contest/create/page.tsx` (673 lines → orchestration only)
- Create: `components/contest/create/GeneralSection.tsx`, `AccessSection.tsx`, `TeamSection.tsx`, `TimelineSection.tsx`, `RulesSection.tsx`, `ProgressHud.tsx`, `CoverImageUploader.tsx`
- Create: `lib/contest/useCoverImageUpload.ts`
- Modify: `components/contest/ContestCard.tsx` (raw `<img>` → `next/image`)
- Modify: `app/contest/ContestsListClient.tsx` (337 lines — decompose filter bar / grid / pagination; memoize derived filtered/sorted lists)
- Investigate + apply rendering-strategy checklist to: `app/contest/page.tsx`, `app/contest/[id]/page.tsx`

**Interfaces:**
- Section components take `register: UseFormRegister<ContestFormInput>`, `errors: FieldErrors<ContestFormInput>`, plus explicit watched values as props (e.g. `AccessSection({ register, errors, watchIsPrivate })`) — no context, no prop-drilling the whole form object.
- `useCoverImageUpload(setValue: UseFormSetValue<ContestFormInput>)` returns `{ isUploading, cropTarget, handleFileSelect, handleCroppedUpload, closeCropper }`.
- `ContestCardBody`'s existing prop shape (from `components/contest/ContestCard.tsx`) must not change — `app/contest/create/page.tsx`'s live preview depends on it.

- [ ] **Step 1:** Read `app/contest/create/page.tsx` in full, extract the 5 section components + `ProgressHud` + `CoverImageUploader`, wiring the interfaces above. Page shrinks to composing these plus the `useForm` call and `onSubmit`.
- [ ] **Step 2:** Extract upload/crop state and handlers into `lib/contest/useCoverImageUpload.ts`; dynamic-import `CropperModal` inside `CoverImageUploader.tsx` via `next/dynamic`.
- [ ] **Step 3:** Convert the raw `<img>` in `ContestCard.tsx` to `next/image` (needs `fill` or explicit width/height matching current rendered size — check current CSS box before choosing).
- [ ] **Step 4:** Decompose `ContestsListClient.tsx`; wrap the filtered/sorted contest array in `useMemo` keyed on its actual dependencies (filters, sort, raw list).
- [ ] **Step 5:** Check whether `app/contest/page.tsx` and `app/contest/[id]/page.tsx` read per-request data (auth/user-scoped tab, query params) — if not, add `export const revalidate`; if so, leave dynamic. Document the decision in the commit message.
- [ ] **Step 6:** Run `npx tsc --noEmit` and `npx eslint app/contest components/contest lib/contest`, fix until clean.
- [ ] **Step 7:** Commit.

---

## Task 2: Profile domain

**Files:**
- Create: `lib/profile/schema.ts` — `EMPLOYMENT_STATUS_VALUES`, `SENIORITY_VALUES` as the single source of truth (currently duplicated between `app/api/profile/update/route.ts`'s local consts and hardcoded `<option>` strings in `EditProfileModal.tsx`), plus a `zod` `profileSchema` replacing the current inline `yup` schema
- Create: `lib/profile/service.ts` — move the Prisma update logic out of `app/api/profile/update/route.ts` (mirror `lib/contest/service.ts`'s shape)
- Create: `lib/profile/constants.ts` — `EGYPTIAN_UNIVERSITIES`, `EGYPT_LOCATIONS` (currently ~80 lines hardcoded inside `EditProfileModal.tsx`)
- Modify: `app/api/profile/update/route.ts` — thin handler importing schema + service (mirror `app/api/contest/route.ts`'s POST handler shape)
- Modify: `components/profile/EditProfileModal.tsx` (613 lines → orchestration), switch from manual `yup` + local `useState` validation to `react-hook-form` + `zodResolver(profileSchema)`
- Create: `components/profile/edit/BasicInfoSection.tsx`, `EducationEmploymentSection.tsx`, `LinksSection.tsx`, `SkillsSection.tsx`
- Modify: `components/profile/ProfileHeader.tsx` (407 lines), `components/profile/ProfileView.tsx` (331 lines) — decompose; add `React.memo` to any subcomponent that re-renders from unrelated parent state
- Investigate + apply rendering-strategy checklist to: `app/profile/page.tsx`, `app/user/[id]/page.tsx`

**Interfaces:**
- `lib/profile/schema.ts` exports `EMPLOYMENT_STATUS_VALUES`, `SENIORITY_VALUES` (as `readonly` tuples), `profileSchema` (zod), and inferred types — both `EditProfileModal.tsx`'s dropdowns and `app/api/profile/update/route.ts` import from here, eliminating the duplication.
- `lib/profile/service.ts` exports `updateUserProfile(userId: string, data: ProfileSchemaOutput)`.
- Edit-section components take `register`/`errors` typed against the new `profileSchema`'s inferred type, same pattern as Task 1's contest sections.

- [ ] **Step 1:** Write `lib/profile/schema.ts` and `lib/profile/constants.ts`, porting the enum values and university/location arrays verbatim (no content changes) — just relocated and made importable.
- [ ] **Step 2:** Rewrite `app/api/profile/update/route.ts` to import from `lib/profile/schema.ts` and delegate to a new `lib/profile/service.ts`.
- [ ] **Step 3:** Rewrite `EditProfileModal.tsx` to use `useForm` + `zodResolver(profileSchema)` instead of manual `yup` validation; extract the 4 section components, each reading `EMPLOYMENT_STATUS_VALUES`/`SENIORITY_VALUES` from `lib/profile/schema.ts` for their `<option>` lists instead of hardcoded strings. Verify every `<input>`/`<select>` has a `<label htmlFor>`.
- [ ] **Step 4:** Decompose `ProfileHeader.tsx` and `ProfileView.tsx` along their natural display sections; memoize where re-render cost is real (not reflexively).
- [ ] **Step 5:** Check `app/profile/page.tsx` and `app/user/[id]/page.tsx` for static/ISR eligibility per the Global Constraints checklist.
- [ ] **Step 6:** Run `npx tsc --noEmit` and `npx eslint components/profile app/api/profile app/profile app/user lib/profile`, fix until clean.
- [ ] **Step 7:** Commit.

---

## Task 3: Companies domain

**Files:**
- Investigate then decompose: `components/companies/CompanyDetailView.tsx` (373 lines), `SubmitSalaryModal.tsx` (323 lines), `CommentSection.tsx` (285 lines) — read each first, split along natural section/responsibility boundaries the same way Tasks 1–2 did (this file's internal structure hasn't been read yet, so don't assume component names — derive them from what's actually there)
- Investigate: `app/api/companies/route.ts`, `lib/companies/service.ts` for N+1 query patterns or over-fetched fields; tighten Prisma `select`/`include`
- Investigate + apply rendering-strategy checklist to: `app/companies/[id]/page.tsx` (public company data is a plausible ISR candidate — verify no per-user logic gates the page before applying)

**Interfaces:** Derive and document during Step 1 (this domain wasn't pre-read in detail — investigate first, then apply the same section-component + `register`/`errors`-prop pattern established in Tasks 1–2 for any form-like subcomponents).

- [ ] **Step 1:** Read all three flagged files in full; identify natural decomposition boundaries (don't force a fixed count of subcomponents — split where responsibilities are genuinely separate).
- [ ] **Step 2:** Decompose `CompanyDetailView.tsx`, `SubmitSalaryModal.tsx`, `CommentSection.tsx` accordingly, applying the same rendering-perf checklist (memo on list items like individual comments/reviews, `next/image` for any avatars/logos, dynamic-import the salary modal if it's not shown on initial load).
- [ ] **Step 3:** Review `app/api/companies/route.ts` and `lib/companies/service.ts` for query efficiency; tighten `select`/`include` to actual response shape.
- [ ] **Step 4:** Apply the rendering-strategy checklist to `app/companies/[id]/page.tsx`.
- [ ] **Step 5:** Run `npx tsc --noEmit` and `npx eslint components/companies app/companies app/api/companies lib/companies`, fix until clean.
- [ ] **Step 6:** Commit.

---

## Task 4: Home/Nav domain

**Files:**
- Modify: `components/home/Hero/HeroArenaCard.tsx` (448 lines) — extract the hardcoded `ARENA_CARDS` array to a data file; separate animation/ScrollTrigger logic from markup
- Investigate then decompose: `components/home/Nav/NavSearch.tsx` (277 lines), `NavUserMenu.tsx` (268 lines), `components/home/Hero/HeroCoverNotes.tsx` (237 lines), `components/home/Nav/BurgerMenu.tsx` (179 lines)
- Convert raw `<img>` → `next/image` in `NavUserMenu.tsx`, `BurgerMenu.tsx`
- Audit every `"use client"` file under `components/home/**` — drop the directive where it's only present because of a small interactive child that can be extracted instead
- Investigate + apply rendering-strategy checklist to: `app/page.tsx`

**Interfaces:** Derive during investigation, following the section/hook-extraction pattern from Tasks 1–2.

- [ ] **Step 1:** Read `HeroArenaCard.tsx` in full; extract `ARENA_CARDS` to `components/home/Hero/arena-cards-data.ts` (or similar); split GSAP/ScrollTrigger setup into a hook if it entangles with render logic.
- [ ] **Step 2:** Read and decompose `NavSearch.tsx`, `NavUserMenu.tsx`, `HeroCoverNotes.tsx`, `BurgerMenu.tsx` along natural boundaries.
- [ ] **Step 3:** Swap raw `<img>` for `next/image` in `NavUserMenu.tsx` and `BurgerMenu.tsx` (user avatars — check current rendered dimensions before setting width/height).
- [ ] **Step 4:** Audit `"use client"` usage across `components/home/**`; for each file, confirm whether the directive is load-bearing (state, effects, event handlers, browser APIs) or just inherited from a child that could be isolated instead.
- [ ] **Step 5:** Apply the rendering-strategy checklist to `app/page.tsx`.
- [ ] **Step 6:** Run `npx tsc --noEmit` and `npx eslint components/home app/page.tsx`, fix until clean.
- [ ] **Step 7:** Commit.

---

## Task 5: Auth domain

**Files:**
- Investigate then decompose: `components/signup/SignupForm.tsx` (312 lines), `components/login/LoginForm.tsx` (242 lines), `components/login/AccountSwitcher.tsx` (187 lines)
- Check for logic duplicated between `SignupForm.tsx` and `LoginForm.tsx` (validation patterns, error handling, field components) that should be shared instead of copy-pasted
- Investigate: `app/api/auth/**/route.ts` for consistency with the thin-handler/service-layer pattern established in Tasks 1–2 (only apply if a clear service-layer gap exists — don't manufacture one)

**Interfaces:** Derive during investigation.

- [ ] **Step 1:** Read `SignupForm.tsx`, `LoginForm.tsx`, `AccountSwitcher.tsx` in full; identify duplicated logic between signup/login (e.g. shared field validation, shared error-toast handling) and extract it to a common location (`components/login/shared/` or a hook) instead of leaving it copy-pasted.
- [ ] **Step 2:** Decompose each into focused subcomponents following the established pattern.
- [ ] **Step 3:** Review `app/api/auth/**/route.ts` files; if business logic sits directly in a route handler the way `app/api/profile/update/route.ts` did before Task 2, apply the same service-layer extraction — skip this if the existing routes are already thin.
- [ ] **Step 4:** Run `npx tsc --noEmit` and `npx eslint components/login components/signup app/api/auth`, fix until clean.
- [ ] **Step 5:** Commit.

---

## Self-Review Notes

- **Spec coverage:** all 5 flagged large-file clusters from the audit are covered; performance (images, code-splitting, memoization, backend queries, rendering strategy) and accessibility are stated once in Global Constraints and apply to every task rather than being repeated per-task.
- **Known unknowns:** Companies, Home/Nav, and Auth domains include files not yet read in depth (`CompanyDetailView.tsx`, `NavSearch.tsx`, `SignupForm.tsx`, etc.) — those tasks start with an explicit investigate step rather than guessed subcomponent names, to avoid prescribing a decomposition for code not yet seen.
- **No task depends on another** — all 5 can run fully in parallel in separate worktrees.
