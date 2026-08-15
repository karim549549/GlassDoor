import { test } from "node:test";
import assert from "node:assert/strict";
import { safeRedirectPath } from "./url";

const FALLBACK = "/";

test("accepts same-origin relative paths", () => {
  assert.equal(safeRedirectPath("/user/123", FALLBACK), "/user/123");
  assert.equal(safeRedirectPath("/arena?tab=my", FALLBACK), "/arena?tab=my");
});

test("rejects absolute URLs to another origin", () => {
  assert.equal(safeRedirectPath("https://evil.com/steal", FALLBACK), FALLBACK);
  assert.equal(safeRedirectPath("http://evil.com", FALLBACK), FALLBACK);
});

test("rejects protocol-relative and backslash forms", () => {
  assert.equal(safeRedirectPath("//evil.com/steal", FALLBACK), FALLBACK);
  assert.equal(safeRedirectPath("/\\evil.com", FALLBACK), FALLBACK);
});

test("rejects non-http schemes and empty input", () => {
  assert.equal(safeRedirectPath("javascript:alert(1)", FALLBACK), FALLBACK);
  assert.equal(safeRedirectPath("", FALLBACK), FALLBACK);
  assert.equal(safeRedirectPath(null, FALLBACK), FALLBACK);
});
