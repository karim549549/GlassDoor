import { scheduleSegments, formatDuration } from "@/lib/arena/schedule-presets";
import type { ArenaStatus } from "@/lib/arena/status";

/**
 * The shape of the day, full width, as a sequence.
 *
 * Numbered, and the numbers are honest: registration, then planning, then the
 * build genuinely happen in that order, and the order is what a reader needs.
 * That is the test structural ornament has to pass — the board's rows are not
 * numbered, because a board is not a sequence.
 *
 * It replaces a `ClockRibbon` squeezed into a 19rem rail, where a proportional
 * bar had roughly nine pixels per hour and the labels wrapped. The shape of an
 * arena's day is the second most important thing on this page and it now gets
 * the width to say so.
 */

interface Stage {
  n: string;
  label: string;
  from: Date;
  to: Date;
  /** Statuses during which this stage is the live one. */
  active: ArenaStatus[];
}

const DATE = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

export interface ArenaPhaselineProps {
  status: ArenaStatus;
  /**
   * The server's clock, passed in rather than read here. Same rule as
   * `deriveArenaStatus`: a component that calls `new Date()` during render
   * disagrees with the HTML it hydrates whenever a boundary falls between the
   * two reads.
   */
  nowIso: string;
  registrationStart: string;
  registrationEnd: string;
  ideaPhaseStart: string;
  ideaPhaseEnd: string;
  implPhaseStart: string;
  implPhaseEnd: string;
}

export function ArenaPhaseline(props: ArenaPhaselineProps) {
  const d = (iso: string) => new Date(iso);
  const now = d(props.nowIso);

  const stages: Stage[] = [
    {
      n: "01",
      label: "Get in",
      from: d(props.registrationStart),
      to: d(props.registrationEnd),
      active: ["SCHEDULED", "REGISTRATION_OPEN"],
    },
    {
      n: "02",
      label: "Plan",
      from: d(props.ideaPhaseStart),
      to: d(props.ideaPhaseEnd),
      active: ["IDEA_PHASE"],
    },
    {
      n: "03",
      label: "Build & demo",
      from: d(props.implPhaseStart),
      to: d(props.implPhaseEnd),
      active: ["IMPLEMENTATION_PHASE"],
    },
  ];

  const segments = scheduleSegments({
    registrationStart: d(props.registrationStart),
    registrationEnd: d(props.registrationEnd),
    ideaPhaseEnd: d(props.ideaPhaseEnd),
    implPhaseEnd: d(props.implPhaseEnd),
  });

  return (
    <section aria-label="Schedule" className="border-y border-foreground/15 bg-card">
      <div className="mx-auto w-full max-w-6xl px-6 py-6 md:px-10 md:py-8">
        <div className="grid grid-cols-1 gap-px border border-foreground/12 bg-foreground/12 sm:grid-cols-3">
          {stages.map((stage) => {
            const live = stage.active.includes(props.status);
            const done = props.status !== "CANCELED" && now > stage.to;

            return (
              <div
                key={stage.n}
                className={`flex flex-col gap-2 px-4 py-4 ${live ? "bg-orange text-[#0E0E0D]" : "bg-card"}`}
              >
                <div className="flex items-baseline gap-2.5">
                  <span
                    className={`font-mono text-[0.6rem] font-bold tabular-nums tracking-[0.16em] ${
                      live ? "text-[#0E0E0D]/85" : "text-foreground/65"
                    }`}
                  >
                    {stage.n}
                  </span>
                  <h3
                    className={`font-mono text-[0.6rem] font-bold uppercase tracking-[0.18em] ${
                      live ? "text-[#0E0E0D]" : done ? "text-foreground/60" : "text-foreground"
                    }`}
                  >
                    {stage.label}
                  </h3>
                  {/* A word, never colour alone - the same rule the rest of
                      this codebase follows with "[✓] DONE". */}
                  {live && (
                    <span className="ml-auto font-mono text-[0.5rem] font-bold uppercase tracking-[0.2em] text-[#0E0E0D]">
                      Now
                    </span>
                  )}
                  {done && !live && (
                    <span className="ml-auto font-mono text-[0.5rem] uppercase tracking-[0.2em] text-foreground/60">
                      Done
                    </span>
                  )}
                </div>

                <p
                  className={`font-sans text-[0.8rem] leading-snug ${
                    live ? "text-[#0E0E0D]/85" : "text-foreground/70"
                  }`}
                >
                  {DATE.format(stage.from)}
                  <span aria-hidden className={live ? "text-[#0E0E0D]/55" : "text-foreground/45"}> → </span>
                  {DATE.format(stage.to)} UTC
                </p>
              </div>
            );
          })}
        </div>

        {segments.length > 0 && (
          <figure className="m-0 mt-4 flex flex-col gap-2">
            <div
              className="flex h-6 w-full border border-foreground/20"
              role="img"
              aria-label={segments
                .map((s) => `${s.label} ${formatDuration(s.minutes)}`)
                .join(", ")}
            >
              {segments.map((segment, i) => (
                <div
                  key={segment.key}
                  style={{ width: `${segment.percent}%` }}
                  className={[
                    "flex min-w-0 items-center justify-center overflow-hidden",
                    i > 0 ? "border-l border-foreground/20" : "",
                    // Only the build phase is filled: it is the one a reader is
                    // deciding the length of, and a three-colour bar would
                    // imply the three are equally interesting.
                    segment.key === "build"
                      ? "bg-orange text-[#0E0E0D]"
                      : segment.key === "plan"
                        ? "bg-foreground/10 text-foreground"
                        : "bg-transparent text-muted-foreground",
                  ].join(" ")}
                >
                  <span className="truncate px-1 font-mono text-[0.5rem] font-bold uppercase tracking-wider">
                    {formatDuration(segment.minutes)}
                  </span>
                </div>
              ))}
            </div>
            <figcaption className="font-mono text-[0.5rem] uppercase tracking-[0.16em] text-foreground/65">
              Proportional. The filled block is the time you actually get to
              build in.
            </figcaption>
          </figure>
        )}
      </div>
    </section>
  );
}

export default ArenaPhaseline;
