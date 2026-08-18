"use client";

import Link from "next/link";
import { buildArenaSlug } from "@/lib/arena-slug";
import { timeUntil } from "./ArenaRow";
import { HostPrompt } from "./BoardFacets";

/**
 * The board's rail.
 *
 * Two jobs, and the second is the one that is easy to miss. The obvious job is
 * content: the page was a filter bar and a column of rows, and read thin. The
 * other is that it repairs the rows - on a full-width container the middle
 * column stretched, so a short title left a long empty gap before the countdown
 * on the right. Giving the list a neighbour narrows it to a sensible measure
 * and closes that gap without padding the row with anything invented.
 *
 * Everything here is a real arena from `getBoardSpotlight`, and every entry is
 * a link. A rail of statistics nobody can click would be the same emptiness
 * with more ink on it.
 */

export interface SpotlightItem {
  id: string;
  title: string;
  /** ISO. The moment this arena's current phase turns over. */
  at: string;
  entered: number;
}

export interface BoardSidebarData {
  closingSoon: SpotlightItem[];
  runningNow: SpotlightItem[];
  justFinished: SpotlightItem[];
}

function Panel({
  title,
  accent,
  children,
}: {
  title: string;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-foreground/15 bg-card">
      <h2
        className={`border-b border-foreground/12 px-4 py-2.5 font-mono text-[0.55rem] font-bold uppercase tracking-[0.18em] ${
          accent ? "text-orange-ink" : "text-foreground/70"
        }`}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function SpotlightList({
  items,
  now,
  verb,
  emptyText,
}: {
  items: SpotlightItem[];
  now: Date;
  /** "closes in" / "ends in", or null for finished arenas. */
  verb: string | null;
  emptyText: string;
}) {
  if (items.length === 0) {
    return (
      <p className="px-4 py-4 font-mono text-[0.55rem] uppercase tracking-[0.12em] text-foreground/55">
        {emptyText}
      </p>
    );
  }

  return (
    <ul>
      {items.map((item) => {
        const left = verb ? timeUntil(new Date(item.at), now) : null;

        return (
          <li key={item.id} className="border-b border-foreground/10 last:border-b-0">
            <Link
              href={`/arena/${buildArenaSlug(item.title, item.id)}`}
              className="block px-4 py-3 transition-colors hover:bg-foreground/[0.04] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-orange"
            >
              <span className="block font-display text-[0.95rem] leading-snug text-foreground">
                {item.title}
              </span>
              <span className="mt-1 block font-mono text-[0.52rem] uppercase tracking-[0.12em] text-foreground/65">
                {verb && left && (
                  <>
                    <span className="font-bold text-orange-ink">
                      {verb} {left}
                    </span>
                    {" · "}
                  </>
                )}
                {item.entered === 1 ? "1 entered" : `${item.entered} entered`}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function BoardSidebar({ data, now }: { data: BoardSidebarData; now: Date }) {
  return (
    // Sticky so the rail stays with a reader working down a long board, and
    // scrollable in its own right for the short viewports where it would
    // otherwise trap its own bottom off-screen.
    <aside className="flex flex-col gap-5 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
      <Panel title="Closing soonest" accent>
        <SpotlightList
          items={data.closingSoon}
          now={now}
          verb="closes in"
          emptyText="Nothing open right now"
        />
      </Panel>

      <Panel title="Being built now">
        <SpotlightList
          items={data.runningNow}
          now={now}
          verb="ends in"
          emptyText="No arena is running"
        />
      </Panel>

      <HostPrompt compact />

      <Panel title="Just finished">
        <SpotlightList
          items={data.justFinished}
          now={now}
          verb={null}
          emptyText="Nothing has finished yet"
        />
      </Panel>
    </aside>
  );
}

export default BoardSidebar;
