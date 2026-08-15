import "server-only";
import prisma from "@/lib/server/prisma";
import { deriveArenaStatus } from "./status";

/**
 * ADAPTATION signal: requirements injected mid-arena.
 *
 * Halfway through the implementation phase the spec changes for everyone at
 * once. Code that was generated without comprehension breaks under a change
 * its author cannot reason about; code that was understood bends. The whole
 * mechanic depends on one property - the requirement is genuinely unknown
 * until it lands - so an unreleased requirement leaking through any read path
 * destroys the signal entirely.
 *
 * `ArenaRequirement.releasedAt` is NOT NULL with `@default(now())`, which
 * means a row created without an explicit value is visible the instant it
 * exists: there is no draft state and therefore no injection. The schema is
 * owned elsewhere and is not changing, so the draft state is expressed here
 * with a far-future sentinel. Every read filters `releasedAt <= now`, so a
 * sentinel row is invisible by exactly the same rule that hides a scheduled
 * one - there is no second, forgettable "is it a draft" condition to get wrong.
 */
export const DRAFT_RELEASE_AT = new Date("9999-12-31T23:59:59.999Z");

export function isReleased(releasedAt: Date, now: Date): boolean {
  return releasedAt.getTime() <= now.getTime();
}

export function isDraft(releasedAt: Date): boolean {
  return releasedAt.getTime() === DRAFT_RELEASE_AT.getTime();
}

export type RequirementFailure = { ok: false; status: 400 | 403 | 404; error: string };

const PUBLIC_REQUIREMENT_FIELDS = {
  id: true,
  title: true,
  description: true,
  weight: true,
  releasedAt: true,
} as const;

/**
 * The public read. Returns only requirements whose release moment has passed,
 * oldest first, so the list reads as the timeline of injections it is.
 */
export async function listReleasedRequirements(arenaId: string, now: Date) {
  return prisma.arenaRequirement.findMany({
    where: { arenaId, releasedAt: { lte: now } },
    select: PUBLIC_REQUIREMENT_FIELDS,
    orderBy: { releasedAt: "asc" },
  });
}

export interface RequirementListResult {
  ok: true;
  isHost: boolean;
  requirements: {
    id: string;
    title: string;
    description: string;
    weight: number;
    releasedAt: Date;
    /** Host-only fields; absent from the public projection. */
    status?: "RELEASED" | "SCHEDULED" | "DRAFT";
  }[];
}

/**
 * Read path for the requirements endpoint.
 *
 * `viewerId` is the session user or null. Drafts and future-scheduled rows are
 * only ever included when the viewer is the arena's creator AND explicitly
 * asked for them; an anonymous or entrant caller can never receive them, and
 * the query itself - not a post-filter - is what excludes them.
 */
export async function getArenaRequirements(params: {
  arenaId: string;
  viewerId: string | null;
  includeUnreleased?: boolean;
  now: Date;
}): Promise<RequirementListResult | RequirementFailure> {
  const { arenaId, viewerId, includeUnreleased = false, now } = params;

  const arena = await prisma.arena.findFirst({
    where: { id: arenaId, isDeleted: false },
    select: { id: true, creatorId: true, publishedAt: true },
  });

  if (!arena) return { ok: false, status: 404, error: "Arena not found." };

  const isHost = Boolean(viewerId) && arena.creatorId === viewerId;

  // An unpublished arena is a private draft; its requirements are not public.
  if (!arena.publishedAt && !isHost) {
    return { ok: false, status: 404, error: "Arena not found." };
  }

  if (!isHost || !includeUnreleased) {
    return { ok: true, isHost, requirements: await listReleasedRequirements(arenaId, now) };
  }

  const rows = await prisma.arenaRequirement.findMany({
    where: { arenaId },
    select: PUBLIC_REQUIREMENT_FIELDS,
    orderBy: { releasedAt: "asc" },
  });

  return {
    ok: true,
    isHost,
    requirements: rows.map((r) => ({
      ...r,
      status: isReleased(r.releasedAt, now)
        ? ("RELEASED" as const)
        : isDraft(r.releasedAt)
          ? ("DRAFT" as const)
          : ("SCHEDULED" as const),
    })),
  };
}

