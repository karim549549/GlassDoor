/**
 * Human labels for the arena enums, in one place.
 *
 * `FULL_STACK_WEB` and `GRANDMASTER` are storage values; nothing should render
 * them raw, and nothing should hand-write a prettified copy next to a
 * `<select>`. The values themselves live in `lib/arena/schema.ts`, which stays
 * the single source of truth for what is valid - this file only decides how
 * they read.
 */

export const ARENA_DOMAINS = [
  { value: "FULL_STACK_WEB", label: "Full-stack web", detail: "Front to back, one build" },
  { value: "FRONTEND_MOBILE", label: "Frontend & mobile", detail: "Interfaces, apps, motion" },
  { value: "BACKEND_DISTRIBUTED", label: "Backend", detail: "APIs, services, scale" },
  { value: "AI_MACHINE_LEARNING", label: "AI & ML", detail: "Models, agents, prompts" },
  { value: "DATA_ENGINEERING", label: "Data", detail: "Pipelines, warehouses, viz" },
  { value: "SYSTEMS_DEV_OPS", label: "Systems & DevOps", detail: "Infra, CI, observability" },
  { value: "CYBERSECURITY_ETHICAL_HACKING", label: "Security", detail: "Break it, then fix it" },
  { value: "EMBEDDED_IOT", label: "Embedded & IoT", detail: "Hardware in the loop" },
  { value: "BLOCKCHAIN_WEB3", label: "Blockchain", detail: "Contracts and chains" },
] as const;

export type ArenaDomainValue = (typeof ARENA_DOMAINS)[number]["value"];

/**
 * Difficulty carries the XP multiplier in PRD 8.1, so it is not decoration -
 * picking it wrong under-rewards everyone who enters. The detail line is the
 * PRD's own scope description, shortened.
 */
export const ARENA_DIFFICULTIES = [
  { value: "NOVICE", label: "Novice", detail: "First one? Start here" },
  { value: "INTERMEDIATE", label: "Intermediate", detail: "Full-stack, auth, caching" },
  { value: "ADVANCED", label: "Advanced", detail: "Real-time, microservices" },
  { value: "GRANDMASTER", label: "Grandmaster", detail: "Consensus, throughput" },
] as const;

export type ArenaDifficultyValue = (typeof ARENA_DIFFICULTIES)[number]["value"];
