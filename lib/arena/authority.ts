/**
 * Who is allowed to create which tier of arena.
 *
 * This was a hole. `authority` sat in `arenaBaseSchema` as
 * `z.enum(["OFFICIAL","COMPANY","COMMUNITY"])` and flowed straight from the
 * request body into the row, so any logged-in caller could
 * `POST /api/arena { authority: "OFFICIAL" }`. Per PRD 7.1 that tier grants
 * FULL XP and cash-prize eligibility, both of which COMMUNITY is explicitly
 * denied - so the one field the whole authority matrix rests on was
 * self-assignable. `companyId` had the same shape: no check that the caller
 * belonged to the company they were attributing the arena to.
 *
 * Authority is therefore never input. It is *derived* from who is asking, and
 * derived here so the rule exists once and can be tested without a database.
 *
 * PRD 7.1:
 *   OFFICIAL   Platform superadmins       FULL XP, prizes allowed
 *   COMPANY    Verified corporate accounts FULL XP, prizes allowed (paid tier)
 *   COMMUNITY  Any developer               0 XP, prizes blocked in V1
 */

export const ARENA_AUTHORITIES = ["OFFICIAL", "COMPANY", "COMMUNITY"] as const;
export type ArenaAuthorityValue = (typeof ARENA_AUTHORITIES)[number];

/**
 * Company roles that may attribute an arena to their company.
 *
 * BILLING_MANAGER is deliberately excluded: paying the invoice is not the same
 * permission as publishing under the company's name in front of the developer
 * population, and a billing seat is the one most likely to be handed to
 * someone outside the engineering org.
 */
export const COMPANY_ROLES_THAT_MAY_HOST = ["OWNER", "ADMIN", "RECRUITER"] as const;

export interface CompanyStanding {
  companyId: string;
  role: string;
  /** The invite was accepted; a pending seat is not a seat. */
  isAccepted: boolean;
  /** Cleared by the company; an unapproved member is not yet trusted. */
  isApproved: boolean;
}

export interface AuthorityRequest {
  /** Platform role names for the caller, from UserRole. */
  roles: readonly string[];
  /** The company the caller asked to attribute this arena to, if any. */
  requestedCompanyId?: string | null;
  /** The caller's standing in that company, if a membership row exists. */
  standing?: CompanyStanding | null;
}

export type AuthorityDecision =
  | { ok: true; authority: ArenaAuthorityValue; companyId: string | null }
  | { ok: false; reason: string };

function canHostForCompany(standing: CompanyStanding | null | undefined): boolean {
  if (!standing) return false;
  if (!standing.isAccepted || !standing.isApproved) return false;
  return (COMPANY_ROLES_THAT_MAY_HOST as readonly string[]).includes(standing.role);
}

/**
 * Decide the tier, and whether the company attribution is allowed at all.
 *
 * Returns a refusal rather than silently downgrading a rejected company
 * attribution to COMMUNITY. A host who believed they were publishing on behalf
 * of their employer should be told they cannot, not discover later that the
 * arena went out unattributed.
 *
 * An ADMIN asking for no company gets OFFICIAL; an ADMIN naming a company gets
 * COMPANY, because attribution is the more specific intent and platform admins
 * are the ones who set companies up.
 */
export function resolveArenaAuthority(request: AuthorityRequest): AuthorityDecision {
  const isPlatformAdmin = request.roles.includes("ADMIN");
  const requestedCompanyId = request.requestedCompanyId || null;

  if (requestedCompanyId) {
    if (!isPlatformAdmin && !canHostForCompany(request.standing)) {
      return {
        ok: false,
        reason: "You cannot create an arena on behalf of that company.",
      };
    }
    return { ok: true, authority: "COMPANY", companyId: requestedCompanyId };
  }

  if (isPlatformAdmin) {
    return { ok: true, authority: "OFFICIAL", companyId: null };
  }

  return { ok: true, authority: "COMMUNITY", companyId: null };
}

/**
 * Whether a tier may carry prize money.
 *
 * PRD 7.1 blocks cash prizes on COMMUNITY arenas in V1, and the create form
 * does not ask for one - but the API accepts the prize fields, so without this
 * the block exists only in a document.
 */
export function mayHavePrizePool(authority: ArenaAuthorityValue): boolean {
  return authority !== "COMMUNITY";
}
