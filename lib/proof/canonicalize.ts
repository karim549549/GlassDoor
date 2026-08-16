/**
 * Deterministic JSON encoding for Proof Packets.
 *
 * A Proof Packet publishes its own content hash so an employer can verify the
 * credential was not altered after issue. JSON.stringify serializes object keys
 * in insertion order, so the same packet assembled by two different code paths
 * - a fresh judging run vs. a re-read from Prisma, say - produces two different
 * strings and therefore two different hashes, and a genuine credential fails
 * verification. Canonicalizing (recursive key sort, fixed number/date forms, no
 * incidental whitespace) makes the hash a function of the packet's *structure*
 * rather than of how it happened to be built.
 *
 * Values that cannot round-trip through JSON - NaN, the infinities, BigInt,
 * functions, symbols - are rejected rather than coerced. A hash that silently
 * covers a different value than the one on the page is worse than no hash.
 *
 * Split out of hash.ts because this half is pure string work with no crypto
 * dependency, and the browser needs it: the landing page verifier canonicalises
 * a packet client-side and digests it with SubtleCrypto. Importing hash.ts there
 * would pull in node:crypto. Both sides sharing ONE encoder is the whole point -
 * two implementations that drifted would fail genuine credentials.
 */

function at(path: string[]): string {
  return path.length === 0 ? "the root value" : `\`${path.join("")}\``;
}

function encode(value: unknown, path: string[], ancestors: Set<object>): string {
  if (value === null) return "null";

  switch (typeof value) {
    case "string":
      return JSON.stringify(value);
    case "boolean":
      return value ? "true" : "false";
    case "number":
      if (!Number.isFinite(value)) {
        throw new Error(
          `Cannot canonicalize the non-finite number ${String(value)} at ${at(path)}: it has no JSON representation.`,
        );
      }
      return JSON.stringify(value);
    case "bigint":
      throw new Error(
        `Cannot canonicalize the BigInt at ${at(path)}: BigInt has no JSON representation. Convert it to a string first.`,
      );
    case "function":
      throw new Error(
        `Cannot canonicalize the function at ${at(path)}: functions carry no serializable content.`,
      );
    case "symbol":
      throw new Error(
        `Cannot canonicalize the symbol at ${at(path)}: symbols carry no serializable content.`,
      );
    case "undefined":
      // Reachable only at the root - undefined is dropped from objects and
      // becomes null in arrays before recursing. JSON.stringify returns the
      // undefined *value* here, which cannot be hashed, so reject it instead.
      throw new Error("Cannot canonicalize undefined at the root value.");
  }

  const object = value as object;

  if (object instanceof Date) {
    const time = object.getTime();
    if (Number.isNaN(time)) {
      throw new Error(`Cannot canonicalize the Invalid Date at ${at(path)}.`);
    }
    return JSON.stringify(object.toISOString());
  }

  // A Map or Set has no own enumerable keys, so the generic object branch below
  // would quietly canonicalize it to "{}" - every Map hashing identically. That
  // is the silent-corruption case this module exists to prevent.
  if (object instanceof Map || object instanceof Set) {
    throw new Error(
      `Cannot canonicalize the ${object.constructor.name} at ${at(path)}: convert it to a plain object or array first.`,
    );
  }

  if (ancestors.has(object)) {
    throw new Error(`Cannot canonicalize a circular reference at ${at(path)}.`);
  }

  // Tracked as a stack, not a seen-set: the same judge object legitimately
  // appears under several criteria, and repetition is not a cycle.
  ancestors.add(object);
  try {
    if (Array.isArray(object)) {
      // Array order is meaningful here - leaderboard placement, criterion
      // sequence - so it is preserved rather than sorted.
      const items = object.map((item, index) =>
        item === undefined ? "null" : encode(item, [...path, `[${index}]`], ancestors),
      );
      return `[${items.join(",")}]`;
    }

    const entries: string[] = [];
    for (const key of Object.keys(object).sort()) {
      const property = (object as Record<string, unknown>)[key];
      if (property === undefined) continue;
      entries.push(`${JSON.stringify(key)}:${encode(property, [...path, `.${key}`], ancestors)}`);
    }
    return `{${entries.join(",")}}`;
  } finally {
    ancestors.delete(object);
  }
}

/**
 * Deterministic JSON: object keys sorted by UTF-16 code unit at every depth,
 * array order preserved, no insignificant whitespace.
 */
export function canonicalize(value: unknown): string {
  return encode(value, [], new Set<object>());
}
