"use client";

import { scheduleSegments, formatDuration } from "@/lib/arena/schedule-presets";

/**
 * The shape of the day, as a proportional bar.
 *
 * Six `datetime-local` inputs are six abstract strings; nothing about them
 * tells a host that they have accidentally given their arena eleven minutes to
 * build. This draws what those six values mean, and it is the only place on
 * the page where a host can see the whole run at once.
 *
 * Hairlines and mono labels, so it costs nothing stylistically - it reads as
 * the same document as everything above it rather than as a chart dropped in.
 */
export function ClockRibbon({
  registrationStart,
  registrationEnd,
  ideaPhaseEnd,
  implPhaseEnd,
}: {
  registrationStart: string;
  registrationEnd: string;
  ideaPhaseEnd: string;
  implPhaseEnd: string;
}) {
  const parsed = [registrationStart, registrationEnd, ideaPhaseEnd, implPhaseEnd].map(
    (value) => new Date(value)
  );

  if (parsed.some((d) => Number.isNaN(d.getTime()))) {
    return (
      <p className="border border-dashed border-foreground/20 px-4 py-6 text-center font-mono text-[0.55rem] uppercase tracking-wider text-muted-foreground">
        Pick a start time to see the shape of the day
      </p>
    );
  }

  const [regStart, regEnd, planEnd, buildEnd] = parsed;
  const segments = scheduleSegments({
    registrationStart: regStart,
    registrationEnd: regEnd,
    ideaPhaseEnd: planEnd,
    implPhaseEnd: buildEnd,
  });

  if (segments.length === 0) {
    return (
      <p className="border border-dashed border-accent/50 px-4 py-6 text-center font-mono text-[0.55rem] uppercase tracking-wider text-accent">
        This arena has no time to build in
      </p>
    );
  }

  const clock = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });

  return (
    <figure className="m-0 flex flex-col gap-2">
      <div className="flex items-baseline justify-between font-mono text-[0.55rem] tabular-nums uppercase tracking-wider text-muted-foreground">
        <span>{clock(regEnd)} start</span>
        <span>{clock(buildEnd)} submissions lock</span>
      </div>

      <div className="flex h-9 w-full border border-foreground/20" role="img" aria-label={
        segments.map((s) => `${s.label} ${formatDuration(s.minutes)}`).join(", ")
      }>
        {segments.map((segment, i) => (
          <div
            key={segment.key}
            style={{ width: `${segment.percent}%` }}
            className={[
              "flex min-w-0 items-center justify-center overflow-hidden",
              i > 0 ? "border-l border-foreground/20" : "",
              // Only the build phase is filled. It is the one the reader is
              // actually deciding the length of; a three-colour bar would
              // imply the three phases are equally interesting.
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

      <figcaption className="flex flex-wrap gap-x-5 gap-y-1 font-mono text-[0.5rem] uppercase tracking-wider text-muted-foreground">
        {segments.map((segment) => (
          <span key={segment.key}>
            {segment.label} · {formatDuration(segment.minutes)}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}

export default ClockRibbon;