async function requireHostArena(arenaId: string, hostUserId: string) {
  const arena = await prisma.arena.findFirst({
    where: { id: arenaId, isDeleted: false },
  });
  if (!arena) return { ok: false as const, status: 404 as const, error: "Arena not found." };
  if (arena.creatorId !== hostUserId) {
    return {
      ok: false as const,
      status: 403 as const,
      error: "Only the arena host can manage requirements.",
    };
  }
  return { ok: true as const, arena };
}

export interface CreateRequirementInput {
  arenaId: string;
  hostUserId: string;
  title: string;
  description: string;
  weight?: number;
  /** Omitted creates a draft the host releases by hand; supplied schedules the injection. */
  releaseAt?: Date | null;
  now: Date;
}

/**
 * Creates a requirement. `releasedAt` is ALWAYS set explicitly - never left to
 * the column default - so creation can never accidentally publish.
 */
export async function createArenaRequirement(
  input: CreateRequirementInput
): Promise<{ ok: true; requirement: { id: string; title: string; releasedAt: Date } } | RequirementFailure> {
  const host = await requireHostArena(input.arenaId, input.hostUserId);
  if (!host.ok) return host;

  const status = deriveArenaStatus(host.arena, input.now);
  if (status === "CANCELED" || status === "COMPLETED") {
    return { ok: false, status: 400, error: `Requirements cannot be added to a ${status} arena.` };
  }

  let releasedAt = DRAFT_RELEASE_AT;
  if (input.releaseAt) {
    if (input.releaseAt.getTime() <= input.now.getTime()) {
      return {
        ok: false,
        status: 400,
        error: "A scheduled release must be in the future. Omit it to create a draft you release by hand.",
      };
    }
    // A requirement that lands after submissions lock can never be adapted to,
    // so scheduling one is always a mistake rather than an intent.
    if (input.releaseAt.getTime() > host.arena.implPhaseEnd.getTime()) {
      return {
        ok: false,
        status: 400,
        error: "A requirement cannot be scheduled after the implementation phase ends - entrants would have no time to adapt.",
      };
    }
    releasedAt = input.releaseAt;
  }

  const requirement = await prisma.arenaRequirement.create({
    data: {
      arenaId: input.arenaId,
      title: input.title.trim(),
      description: input.description.trim(),
      weight: input.weight ?? 1.0,
      releasedAt,
    },
    select: { id: true, title: true, releasedAt: true },
  });

  return { ok: true, requirement };
}

/**
 * Releases a drafted or scheduled requirement immediately.
 *
 * Only legal during IMPLEMENTATION_PHASE: before it, entrants have not started
 * and there is nothing to adapt; after it, submissions are locked and a
 * "change" nobody can act on is just noise on the scoreboard.
 */
export async function releaseArenaRequirement(params: {
  arenaId: string;
  requirementId: string;
  hostUserId: string;
  now: Date;
}): Promise<{ ok: true; requirement: { id: string; title: string; releasedAt: Date } } | RequirementFailure> {
  const host = await requireHostArena(params.arenaId, params.hostUserId);
  if (!host.ok) return host;

  const status = deriveArenaStatus(host.arena, params.now);
  if (status !== "IMPLEMENTATION_PHASE") {
    return {
      ok: false,
      status: 400,
      error: `Requirements can only be injected during IMPLEMENTATION_PHASE (current: ${status}). Releasing one outside that window gives entrants no window to adapt.`,
    };
  }

  const existing = await prisma.arenaRequirement.findFirst({
    where: { id: params.requirementId, arenaId: params.arenaId },
    select: { id: true, releasedAt: true },
  });

  if (!existing) return { ok: false, status: 404, error: "Requirement not found." };

  if (isReleased(existing.releasedAt, params.now)) {
    return { ok: false, status: 400, error: "That requirement has already been released." };
  }

  const requirement = await prisma.arenaRequirement.update({
    where: { id: existing.id },
    data: { releasedAt: params.now },
    select: { id: true, title: true, releasedAt: true },
  });

  return { ok: true, requirement };
}
