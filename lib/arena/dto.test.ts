import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveViewer, toArenaDetailDto } from "./dto";
import type { ArenaDetailRow } from "./types";

const HOST_ID = "user-host";
const ENTRANT_ID = "user-entrant";
const INVITE_CODE = "SECRET-42";

const d = (iso: string) => new Date(iso);

/** Nobody in these fixtures has a settled rating; see the test that covers it. */
const person = (fullName: string | null, handle: string | null, over = {}) => ({
  fullName,
  handle,
  avatarUrl: null,
  ratingStates: [] as { domain: string; rating: number; deviation: number }[],
  ...over,
});

/**
 * A row shaped like `ARENA_DETAIL_SELECT` returns. Cast rather than derived
 * because the Prisma payload type carries `Decimal` fields this test has no
 * reason to construct - what is under test is which keys come out, not how
 * money is represented.
 */
function row(over: Partial<ArenaDetailRow> = {}): ArenaDetailRow {
  return {
    id: "arena-1",
    title: "The most devious video player",
    slug: "the-most-devious-video-player",
    domain: "FULL_STACK_WEB",
    allowLeaderAccessControl: true,
    description: "Build it.",
    rules: ["No rules."],
    authority: "COMMUNITY",
    difficulty: "MEDIUM",
    publishedAt: d("2026-08-01T00:00:00Z"),
    canceledAt: null,
    resultsPublishedAt: null,
    locationType: "ONLINE",
    locationName: null,
    googleMapsUrl: null,
    isPrivate: true,
    inviteCode: INVITE_CODE,
    isTeam: true,
    minTeamSize: 2,
    maxTeamSize: 4,
    maxParticipants: null,
    hasPrizePool: false,
    totalPrizePool: null,
    prizeCurrency: "USD",
    firstPlacePrize: null,
    secondPlacePrize: null,
    thirdPlacePrize: null,
    prizeDisbursementTerms: null,
    requireGithubUrl: true,
    requireFigmaUrl: false,
    requireVideoUrl: false,
    requireWriteup: false,
    registrationStart: d("2026-08-01T00:00:00Z"),
    registrationEnd: d("2026-08-10T00:00:00Z"),
    ideaPhaseStart: d("2026-08-11T09:00:00Z"),
    ideaPhaseEnd: d("2026-08-11T09:30:00Z"),
    implPhaseStart: d("2026-08-11T09:30:00Z"),
    implPhaseEnd: d("2026-08-11T13:30:00Z"),
    creatorId: HOST_ID,
    creator: { id: HOST_ID, fullName: "Karim", handle: "karim", avatarUrl: null },
    companyId: null,
    company: null,
    entries: [
      {
        id: "entry-solo",
        joinedAt: d("2026-08-02T00:00:00Z"),
        user: person("Solo Dev", "solo"),
        team: null,
      },
      {
        id: "entry-team",
        joinedAt: d("2026-08-03T00:00:00Z"),
        user: null,
        team: {
          id: "team-1",
          name: "Night Shift",
          joinPolicy: "OPEN",
          members: [
            { isLeader: true, joinedAt: d("2026-08-03T00:00:00Z"), user: person("Lead", "lead") },
            {
              isLeader: false,
              joinedAt: d("2026-08-04T00:00:00Z"),
              user: person("Second", "second"),
            },
          ],
        },
      },
    ],
    _count: { entries: 2, teams: 1, invitations: 0 },
    ...over,
  } as ArenaDetailRow;
}

test("the invite code reaches the host and nobody else", () => {
  const viewers = [
    resolveViewer({ userId: null, creatorId: HOST_ID, isRegistered: false }),
    resolveViewer({ userId: "someone", creatorId: HOST_ID, isRegistered: false }),
    resolveViewer({ userId: ENTRANT_ID, creatorId: HOST_ID, isRegistered: true }),
  ];

  for (const viewer of viewers) {
    const dto = toArenaDetailDto(row(), "REGISTRATION_OPEN", viewer);
    assert.equal(
      "inviteCode" in dto,
      false,
      `${viewer.relationship} must not receive the invite code`
    );
  }

  const host = resolveViewer({ userId: HOST_ID, creatorId: HOST_ID, isRegistered: false });
  assert.equal(toArenaDetailDto(row(), "REGISTRATION_OPEN", host).inviteCode, INVITE_CODE);
});

