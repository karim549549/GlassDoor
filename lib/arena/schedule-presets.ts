/**
 * The format, expressed in the windows that already exist.
 *
 * PRD 1.3 is explicit about this: "`ideaPhaseStart/End` then
 * `implPhaseStart/End` **is** '30 minutes to plan, 4 hours to build', already
 * modelled. Format presets should be expressed in those existing windows
 * rather than as new fields."
 *
 * So this adds no columns. It turns the two questions a host actually has an
 * opinion about - when does it start, and how long is it - into the six
 * timestamps the database stores. The create form previously asked for all six
 * directly, which is six datetime pickers to describe one Saturday, and every
 * one of them an opportunity to produce an arena whose build phase starts
 * before its planning phase ends.
 *
 * Pure and deterministic, the same rule `formats.ts` and `deriveArenaStatus`
 * follow: nothing here reads the clock. The caller supplies every instant.
 */

export type SchedulePresetId = "classic" | "sprint" | "marathon" | "custom";

export interface SchedulePreset {
  id: Exclude<SchedulePresetId, "custom">;
  label: string;
  /** One line, safe to render. */
  tagline: string;
  planMinutes: number;
  buildMinutes: number;
}

/**
 * `classic` is the reference format itself - 30 minutes to plan, 4 hours to
 * build - and is the default for that reason. The other two exist because a
 * community platform where every arena is exactly the same length is a
 * schedule, not a board.
 */
export const SCHEDULE_PRESETS: readonly SchedulePreset[] = [
  {
    id: "classic",
    label: "Classic",
    tagline: "30 minutes to plan, 4 hours to build",
    planMinutes: 30,
    buildMinutes: 240,
  },
  {
    id: "sprint",
    label: "Sprint",
    tagline: "15 minutes to plan, 2 hours to build",
    planMinutes: 15,
    buildMinutes: 120,
  },
  {
    id: "marathon",
    label: "Marathon",
    tagline: "An hour to plan, 8 hours to build",
    planMinutes: 60,
    buildMinutes: 480,
  },
] as const;

export const DEFAULT_PRESET_ID: SchedulePresetId = "classic";

export function findPreset(id: SchedulePresetId): SchedulePreset | null {
  return SCHEDULE_PRESETS.find((p) => p.id === id) ?? null;
}

/** The six windows, as the `datetime-local` strings the form binds to. */
export interface DerivedSchedule {
  registrationStart: string;
  registrationEnd: string;
  ideaPhaseStart: string;
  ideaPhaseEnd: string;
  implPhaseStart: string;
  implPhaseEnd: string;
}

/**
 * `datetime-local` inputs speak a value with no zone, so this formats in local
 * time rather than calling toISOString() - which would silently shift every
 * field by the UTC offset and show a host in Cairo a start three hours before
 * the one they picked.
 */
export function toDateTimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

/**
 * Registration runs from `opensAt` until the arena starts; planning begins the
 * moment registration closes, and building begins the moment planning ends.
 *
 * The phases are deliberately butt-joined rather than separated by a gap.
 * `deriveArenaStatus` reads these boundaries to decide which phase an arena is
 * in, so a gap between two windows is a period where the arena is in no phase
 * at all - a state the status function has no name for.
 */
export function deriveSchedule(params: {
  startsAt: Date;
  opensAt: Date;
  preset: SchedulePreset;
}): DerivedSchedule {
  const { startsAt, opensAt, preset } = params;

  const planEnd = addMinutes(startsAt, preset.planMinutes);
  const buildEnd = addMinutes(planEnd, preset.buildMinutes);

  return {
    registrationStart: toDateTimeLocal(opensAt),
    registrationEnd: toDateTimeLocal(startsAt),
    ideaPhaseStart: toDateTimeLocal(startsAt),
    ideaPhaseEnd: toDateTimeLocal(planEnd),
    implPhaseStart: toDateTimeLocal(planEnd),
    implPhaseEnd: toDateTimeLocal(buildEnd),
  };
}

/** A phase's share of the whole run, for the proportional ribbon in the UI. */
export interface ScheduleSegment {
  key: "registration" | "plan" | "build";
  label: string;
  minutes: number;
  /** 0-100, summing to 100 across the three segments. */
  percent: number;
}

/**
 * Registration is clamped for display only.
 *
 * A brief posted three weeks out makes registration ~99% of the real elapsed
 * time, which renders as a bar with two invisible slivers on the end - hiding
 * the two phases that are the entire point. The ribbon is a diagram of the
 * shape of the day, not a to-scale timeline, so registration is capped at a
 * quarter of the width and the contest keeps the rest.
 */
const MAX_REGISTRATION_SHARE = 0.25;

export function scheduleSegments(schedule: {
  registrationStart: Date;
  registrationEnd: Date;
  ideaPhaseEnd: Date;
  implPhaseEnd: Date;
}): ScheduleSegment[] {
  const minutesBetween = (a: Date, b: Date) =>
    Math.max(0, Math.round((b.getTime() - a.getTime()) / 60_000));

  const registration = minutesBetween(schedule.registrationStart, schedule.registrationEnd);
  const plan = minutesBetween(schedule.registrationEnd, schedule.ideaPhaseEnd);
  const build = minutesBetween(schedule.ideaPhaseEnd, schedule.implPhaseEnd);

  const contest = plan + build;
  if (contest <= 0) return [];

  // Registration's displayed width, capped relative to the contest itself.
  const cappedRegistration = Math.min(
    registration,
    Math.round((contest * MAX_REGISTRATION_SHARE) / (1 - MAX_REGISTRATION_SHARE))
  );
  const total = cappedRegistration + contest;

  return [
    { key: "registration", label: "Registration", minutes: registration, percent: (cappedRegistration / total) * 100 },
    { key: "plan", label: "Plan", minutes: plan, percent: (plan / total) * 100 },
    { key: "build", label: "Build", minutes: build, percent: (build / total) * 100 },
  ];
}

/** "4h", "30m", "1h 30m" - for the ribbon's labels. */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (rest === 0) return `${hours}h`;
  return `${hours}h ${rest}m`;
}
