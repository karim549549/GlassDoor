import "server-only";
import prisma from "@/lib/server/prisma";
import { logger } from "@/lib/server/logger";

/**
 * Guards database objects that Prisma does not manage and therefore cannot
 * detect the loss of.
 *
 * Prisma's schema does not model triggers. `prisma db push`, a schema reset, or
 * a database restored from a logical dump that skipped functions will all drop
 * the conflict-of-interest trigger without any warning, and the application
 * will keep running with the protection silently gone. Because that protection
 * is what stops a judge scoring their own team - which invalidates every proof
 * packet in an arena - its absence has to be loud.
 */

/** Objects created by migration SQL that Prisma will never recreate for us. */
const REQUIRED_TRIGGERS = [
  {
    name: "judge_assignments_coi",
    table: "judge_assignments",
    why: "prevents a judge being assigned to their own team's submission",
  },
] as const;

export interface DbIntegrityResult {
  ok: boolean;
  missing: string[];
}

/**
 * Checks that every required trigger exists. Returns rather than throws so a
 * caller can decide whether a missing trigger is fatal (a judging write) or
 * merely alarming (a health endpoint).
 */
export async function checkDbIntegrity(): Promise<DbIntegrityResult> {
  const rows = await prisma.$queryRaw<{ tgname: string }[]>`
    SELECT tgname FROM pg_trigger WHERE NOT tgisinternal
  `;
  const present = new Set(rows.map((r) => r.tgname));
  const missing = REQUIRED_TRIGGERS.filter((t) => !present.has(t.name)).map((t) => t.name);

  if (missing.length > 0) {
    for (const t of REQUIRED_TRIGGERS.filter((x) => missing.includes(x.name))) {
      logger.error("Required database trigger is missing", {
        trigger: t.name,
        table: t.table,
        consequence: t.why,
        remedy:
          "Re-apply migration 20260815190000_comments_governance_defense_and_coi_trigger. " +
          "If this followed a `prisma db push`, do not use db push on this project.",
      });
    }
  }

  return { ok: missing.length === 0, missing };
}

/**
 * Throwing variant for code paths where proceeding without the guarantee would
 * be unsafe - specifically, creating a judge assignment.
 */
export async function assertDbIntegrity(): Promise<void> {
  const result = await checkDbIntegrity();
  if (!result.ok) {
    throw new Error(
      `Database integrity check failed - missing trigger(s): ${result.missing.join(", ")}`
    );
  }
}
