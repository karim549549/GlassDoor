/**
 * Whether the fixed development code is active, and what it is.
 *
 * Pure and dependency-free so the fence can be tested directly - it is the
 * whole security property of the bypass, and it has already failed once in
 * each direction.
 *
 * The switch is one thing: DEV_OTP_CODE being set. There is no default, so a
 * missing configuration fails closed rather than opening a guessable value,
 * and turning it on anywhere is a deliberate act.
 *
 * Two earlier fences were removed, for opposite reasons:
 *
 *   VERCEL_ENV guarded nothing NODE_ENV did not, and unlike NODE_ENV it can be
 *   set from a local .env - which is what happened. A stale
 *   VERCEL_ENV="production" in local configuration disabled the bypass on a
 *   developer's own machine while they were trying to use it. A fence the
 *   environment it protects can trip is worse than no second fence.
 *
 *   NODE_ENV is "production" for every Vercel deployment, preview included,
 *   because they all run a production build. That made the bypass impossible
 *   to use on the deployed site, which is where this project is actually being
 *   tested before launch.
 *
 * That is a real trade and worth naming: while DEV_OTP_CODE is set on a
 * publicly reachable deployment, anyone who knows the value can sign in as any
 * address. It is acceptable only because nothing on that deployment is real
 * yet. Two things keep it from being forgotten - every use is logged as a
 * warning, and the active state is reported to the client so the verification
 * screen carries a visible banner. Removing the variable before signups open
 * is tracked in TODO.md as a launch blocker.
 */
/**
 * An index signature rather than a single named field, so `process.env`
 * (NodeJS.ProcessEnv) is assignable directly. A one-property interface makes
 * TS reject it for having no properties in common.
 */
export interface DevOtpEnv {
  readonly [key: string]: string | undefined;
}

export function resolveDevOtpCode(env: DevOtpEnv): string | null {
  const code = env.DEV_OTP_CODE;
  return code && code.length > 0 ? code : null;
}

export function isDevOtpActive(env: DevOtpEnv): boolean {
  return resolveDevOtpCode(env) !== null;
}

export function matchesDevOtpCode(env: DevOtpEnv, code: string): boolean {
  const configured = resolveDevOtpCode(env);
  return configured !== null && code === configured;
}