test("no participant carries a user id field, for any viewer", () => {
  // "Field", precisely: an `avatarUrl` points at `avatars/<userId>.jpg`, so an
  // id can still be read out of a participant who has uploaded one. See the
  // note at the top of dto.ts - that is a storage-naming decision, not
  // something this transform can undo. The fixtures here carry no avatars, so
  // this test checks the part the DTO is actually responsible for.
  const host = resolveViewer({ userId: HOST_ID, creatorId: HOST_ID, isRegistered: false });
  const dto = toArenaDetailDto(row(), "REGISTRATION_OPEN", host);

  // Serialised, because that is the form the API route actually ships and the
  // form a nested id would hide in.
  const wire = JSON.stringify(dto.participants);
  assert.equal(wire.includes("userId"), false);
  assert.equal(wire.includes(ENTRANT_ID), false);

  for (const p of dto.participants) {
    assert.equal("id" in p, false, "a participant has an entryId, never an id");
  }
});

test("a team entry contributes its members, a solo entry its user", () => {
  const guest = resolveViewer({ userId: null, creatorId: HOST_ID, isRegistered: false });
  const { participants } = toArenaDetailDto(row(), "REGISTRATION_OPEN", guest);

  assert.equal(participants.length, 3);
  assert.deepEqual(
    participants.map((p) => [p.displayName, p.teamName, p.isTeamLeader]),
    [
      ["Solo Dev", null, false],
      ["Lead", "Night Shift", true],
      ["Second", "Night Shift", false],
    ]
  );
});

test("someone with no name at all is still nameable", () => {
  const guest = resolveViewer({ userId: null, creatorId: HOST_ID, isRegistered: false });
  const anonymous = row({
    entries: [
      {
        id: "entry-solo",
        joinedAt: d("2026-08-02T00:00:00Z"),
        user: person(null, null),
        team: null,
      },
    ],
  } as Partial<ArenaDetailRow>);

  const { participants } = toArenaDetailDto(anonymous, "REGISTRATION_OPEN", guest);
  assert.equal(participants[0].displayName, "Someone");
});

test("a rating is shown only once Glicko is confident in it", () => {
  const guest = resolveViewer({ userId: null, creatorId: HOST_ID, isRegistered: false });

  const rated = row({
    entries: [
      {
        id: "entry-solo",
        joinedAt: d("2026-08-02T00:00:00Z"),
        user: person("Settled", "settled", {
          // The arena's domain, low deviation: a real measurement.
          ratingStates: [{ domain: "FULL_STACK_WEB", rating: 1723.4, deviation: 60 }],
        }),
        team: null,
      },
      {
        id: "entry-two",
        joinedAt: d("2026-08-02T00:00:00Z"),
        user: person("Provisional", "prov", {
          // One result in: a guess with a number on it.
          ratingStates: [{ domain: "FULL_STACK_WEB", rating: 1900, deviation: 300 }],
        }),
        team: null,
      },
      {
        id: "entry-three",
        joinedAt: d("2026-08-02T00:00:00Z"),
        user: person("Elsewhere", "else", {
          // Rated, but in a domain this arena is not judged in.
          ratingStates: [{ domain: "CYBERSECURITY_ETHICAL_HACKING", rating: 1800, deviation: 40 }],
        }),
        team: null,
      },
    ],
  } as Partial<ArenaDetailRow>);

  const { participants } = toArenaDetailDto(rated, "REGISTRATION_OPEN", guest);

  assert.deepEqual(
    participants.map((p) => [p.displayName, p.rating]),
    [
      ["Settled", 1723],
      ["Provisional", null],
      ["Elsewhere", null],
    ]
  );
});

test("relationship is derived once, and a host is never also an entrant", () => {
  assert.equal(
    resolveViewer({ userId: null, creatorId: HOST_ID, isRegistered: false }).relationship,
    "guest"
  );
  assert.equal(
    resolveViewer({ userId: "x", creatorId: HOST_ID, isRegistered: false }).relationship,
    "visitor"
  );
  assert.equal(
    resolveViewer({ userId: "x", creatorId: HOST_ID, isRegistered: true }).relationship,
    "entrant"
  );
  // A host who somehow also holds an entry is still shown the host surface -
  // `lib/arena/authority.ts` draws the same line for judging.
  assert.equal(
    resolveViewer({ userId: HOST_ID, creatorId: HOST_ID, isRegistered: true }).relationship,
    "host"
  );
});
