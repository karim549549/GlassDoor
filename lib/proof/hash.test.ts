import { test } from "node:test";
import assert from "node:assert/strict";
import { canonicalize, contentHash, verifyContentHash } from "./hash";

const PACKET = {
  brief: { title: "Ship a rate limiter", revision: 3 },
  submission: { repo: "octo/limiter", commit: "9f2c1ab" },
  scores: [
    { criterion: "correctness", weight: 0.5, score: 8 },
    { criterion: "clarity", weight: 0.5, score: 7 },
  ],
  judges: ["ada", "grace"],
  placement: { rank: 2, field: 41 },
};

test("key order does not change the hash", () => {
  assert.equal(canonicalize({ a: 1, b: 2 }), canonicalize({ b: 2, a: 1 }));
  assert.equal(contentHash({ a: 1, b: 2 }), contentHash({ b: 2, a: 1 }));
});

test("key order does not change the hash at depth 3+", () => {
  const built = {
    packet: { placement: { rank: 2, field: 41 }, brief: { revision: 3, title: "Ship it" } },
    issuedAt: "2026-08-15",
  };
  const reread = {
    issuedAt: "2026-08-15",
    packet: { brief: { title: "Ship it", revision: 3 }, placement: { field: 41, rank: 2 } },
  };
  assert.equal(contentHash(built), contentHash(reread));
});

test("keys are sorted by code unit at every depth", () => {
  assert.equal(
    canonicalize({ b: { z: 1, Y: 2, a: 3 }, A: [{ d: 1, c: 2 }] }),
    '{"A":[{"c":2,"d":1}],"b":{"Y":2,"a":3,"z":1}}',
  );
});

test("array order does change the hash", () => {
  assert.notEqual(contentHash([1, 2, 3]), contentHash([3, 2, 1]));
  assert.notEqual(
    contentHash({ ...PACKET, judges: ["ada", "grace"] }),
    contentHash({ ...PACKET, judges: ["grace", "ada"] }),
  );
});

test("Date serializes to its ISO string and is stable", () => {
  const iso = "2026-08-15T09:30:00.000Z";
  assert.equal(canonicalize({ judgedAt: new Date(iso) }), `{"judgedAt":"${iso}"}`);
  assert.equal(contentHash({ judgedAt: new Date(iso) }), contentHash({ judgedAt: new Date(iso) }));
  assert.equal(contentHash({ judgedAt: new Date(iso) }), contentHash({ judgedAt: iso }));
  assert.notEqual(
    contentHash({ judgedAt: new Date(iso) }),
    contentHash({ judgedAt: new Date("2026-08-15T09:30:00.001Z") }),
  );
});

test("a one-character change in a deeply nested value changes the hash", () => {
  const tampered = {
    ...PACKET,
    submission: { ...PACKET.submission, commit: "9f2c1ac" },
  };
  assert.notEqual(contentHash(PACKET), contentHash(tampered));
});

test("a one-digit score change changes the hash", () => {
  const tampered = {
    ...PACKET,
    scores: [PACKET.scores[0], { ...PACKET.scores[1], score: 9 }],
  };
  assert.notEqual(contentHash(PACKET), contentHash(tampered));
});

test("undefined properties are omitted, undefined array items become null", () => {
  assert.equal(canonicalize({ a: 1, b: undefined }), '{"a":1}');
  assert.equal(contentHash({ a: 1, b: undefined }), contentHash({ a: 1 }));
  assert.equal(canonicalize([1, undefined, 3]), "[1,null,3]");
  assert.equal(contentHash([1, undefined, 3]), contentHash([1, null, 3]));
});

test("throws on non-finite numbers", () => {
  assert.throws(() => canonicalize({ score: NaN }), /non-finite/);
  assert.throws(() => canonicalize({ score: Infinity }), /non-finite/);
  assert.throws(() => canonicalize({ score: -Infinity }), /non-finite/);
  assert.throws(() => canonicalize([1, NaN]), /\[1\]/);
});

test("throws on BigInt, functions and symbols", () => {
  assert.throws(() => canonicalize({ field: BigInt(41) }), /BigInt/);
  assert.throws(() => canonicalize({ render: () => "x" }), /function/);
  assert.throws(() => canonicalize({ tag: Symbol("judge") }), /symbol/);
});

test("throws on a circular reference instead of overflowing the stack", () => {
  const packet: Record<string, unknown> = { brief: { title: "Ship it" } };
  packet.self = packet;
  assert.throws(() => canonicalize(packet), /circular/);

  const judge: Record<string, unknown> = { name: "ada" };
  const scores = [{ judge }];
  judge.scores = scores;
  assert.throws(() => canonicalize({ scores }), /circular/);
});

test("a repeated (non-circular) reference is not mistaken for a cycle", () => {
  const judge = { name: "ada" };
  assert.equal(canonicalize({ a: judge, b: judge }), '{"a":{"name":"ada"},"b":{"name":"ada"}}');
});

test("verifyContentHash is true for a match and false for a mismatch", () => {
  const hash = contentHash(PACKET);
  assert.equal(verifyContentHash(PACKET, hash), true);
  assert.equal(verifyContentHash({ ...PACKET, judges: ["ada", "mallory"] }, hash), false);
  // Same structure, different insertion order - must still verify.
  assert.equal(verifyContentHash({ ...PACKET, brief: { revision: 3, title: PACKET.brief.title } }, hash), true);
});

test("verifyContentHash returns false for malformed or short expected strings", () => {
  const hash = contentHash(PACKET);
  assert.equal(verifyContentHash(PACKET, ""), false);
  assert.equal(verifyContentHash(PACKET, "sha256:deadbeef"), false);
  assert.equal(verifyContentHash(PACKET, hash.slice(0, -1)), false);
  assert.equal(verifyContentHash(PACKET, `${hash}0`), false);
  assert.equal(verifyContentHash(PACKET, hash.replace("sha256:", "")), false);
});

test("hash format is the prefixed lowercase hex digest", () => {
  assert.match(contentHash(PACKET), /^sha256:[0-9a-f]{64}$/);
  assert.match(contentHash("x"), /^sha256:[0-9a-f]{64}$/);
  assert.match(contentHash(null), /^sha256:[0-9a-f]{64}$/);
});
