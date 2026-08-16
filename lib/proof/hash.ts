import { createHash, timingSafeEqual } from "node:crypto";
import { canonicalize } from "./canonicalize";

/**
 * Server-side hashing over the shared canonical form. The canonicalisation
 * itself lives in ./canonicalize so the browser can run the identical encoder
 * without pulling in node:crypto - see the note there.
 */

export { canonicalize };

const HASH_ALGORITHM = "sha256";
const HASH_PREFIX = `${HASH_ALGORITHM}:`;

/**
 * The algorithm is part of the returned string so a future packet can move to a
 * different hash without the stored values becoming ambiguous.
 */
export function contentHash(value: unknown): string {
  const digest = createHash(HASH_ALGORITHM).update(canonicalize(value), "utf8").digest("hex");
  return `${HASH_PREFIX}${digest}`;
}

/**
 * Compared with timingSafeEqual, which is defensive rather than strictly
 * necessary - the packet hash is published on the page, so there is no secret
 * for a timing side-channel to leak. But a verification primitive is the last
 * place a variable-time compare should be introduced: this function is the
 * obvious thing to reach for the first time a *non*-public digest (a signed
 * packet, a revocation token) needs checking, and it should already be correct.
 *
 * timingSafeEqual throws on buffers of unequal length, so the length check
 * comes first and a malformed or truncated `expected` returns false.
 */
export function verifyContentHash(value: unknown, expected: string): boolean {
  if (typeof expected !== "string") return false;

  const actualBuffer = Buffer.from(contentHash(value), "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");

  if (actualBuffer.length !== expectedBuffer.length) return false;

  return timingSafeEqual(actualBuffer, expectedBuffer);
}
