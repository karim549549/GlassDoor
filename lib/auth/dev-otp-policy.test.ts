import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveDevOtpCode, isDevOtpActive, matchesDevOtpCode } from "./dev-otp-policy";

test("closed when no code is configured", () => {
  assert.equal(resolveDevOtpCode({}), null);
  assert.equal(resolveDevOtpCode({ DEV_OTP_CODE: "" }), null);
  assert.equal(isDevOtpActive({}), false);
  assert.equal(matchesDevOtpCode({}, "111111"), false);
});

test("open when a code is configured, and only for that code", () => {
  const env = { DEV_OTP_CODE: "111111" };
  assert.equal(resolveDevOtpCode(env), "111111");
  assert.equal(isDevOtpActive(env), true);
  assert.equal(matchesDevOtpCode(env, "111111"), true);
  assert.equal(matchesDevOtpCode(env, "222222"), false);
  assert.equal(matchesDevOtpCode(env, ""), false);
});

test("environment variables other than DEV_OTP_CODE do not decide it", () => {
  // Both regressions this file exists for. A stale VERCEL_ENV="production" in
  // a local .env used to close the bypass on a developer's own machine; a
  // NODE_ENV check used to close it on every Vercel deployment, including the
  // pre-launch one this project is actually tested on. Neither is consulted.
  const env = {
    DEV_OTP_CODE: "111111",
    VERCEL_ENV: "production",
    NODE_ENV: "production",
  } as Record<string, string>;
  assert.equal(matchesDevOtpCode(env, "111111"), true);
});
