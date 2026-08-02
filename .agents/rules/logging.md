# Logging

Applies to: `app/api/**`, `lib/**`, `components/**`

Two loggers, same policy: `lib/server/logger.ts` (server-only) and `lib/client/logger.ts` (client components) — separate modules because the server one is `server-only` and can't be imported into `"use client"` code, but both expose the same `logger.error(message, context?)` / `logger.warn(message, context?)` shape.

Both are built behind a factory (`createLogger()` inside each file), currently returning a console-based implementation. **Call sites import and use `logger` — never `console.error`/`console.warn` directly, and never construct a logging implementation inline.** The reason: when this gets swapped for a real logging package or hosted service later, that's a one-function change inside `createLogger()`, not a find-and-replace across every route and component that logs something.

## The policy — this is the part that matters, not the API shape

Logging is I/O on the request path. Every call is a cost, so it's reserved for things worth paying that cost for:

- **`logger.error`** — something broke that shouldn't have: an unhandled exception, a DB/upstream failure, a fetch to our own API that failed unexpectedly.
- **`logger.warn`** — not a bug, but security/reliability-relevant: a failed auth/permission check (a pattern of these is exactly what's worth noticing), a best-effort write that failed.
- **Nothing** — routine, expected control flow: a 404 for a resource that doesn't exist, a validation rejection from bad user input, an empty query result, a cookie-write no-op inside a Server Component (see the comment in `lib/server/supabase/server.ts` for why that one specifically stays silent — it fires on effectively every render). If you're about to log a success path or an expected "not found," don't.

## Where it plugs in

- `lib/server/api-route.ts`'s `withApiErrorHandling` already calls `logger.error` for any unhandled exception in a route handler — routes using it get this for free, nothing to add per-route.
- `lib/server/auth/require-user.ts`'s `requireUser()` already calls `logger.warn` on a failed auth check — same, free for any route using it.
- A `catch` block that used to be empty or a bare `console.error(...)` should become a `logger.error`/`logger.warn` call classified per the policy above, not a blanket "log everything" pass. If a catch is empty on purpose (documented, high-frequency, expected), leave it silent and say why in a comment — don't add a log just to have one.

## Reference implementations

`app/api/arena/route.ts`, `app/api/arena/upload/route.ts`, `app/api/arena/[id]/route.ts`, `app/api/profile/update/route.ts`, `app/api/user/follow/route.ts`, `app/api/user/[id]/route.ts` all use `withApiErrorHandling` + `requireUser`/`getOptionalUser`. `app/api/auth/me/route.ts` shows the pattern for a route with different error semantics (graceful degradation instead of a thrown 500) that still classifies its one best-effort catch as a `warn`.

## Future swap target — not installed, don't install without asking

The console-based implementation is intentional for now — no new dependency. When it's time for real log files with daily rotation plus Sentry/OpenTelemetry integration, **Pino** is the better fit of the two mainstream options: it writes asynchronously (offloads I/O off the event loop instead of blocking it, which is exactly the request-path cost `.agents/rules/logging.md`'s policy above is trying to minimize), pairs with `pino-roll` for daily-rotated files, and has both `pino-opentelemetry-transport` and Sentry transports. **Winston** is the alternative if the daily-rotation + Sentry + OpenTelemetry combination needs to be more turnkey out of the box (`winston-daily-rotate-file` and `@opentelemetry/instrumentation-winston` are both mature) — Winston is synchronous and slower under load, but has the larger ecosystem. Either one drops into `createLogger()` in `lib/server/logger.ts` as the return value, matching the existing `Logger` interface — no call site should need to change. Note: Pino needs a browser polyfill and doesn't reach Edge runtime/middleware, so `lib/client/logger.ts` and any edge middleware logging would need their own transport regardless of which is chosen for the Node.js server side.

Sources: [The Top 7 Node.js Logging Libraries Compared](https://www.dash0.com/guides/nodejs-logging-libraries), [Structured Logging in Next.js with OpenTelemetry](https://signoz.io/blog/opentelemetry-nextjs-logging/), [Logging in Next.js is hard](https://blog.sentry.io/logging-in-next-js-is-hard-but-it-doesnt-have-to-be)
