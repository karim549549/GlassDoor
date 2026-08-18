"use client";

import { useEffect, useState } from "react";

/**
 * The clock, as the loudest thing on the page.
 *
 * An arena is a thing with a deadline, and until now that deadline was a date
 * in a list of facts — the same weight as the venue and the difficulty. It is
 * not the same weight. It is the one number that decides whether someone acts
 * now or closes the tab, and it is the only element on the site that has to be
 * alive. Everything else here is a document; this ticks.
 *
 * It is also what makes an arena page look like an arena page rather than a
 * row from the board with more words under it.
 */

export interface ArenaCountdownProps {
  /** ISO. The moment being counted down to. */
  target: string;
  /** What is about to happen: "closes in", "starts in", "submissions lock in". */
  label: string;
  /** The server's clock, so the first paint matches the HTML it hydrates. */
  nowIso: string;
}

interface Parts {
  units: { value: number; label: string }[];
  passed: boolean;
}

function split(target: Date, now: Date): Parts {
  const ms = target.getTime() - now.getTime();
  if (ms <= 0) return { units: [], passed: true };

  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;

  /**
   * Three units, and which three depends on how close it is. A week out,
   * seconds are noise; inside the last hour they are the whole point, and a
   * display frozen at "0d 00h 47m" reads as broken.
   */
  return {
    passed: false,
    units:
      days > 0
        ? [
            { value: days, label: days === 1 ? "day" : "days" },
            { value: hours, label: "hrs" },
            { value: minutes, label: "min" },
          ]
        : [
            { value: hours, label: "hrs" },
            { value: minutes, label: "min" },
            { value: seconds, label: "sec" },
          ],
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

export function ArenaCountdown({ target, label, nowIso }: ArenaCountdownProps) {
  const targetDate = new Date(target);
  const [now, setNow] = useState(() => new Date(nowIso));

  useEffect(() => {
    // One second, unconditionally. The component is a dozen nodes, and the
    // alternative - a variable interval that has to be torn down and rebuilt
    // as the remaining time crosses a day boundary - is more moving parts than
    // the saving is worth.
    const id = window.setInterval(() => setNow(new Date()), 1_000);
    return () => window.clearInterval(id);
  }, []);

  const { units, passed } = split(targetDate, now);

  if (passed) return null;

  return (
    <div className="flex flex-col items-start gap-2 lg:items-end">
      <span className="font-mono text-[0.55rem] font-bold uppercase tracking-[0.28em] text-orange">
        {label}
      </span>

      {/* aria-live is deliberately off: a screen reader announcing a new value
          every second would make the rest of the page unusable. The static
          summary below carries the same information once. */}
      <div className="flex items-start gap-3" aria-hidden>
        {units.map((unit, i) => (
          <div key={unit.label} className="flex items-start gap-3">
            {i > 0 && (
              <span className="font-mono text-3xl leading-none text-background/25 md:text-4xl">
                :
              </span>
            )}
            <div className="flex flex-col items-center gap-1">
              <span className="font-mono text-4xl font-bold leading-none tabular-nums text-background md:text-5xl">
                {pad(unit.value)}
              </span>
              <span className="font-mono text-[0.5rem] uppercase tracking-[0.2em] text-background/50">
                {unit.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      <span className="sr-only">
        {label} {units.map((u) => `${u.value} ${u.label}`).join(", ")}
      </span>
    </div>
  );
}

export default ArenaCountdown;
