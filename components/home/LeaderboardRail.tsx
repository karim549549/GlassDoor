"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { GlobalStanding } from "@/lib/arena/leaderboard-service";

/**
 * The standings rail that sits beside the arena cards.
 *
 * Two things about it are deliberate.
 *
 * It shows only real, judged ratings. RatingState is written by a published
 * judging run and by nothing else, so a name here has always been earned. There
 * is no placeholder list: this page previously carried eight fictional winners
 * repeated on every arena, and for a platform whose entire product is a
 * credential, an invented leaderboard is the most damaging thing it could
 * publish. With nobody rated yet the rail says so plainly and invites the first
 * entry - an empty state is an invitation, not a failure.
 *
 * The continuous rotation is FLIP, not a CSS marquee. Each tick moves the top
 * entry to the bottom in the data, then plays every row from where it used to
 * be to where it now is, so rows visibly travel past each other rather than the
 * whole list sliding as one block. That is what makes it read as a standing
 * being recalculated instead of a ticker scrolling.
 */

const ROTATE_MS = 2600;
const SETTLE_MS = 620;

const DOMAIN_LABEL: Record<string, string> = {
  FULL_STACK_WEB: "Full stack",
  BACKEND_DISTRIBUTED: "Backend",
  FRONTEND_MOBILE: "Frontend",
  AI_MACHINE_LEARNING: "AI / ML",
  DATA_ENGINEERING: "Data",
  CYBERSECURITY_ETHICAL_HACKING: "Security",
  SYSTEMS_DEV_OPS: "Systems",
  EMBEDDED_IOT: "Embedded",
  BLOCKCHAIN_WEB3: "Web3",
};

function displayName(s: GlobalStanding) {
  if (s.handle) return `@${s.handle}`;
  if (s.fullName) return s.fullName;
  return "Unnamed";
}

export function LeaderboardRail({ standings }: { standings: GlobalStanding[] }) {
  const listRef = useRef<HTMLUListElement>(null);
  const orderRef = useRef<number[]>(standings.map((_, i) => i));

  useEffect(() => {
    const list = listRef.current;
    // Under four rows there is nothing to rotate past anything else.
    if (!list || standings.length < 4) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timer = 0;

    const tick = () => {
      const rows = Array.from(list.children) as HTMLElement[];

      // FLIP: measure First.
      const before = new Map<HTMLElement, number>();
      rows.forEach((r) => before.set(r, r.getBoundingClientRect().top));

      // Move the leader to the back and re-place the rows in the new order.
      const order = orderRef.current;
      order.push(order.shift() as number);
      order.forEach((idx) => {
        const row = rows.find((r) => r.dataset.idx === String(idx));
        if (row) list.appendChild(row);
      });

      // Last, Invert, Play.
      rows.forEach((row) => {
        const start = before.get(row);
        if (start === undefined) return;
        const delta = start - row.getBoundingClientRect().top;
        if (!delta) return;

        row.animate(
          [{ transform: `translateY(${delta}px)` }, { transform: "translateY(0)" }],
          { duration: SETTLE_MS, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
        );
      });

      timer = window.setTimeout(tick, ROTATE_MS);
    };

    timer = window.setTimeout(tick, ROTATE_MS);
    return () => window.clearTimeout(timer);
  }, [standings.length]);

  if (standings.length === 0) {
    return (
      <aside className="w-full lg:w-[19rem] shrink-0">
        <header className="flex items-baseline justify-between border-b border-current/20 pb-2">
          <span className="font-mono text-[0.5rem] font-bold uppercase tracking-[0.22em] text-orange">
            Standings
          </span>
          <span className="font-mono text-[0.45rem] uppercase tracking-[0.18em] opacity-50">
            Live
          </span>
        </header>

        <div className="mt-5 border border-dashed border-current/25 px-4 py-6">
          <p className="font-display text-[1.05rem] leading-tight">Nobody is rated yet.</p>
          <p className="font-mono text-[0.5rem] uppercase tracking-[0.14em] opacity-55 leading-relaxed mt-2.5">
            A rating appears here the first time a submission is judged and the
            results are published. Not before.
          </p>
          <Link
            href="/arena"
            className="inline-block mt-4 font-mono text-[0.55rem] font-bold uppercase tracking-[0.18em] text-orange border-b border-orange/40 pb-0.5 hover:border-orange transition-colors"
          >
            Be the first &rarr;
          </Link>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-full lg:w-[19rem] shrink-0">
      <header className="flex items-baseline justify-between border-b border-current/20 pb-2">
        <span className="font-mono text-[0.5rem] font-bold uppercase tracking-[0.22em] text-orange">
          Standings
        </span>
        <span className="font-mono text-[0.45rem] uppercase tracking-[0.18em] opacity-50">
          {standings.length} rated
        </span>
      </header>

      <ul ref={listRef} className="mt-2">
        {standings.map((s, i) => (
          <li
            key={s.userId + s.domain}
            data-idx={i}
            className="flex items-center gap-3 border-b border-current/10 py-2.5 will-change-transform"
          >
            <span className="font-mono text-[0.55rem] tabular-nums opacity-45 w-5 shrink-0">
              {String(i + 1).padStart(2, "0")}
            </span>

            <span className="min-w-0 flex-1">
              <span className="block font-mono text-[0.62rem] uppercase tracking-[0.08em] truncate">
                {displayName(s)}
              </span>
              <span className="block font-mono text-[0.44rem] uppercase tracking-[0.16em] opacity-45 mt-0.5">
                {DOMAIN_LABEL[s.domain] ?? s.domain}
              </span>
            </span>

            <span className="text-right shrink-0">
              <span className="block font-mono text-[0.8rem] font-bold tabular-nums leading-none">
                {Math.round(s.rating)}
              </span>
              {/* A wide deviation means Glicko-2 is not yet confident. Saying so
                  is more honest than presenting every number as settled. */}
              {s.deviation > 110 && (
                <span className="block font-mono text-[0.4rem] uppercase tracking-[0.14em] text-orange mt-1">
                  Provisional
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>

      <Link
        href="/arena"
        className="inline-block mt-4 font-mono text-[0.5rem] uppercase tracking-[0.18em] opacity-55 hover:opacity-100 hover:text-orange transition-all"
      >
        Full board &rarr;
      </Link>
    </aside>
  );
}

export default LeaderboardRail;
