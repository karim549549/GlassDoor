import "server-only";
import type { CompanyRole, Prisma, RatingDomain } from "@prisma/client";
import prisma from "@/lib/server/prisma";

/**
 * Company roles that may see a candidate pipeline. BILLING_MANAGER is
 * deliberately excluded: paying the invoice is not a reason to read developer
 * personal data.
 */
export const PIPELINE_ROLES: readonly CompanyRole[] = ["OWNER", "ADMIN", "RECRUITER"];

export interface PipelineMembership {
  companyId: string;
  role: CompanyRole;
  companyName: string;
  companySlug: string;
}

/**
 * THE authorization source for everything in this module.
 *
 * Every pipeline read resolves the caller's memberships here, from the
 * database, keyed on the session user id. A `companyId` arriving in a query
 * string or request body is only ever used to *narrow* this set — never to
 * establish it. Treating a client-supplied company id as the authorization
 * input is a direct IDOR that hands one company another company's candidate
 * pipeline.
 *
 * A pending invite (`isAccepted: false`) or a revoked seat (`isApproved:
 * false`) grants nothing.
 */
export async function getPipelineMemberships(userId: string): Promise<PipelineMembership[]> {
  const memberships = await prisma.companyMember.findMany({
    where: {
      userId,
      role: { in: [...PIPELINE_ROLES] },
      isAccepted: true,
      isApproved: true,
      company: { isDeleted: false },
    },
    select: {
      companyId: true,
      role: true,
      company: { select: { name: true, slug: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return memberships.map((m) => ({
    companyId: m.companyId,
    role: m.role,
    companyName: m.company.name,
    companySlug: m.company.slug,
  }));
}

/**
 * Intersects a requested company id with the caller's resolved memberships.
 * Returns null when the caller asked for a company they are not a member of —
 * callers must treat null as 403 and must not fall back to "all companies".
 */
export function resolveAuthorizedCompanyIds(
  memberships: PipelineMembership[],
  requestedCompanyId?: string
): string[] | null {
  const owned = memberships.map((m) => m.companyId);
  if (owned.length === 0) return null;
  if (!requestedCompanyId) return owned;
  return owned.includes(requestedCompanyId) ? [requestedCompanyId] : null;
}

/** Public profile columns only. There is deliberately no `email` here — see CONTACT_WITHHELD_REASON. */
const CANDIDATE_SELECT = {
  id: true,
  fullName: true,
  handle: true,
  avatarUrl: true,
  seniority: true,
  location: true,
} satisfies Prisma.UserSelect;

type CandidateUser = Prisma.UserGetPayload<{ select: typeof CANDIDATE_SELECT }>;

/**
 * Why no contact details are in this response.
 *
 * The schema has `Arena.requireHiringConsent` (a *gate on entering an arena*)
 * but no record that a given developer consented, and no per-user
 * contactable/open-to-work flag that a developer can set or withdraw. PDPL
 * consent has to be specific, recorded and withdrawable, and none of those
 * three is satisfiable from what exists today — so contact details are
 * withheld unconditionally rather than inferred.
 */
export const CONTACT_WITHHELD_REASON =
  "Contact details are withheld: no per-developer hiring-contact consent field exists in the schema yet.";

/**
 * Upper bound on rows pulled into memory for the per-candidate rollup. The
 * rollup (distinct arenas, best score, proof packet) spans submissions, so it
 * cannot be done with a single SQL page — this caps the blast radius instead.
 * Raise it, or move the rollup to a materialized view, if a company's arenas
 * ever exceed it.
 */
const MAX_SUBMISSIONS_SCANNED = 5000;

export interface PipelineFilters {
  domain?: RatingDomain;
  minRating?: number;
  page: number;
  pageSize: number;
}

export interface RawPipelineCandidate {
  user: CandidateUser;
  ratings: Array<{ domain: RatingDomain; rating: number; deviation: number }>;
  bestRating: number | null;
  arenasCompleted: number;
  topScore: number;
  proofPacketSlug: string | null;
  /**
   * How many of this candidate's counted arenas were consent-gated
   * (`requireHiringConsent`). Reported for transparency; it is NOT treated as
   * consent — see CONTACT_WITHHELD_REASON.
   */
  hiringConsentArenaCount: number;
}

export interface PipelineResult {
  candidates: RawPipelineCandidate[];
  total: number;
  totalPages: number;
  scannedSubmissionCap: boolean;
}

/**
 * Three queries total, regardless of candidate count: arenas → submissions →
 * rating states. The per-candidate rollup happens in memory over the already
 * fetched rows, so there is no query-per-candidate.
 */
export async function getRecruiterPipeline(
  companyIds: string[],
  filters: PipelineFilters
): Promise<PipelineResult> {
  const empty: PipelineResult = {
    candidates: [],
    total: 0,
    totalPages: 1,
    scannedSubmissionCap: false,
  };
  if (companyIds.length === 0) return empty;

  // 1. The company's own arenas (run or sponsored) with results published.
  //    Unpublished results are not verified signal and must not leak early.
  const arenas = await prisma.arena.findMany({
    where: {
      isDeleted: false,
      resultsPublishedAt: { not: null },
      ...(filters.domain ? { domain: filters.domain } : {}),
      OR: [
        { companyId: { in: companyIds } },
        { sponsors: { some: { companyId: { in: companyIds } } } },
      ],
    },
    select: { id: true, domain: true, requireHiringConsent: true },
  });

  if (arenas.length === 0) return empty;

  const consentGatedArenaIds = new Set(
    arenas.filter((a) => a.requireHiringConsent).map((a) => a.id)
  );

  // 2. Scored, non-withdrawn submissions in those arenas, with the entrant(s)
  //    and any proof packet included rather than looked up per row.
  const submissions = await prisma.arenaSubmission.findMany({
    where: {
      arenaId: { in: arenas.map((a) => a.id) },
      withdrawnAt: null,
      finalScore: { not: null },
    },
    orderBy: { finalScore: "desc" },
    take: MAX_SUBMISSIONS_SCANNED,
    select: {
      arenaId: true,
      finalScore: true,
      proofPacket: { select: { slug: true, isRevoked: true } },
      entry: {
        select: {
          user: { select: CANDIDATE_SELECT },
          team: { select: { members: { select: { user: { select: CANDIDATE_SELECT } } } } },
        },
      },
    },
  });

  const rollup = new Map<
    string,
    {
      user: CandidateUser;
      arenaIds: Set<string>;
      consentArenaIds: Set<string>;
      topScore: number;
      proofPacketSlug: string | null;
    }
  >();

  for (const submission of submissions) {
    const score = submission.finalScore ?? 0;
    const packetSlug =
      submission.proofPacket && !submission.proofPacket.isRevoked
        ? submission.proofPacket.slug
        : null;

    // A team entry credits every member — each of them is a candidate.
    const entrants: CandidateUser[] = submission.entry.user
      ? [submission.entry.user]
      : (submission.entry.team?.members.map((m) => m.user) ?? []);

    for (const entrant of entrants) {
      const existing = rollup.get(entrant.id);
      if (existing) {
        existing.arenaIds.add(submission.arenaId);
        if (consentGatedArenaIds.has(submission.arenaId)) {
          existing.consentArenaIds.add(submission.arenaId);
        }
        existing.topScore = Math.max(existing.topScore, score);
        existing.proofPacketSlug = existing.proofPacketSlug ?? packetSlug;
        continue;
      }
      rollup.set(entrant.id, {
        user: entrant,
        arenaIds: new Set([submission.arenaId]),
        consentArenaIds: new Set(
          consentGatedArenaIds.has(submission.arenaId) ? [submission.arenaId] : []
        ),
        topScore: score,
        proofPacketSlug: packetSlug,
      });
    }
  }

  if (rollup.size === 0) return empty;

  // 3. Every candidate's rating states in one query.
  const ratingStates = await prisma.ratingState.findMany({
    where: {
      userId: { in: [...rollup.keys()] },
      ...(filters.domain ? { domain: filters.domain } : {}),
    },
    select: { userId: true, domain: true, rating: true, deviation: true },
  });

  const ratingsByUser = new Map<string, RawPipelineCandidate["ratings"]>();
  for (const state of ratingStates) {
    const list = ratingsByUser.get(state.userId) ?? [];
    list.push({ domain: state.domain, rating: state.rating, deviation: state.deviation });
    ratingsByUser.set(state.userId, list);
  }

  let candidates: RawPipelineCandidate[] = [...rollup.values()].map((entry) => {
    const ratings = (ratingsByUser.get(entry.user.id) ?? []).sort((a, b) => b.rating - a.rating);
    return {
      user: entry.user,
      ratings,
      bestRating: ratings.length > 0 ? ratings[0].rating : null,
      arenasCompleted: entry.arenaIds.size,
      topScore: entry.topScore,
      proofPacketSlug: entry.proofPacketSlug,
      hiringConsentArenaCount: entry.consentArenaIds.size,
    };
  });

  if (filters.minRating !== undefined) {
    const floor = filters.minRating;
    candidates = candidates.filter((c) => (c.bestRating ?? 0) >= floor);
  }

  // Ranked by verified signal: rating first, then best score, then breadth.
  candidates.sort(
    (a, b) =>
      (b.bestRating ?? 0) - (a.bestRating ?? 0) ||
      b.topScore - a.topScore ||
      b.arenasCompleted - a.arenasCompleted
  );

  const total = candidates.length;
  const start = (filters.page - 1) * filters.pageSize;

  return {
    candidates: candidates.slice(start, start + filters.pageSize),
    total,
    totalPages: Math.max(1, Math.ceil(total / filters.pageSize)),
    scannedSubmissionCap: submissions.length === MAX_SUBMISSIONS_SCANNED,
  };
}
