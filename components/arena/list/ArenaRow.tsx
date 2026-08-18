"use client";

import Link from "next/link";
import { memo } from "react";
import { buildArenaSlug } from "@/lib/arena-slug";
import { deriveArenaStatus, type ArenaStatus } from "@/lib/arena/status";
import { domainLabel } from "@/lib/arena/taxonomy";
import type { SerializedArenaListItem } from "@/lib/arena/types";

/**
 * One arena, as a row.
 *
 * This replaces a card whose first element was a 4:1 cover strip. Arenas have
 * no cover image any more, so that strip spent a third of the card's height
 * rendering a trophy glyph and the words "NO COVER" - and with it gone the card
 * was mostly whitespace. A row is denser, scans vertically, and puts the two
 * fields that decide whether someone clicks on the same line: the brief, and
 * how long is left.
 *
 * `now` is a prop, never read here. A countdown computed during render would
 * differ between the server's HTML and the browser's first paint, and every
 * row on the page would hydration-mismatch at once. The list owns the clock -
 * see ArenasListClient - which is the same rule `deriveArenaStatus` follows.
 */

const STATUS_LABEL: Record<ArenaStatus, string> = {
  DRAFT: "Draft",
  SCHEDULED: "Soon",
  REGISTRATION_OPEN: "Open",
  IDEA_PHASE: "Planning",
  IMPLEMENTATION_PHASE: "Building",
  UNDER_JUDGING: "Judging",
  COMPLETED: "Done",
  CANCELED: "Called off",
};

/**
 * Status never relies on colour alone - the label is always spelled out, and
 * the dot is a redundant cue rather than the message.
 */
const STATUS_TONE: Record<ArenaStatus, string> = {
  DRAFT: "text-muted-foreground",
  SCHEDULED: "text-muted-foreground",
  REGISTRATION_OPEN: "text-orange-ink",
  IDEA_PHASE: "text-foreground",
  IMPLEMENTATION_PHASE: "text-foreground",
  UNDER_JUDGING: "text-muted-foreground",
  COMPLETED: "text-muted-foreground",
  CANCELED: "text-accent",
};

/** "2d 4h", "1h 20m", "18m" - or null once the moment has passed. */
export function timeUntil(target: Date, now: Date): string | null {
  const ms = target.getTime() - now.getTime();
  if (ms <= 0) return null;

  const minutes = Math.floor(ms / 60_000);
  if (minutes < 60) return `${Math.max(1, minutes)}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    const rest = minutes % 60;
    return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`;
  }

  const days = Math.floor(hours / 24);
  const restHours = hours % 24;
  return restHours === 0 ? `${days}d` : `${days}d ${restHours}h`;
}

/** The one clock that matters for this arena right now. */
function deadline(
  arena: SerializedArenaListItem,
  status: ArenaStatus,
  now: Date
): string {
  switch (status) {
    case "SCHEDULED": {
      const t = timeUntil(new Date(arena.registrationStart), now);
      return t ? `opens in ${t}` : "opening";
    }
    case "REGISTRATION_OPEN": {
      const t = timeUntil(new Date(arena.registrationEnd), now);
      return t ? `closes in ${t}` : "closing";
    }
    case "IDEA_PHASE": {
      const t = timeUntil(new Date(arena.ideaPhaseEnd), now);
      return t ? `building starts in ${t}` : "building starts";
    }
    case "IMPLEMENTATION_PHASE": {
      const t = timeUntil(new Date(arena.implPhaseEnd), now);
      return t ? `ends in ${t}` : "ending";
    }
    case "UNDER_JUDGING":
      return "being judged";
    case "COMPLETED":
      return "results out";
    case "CANCELED":
      return "called off";
    default:
      return "";
  }
}

function teamShape(arena: SerializedArenaListItem): string {
  if (!arena.isTeam) return "solo";
  if (arena.minTeamSize === arena.maxTeamSize) return `teams of ${arena.maxTeamSize}`;
  return `teams of ${arena.minTeamSize}–${arena.maxTeamSize}`;
}

function prizeLabel(arena: SerializedArenaListItem): string | null {
  if (!arena.hasPrizePool || arena.totalPrizePool == null) return null;
  const amount = Number(arena.totalPrizePool);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return `${amount.toLocaleString()} ${arena.prizeCurrency}`;
}

