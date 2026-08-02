# Accessibility, verification, and commit style

Applies to: whole repo

## Accessibility

- Every `<input>`, `<select>`, and `<textarea>` needs an associated `<label htmlFor="...">` (with a matching `id` on the control) or an `aria-label`. Check this whenever adding or moving a form control.
- Don't rely on color alone to convey state (valid/invalid, done/pending, etc.) — pair it with text or an icon. This codebase's existing "[✓] DONE" / "[ ] PENDING" pattern is the model to follow.

## Verification bar

- No automated test suite exists in this repo, by design — it's a vibe-coded project with no local testing; the deployed Vercel build is the actual review surface. Do not add a test framework unless explicitly asked.
- Before considering any change done, run `npx tsc --noEmit` and `npx eslint <touched paths>` and confirm both are clean (pre-existing warnings/errors in files you didn't touch are not your concern — don't fix unrelated pre-existing issues as a side effect of an unrelated task, just note them).

## Commit style

- Conventional Commits format: `type: description` (`feat`, `fix`, `refactor`, `perf`, `style`, `docs`, `chore`, etc.), imperative mood, matching this repo's existing `git log` history.
- Never include an AI/Claude/Gemini/Antigravity attribution trailer or "Generated with ..." line in any commit message, regardless of which agent made the change. The commit history should read as the developer's own work.
- No new npm dependencies without flagging it to the project owner first — everything needed for this codebase's patterns (zod, react-hook-form, Prisma) is already installed.
