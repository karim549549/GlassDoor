import { test } from "node:test";
import assert from "node:assert/strict";
import { otpCodeSchema, verifyOtpSchema, OTP_LENGTH } from "./otp";

/**
 * These exist because the pattern shipped broken. It was built from a template
 * literal whose escape silently collapsed, leaving a regex that matched six
 * letter Ds instead of six digits - so every verification attempt failed
 * validation and 400'd before Supabase was ever called. Nothing in typecheck,
 * lint or the build can catch a regex that is valid but wrong.
 */
test("accepts a six-digit code", () => {
  assert.equal(otpCodeSchema.safeParse("123456").success, true);
  assert.equal(otpCodeSchema.safeParse("000000").success, true);
  assert.equal(otpCodeSchema.safeParse("111111").success, true);
});

test("rejects the letter the broken pattern used to accept", () => {
  assert.equal(otpCodeSchema.safeParse("dddddd").success, false);
  assert.equal(otpCodeSchema.safeParse("abcdef").success, false);
});

test("rejects wrong lengths", () => {
  assert.equal(otpCodeSchema.safeParse("12345").success, false);
  assert.equal(otpCodeSchema.safeParse("1234567").success, false);
  assert.equal(otpCodeSchema.safeParse("").success, false);
});

test("trims surrounding whitespace from a pasted code", () => {
  const parsed = otpCodeSchema.safeParse("  123456 ");
  assert.equal(parsed.success, true);
  assert.equal(parsed.success && parsed.data, "123456");
});

test("the pattern is tied to OTP_LENGTH", () => {
  assert.equal(otpCodeSchema.safeParse("1".repeat(OTP_LENGTH)).success, true);
  assert.equal(otpCodeSchema.safeParse("1".repeat(OTP_LENGTH + 1)).success, false);
});

test("verify payload requires a known purpose", () => {
  const base = { email: "someone@example.com", code: "123456" };
  assert.equal(verifyOtpSchema.safeParse({ ...base, purpose: "signup" }).success, true);
  assert.equal(verifyOtpSchema.safeParse({ ...base, purpose: "recovery" }).success, true);
  assert.equal(verifyOtpSchema.safeParse({ ...base, purpose: "magiclink" }).success, false);
  assert.equal(verifyOtpSchema.safeParse(base).success, false);
});

test("verify payload accepts a local-part starting with digits", () => {
  // The address that surfaced the bug in production.
  const parsed = verifyOtpSchema.safeParse({
    email: "01150067966k@gmail.com",
    code: "123456",
    purpose: "signup",
  });
  assert.equal(parsed.success, true);
});