export interface ArenaRowProps {
  arena: SerializedArenaListItem;
  now: Date;
  /** The signed-in reader, so the row can say "you're in" or "yours". */
  viewerId?: string | null;
}

function ArenaRowInner({ arena, now, viewerId }: ArenaRowProps) {
  const status = deriveArenaStatus(
    {
      publishedAt: arena.publishedAt ? new Date(arena.publishedAt) : null,
      canceledAt: arena.canceledAt ? new Date(arena.canceledAt) : null,
      resultsPublishedAt: arena.resultsPublishedAt ? new Date(arena.resultsPublishedAt) : null,
      registrationStart: new Date(arena.registrationStart),
      registrationEnd: new Date(arena.registrationEnd),
      ideaPhaseStart: new Date(arena.ideaPhaseStart),
      ideaPhaseEnd: new Date(arena.ideaPhaseEnd),
      implPhaseStart: new Date(arena.implPhaseStart),
      implPhaseEnd: new Date(arena.implPhaseEnd),
    },
    now
  );

  const isHost = Boolean(viewerId) && arena.creatorId === viewerId;
  const isIn = (arena.entries?.length ?? 0) > 0;
  const entered = arena._count.entries;
  const prize = prizeLabel(arena);

  const meta = [
    domainLabel(arena.domain),
    arena.difficulty.charAt(0) + arena.difficulty.slice(1).toLowerCase(),
    teamShape(arena),
    arena.locationType === "ONLINE" ? "online" : arena.locationName || "in person",
    entered === 1 ? "1 entered" : `${entered} entered`,
    prize,
  ].filter(Boolean) as string[];

  return (
    <li className="border-b border-foreground/12 last:border-b-0">
      <Link
        href={`/arena/${buildArenaSlug(arena.title, arena.id)}`}
        className="group grid grid-cols-[5.5rem_minmax(0,1fr)] items-baseline gap-x-4 gap-y-1 px-4 py-4 transition-colors hover:bg-foreground/[0.04] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-orange md:grid-cols-[6rem_minmax(0,1fr)_auto] md:px-5"
      >
        <span
          className={`flex items-center gap-1.5 font-mono text-[0.58rem] font-bold uppercase tracking-[0.14em] ${STATUS_TONE[status]}`}
        >
          <span
            aria-hidden
            className={`h-1.5 w-1.5 shrink-0 ${
              status === "REGISTRATION_OPEN"
                ? "bg-orange-ink"
                : status === "IMPLEMENTATION_PHASE" || status === "IDEA_PHASE"
                  ? "bg-foreground"
                  : "border border-foreground/30"
            }`}
          />
          {STATUS_LABEL[status]}
        </span>

        <span className="min-w-0">
          <span className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <span className="font-display text-[1.05rem] leading-snug text-foreground group-hover:text-orange-ink transition-colors">
              {arena.title}
            </span>
            {isHost && (
              <span className="border border-foreground/30 px-1.5 py-px font-mono text-[0.48rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Yours
              </span>
            )}
            {isIn && !isHost && (
              <span className="border border-orange bg-orange px-1.5 py-px font-mono text-[0.48rem] font-bold uppercase tracking-[0.14em] text-[#0E0E0D]">
                You&rsquo;re in
              </span>
            )}
            {arena.isPrivate && (
              <span className="border border-foreground/30 px-1.5 py-px font-mono text-[0.48rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Invite only
              </span>
            )}
          </span>
          <span className="mt-1 block font-mono text-[0.55rem] uppercase tracking-[0.1em] text-muted-foreground">
            {meta.join(" · ")}
          </span>
        </span>

        {/* Third column on wide screens; on narrow it wraps under the title,
            which is why the countdown repeats the verb ("closes in") rather
            than relying on the column header it no longer sits beneath. */}
        <span className="col-start-2 font-mono text-[0.58rem] tabular-nums uppercase tracking-[0.1em] text-foreground/70 md:col-start-3 md:text-right">
          {deadline(arena, status, now)}
        </span>
      </Link>
    </li>
  );
}

/**
 * Memoised: the list re-renders every minute to move the countdowns, and a row
 * whose arena and minute are unchanged has nothing new to draw.
 */
export const ArenaRow = memo(ArenaRowInner);

export default ArenaRow;
