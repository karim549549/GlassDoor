/**
 * Human labels for the arena enums.
 *
 * `ARENA_DOMAINS` and `domainLabel` used to live here. Domains are gone from
 * the product: classifying a playful build challenge by engineering discipline
 * was the hiring taxonomy in disguise - the values were the JOB_TYPES list
 * under different names - and it nudged hosts toward discipline-shaped briefs,
 * which are the boring ones. "The worst landing page" is not frontend; the
 * interesting half is "worst". The column survives as a dormant rating bucket;
 * see the note on the Prisma model.
 *
 * Difficulty stays. "Can a beginner attempt this" is a real question, it is
 * orthogonal to what the brief asks for, and PRD 8.1 hangs the XP multiplier
 * on it.
 */

export const ARENA_DIFFICULTIES = [
  { value: "NOVICE", label: "Novice", detail: "First one? Start here" },
  { value: "INTERMEDIATE", label: "Intermediate", detail: "Full-stack, auth, caching" },
  { value: "ADVANCED", label: "Advanced", detail: "Real-time, microservices" },
  { value: "GRANDMASTER", label: "Grandmaster", detail: "Consensus, throughput" },
] as const;

export type ArenaDifficultyValue = (typeof ARENA_DIFFICULTIES)[number]["value"];
