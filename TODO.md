# TODO

Things that are known-broken or known-missing and are **not** discoverable from
the code, so they will otherwise be forgotten. Anything that lives in a
dashboard rather than in this repo belongs here.

Delete an entry when it is done. Do not let this file become a wishlist -
features go in the PRD, this is only for work that is already owed.

---

## Blocking: Supabase email templates still send a link, not a code

**Where:** Supabase dashboard -> Authentication -> Emails
**Project:** `kchzipajxxryeicyekso` (karim549549's Project, eu-central-1)

The app now verifies with a six-digit code (`/api/auth/verify-otp`), but both
templates still render `{{ .ConfirmationURL }}`. Until they are changed, the
mail that arrives carries a link and the code screen has nothing to accept.

Edit **Confirm signup** and **Reset password**, replacing the link with:

```html
<p>Your Devs Arena code:</p>
<p style="font-size:32px;letter-spacing:8px;font-family:monospace;font-weight:700">{{ .Token }}</p>
<p>It expires in 10 minutes. If you didn't ask for this, ignore this email.</p>
```

Then set **Email OTP Expiration** to `600` under Authentication -> Sign In /
Providers -> Email. The default is one hour, which Supabase's own security
advisor flags.

Locally this is not blocking: `DEV_OTP_CODE` in `.env` is accepted by the
verify route instead of a mailed code. That path is fenced to non-production
three separate ways - see `lib/server/auth/dev-otp.ts`.

## Blocking before real users: custom SMTP

Supabase's built-in mail service is a testing service, not a sending one:
roughly **two messages per hour** project-wide, and on newer projects it only
delivers to addresses on the Supabase org team. A stranger signing up today
would never receive anything.

Needs an SMTP provider (Resend is the usual pick) under Project Settings ->
Authentication -> SMTP Settings, plus DKIM/SPF records on a domain we control.
The DNS half has a propagation delay, so start it before it is urgent.

## Deferred: the auth surface is a modal over the homepage

`next.config.ts` rewrites `/login`, `/signup` and `/forgot-password` to `/`,
and `AuthModal` reads the pathname to decide which form to show. That means
signing in downloads the entire homepage - three.js, GSAP, the arena board and
its three database queries - behind a dialog, and closing the dialog pushes `/`
rather than returning where the reader came from.

It also means the auth routes can never carry their own metadata, because the
document served is always the homepage's.

The forms are already standalone components, so the fix is a new shell rather
than a rewrite: real lightweight pages for the three routes, and keep the modal
for genuinely in-context sign-in (opened by state on the page you are on, not
by a URL rewrite).

## Deferred: legal review

`/terms` and `/privacy` are drafts and are rendered with a `DraftNotice`. They
need a real review before signups are opened to the public.
