"use client";

import Link from "next/link";
import Image from "next/image";
import { memo } from "react";
import { deriveArenaStatus, type ArenaStatus } from "@/lib/arena/status";
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
  DRAFT: "text-foreground/60",
  SCHEDULED: "text-foreground/70",
  // Open and running are the two a reader is hunting for, so they take the
  // accent. Everything past its build window steps back deliberately - it is
  // still legible, it just is not competing with what can be entered.
  REGISTRATION_OPEN: "text-orange-ink",
  IDEA_PHASE: "text-orange-ink",
  IMPLEMENTATION_PHASE: "text-orange-ink",
  UNDER_JUDGING: "text-foreground/60",
  COMPLETED: "text-foreground/60",
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

/** The creator's display name, and where their profile lives. */
function hostOf(arena: SerializedArenaListItem) {
  const c = arena.creator;
  if (!c) return null;
  const name = c.handle ? `@${c.handle}` : c.fullName;
  if (!name) return null;
  return {
    name,
    href: c.handle ? `/u/${c.handle}` : `/user/${c.id}`,
    avatarUrl: c.avatarUrl,
    initial: (c.fullName ?? c.handle ?? "?").trim().charAt(0).toUpperCase(),
  };
}

/**
 * PRD 7.1's tier badge - but only for the two tiers that mean something.
 *
 * COMMUNITY is every arena on the board (106 of 106 right now), and labelling
 * the universal case is noise: it takes width from the brief to tell a reader
 * something they already know. OFFICIAL and COMPANY are the exceptions, and
 * they carry real consequences - full XP and prize eligibility, where COMMUNITY
 * gets neither - so those are worth the space.
 */
function authorityBadge(authority: string): { label: string; className: string } | null {
  if (authority === "OFFICIAL") {
    return {
      label: "Official",
      className: "border-orange bg-orange text-[#0E0E0D]",
    };
  }
  if (authority === "COMPANY") {
    return {
      label: "Company",
      className: "border-foreground bg-foreground text-background",
    };
  }
  return null;
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
  const tier = authorityBadge(arena.authority);
  const host = hostOf(arena);

  /**
   * The domain and the prize carry the accent; everything else is ink.
   *
   * All six facts used to be one run of `text-muted-foreground` at 0.55rem -
   * #6A6860 on #FAF8F5, which is 5.3:1 and technically passes AA, but at
   * 8.8px uppercase with letter-spacing it reads as grey mush and nothing in
   * it is findable at a glance. The rest is darker and a shade larger now, and
   * the prize is pulled out in `--orange-ink` (#B0450A, 5.35:1 on the card),
   * because money is the loudest thing on any board. A domain chip used to sit
   * beside it; domains are gone from the product entirely.
   */
  const facts = [
    arena.difficulty.charAt(0) + arena.difficulty.slice(1).toLowerCase(),
    teamShape(arena),
    arena.locationType === "ONLINE" ? "__online__" : arena.locationName || "in person",
    entered === 1 ? "1 entered" : `${entered} entered`,
  ];

  return (
    // `group/row` and a stretched pseudo-element on the title link, rather than
    // wrapping the row in one anchor. The creator is a link of its own now, and
    // an anchor inside an anchor is invalid HTML that browsers repair by
    // dropping one of them - usually the inner one, which would be the creator.
    <li className="group/row relative grid grid-cols-[5.5rem_minmax(0,1fr)] items-baseline gap-x-5 gap-y-1 border-b border-foreground/12 px-4 py-3 transition-colors last:border-b-0 hover:bg-foreground/[0.04] has-[a:focus-visible]:outline has-[a:focus-visible]:outline-2 has-[a:focus-visible]:-outline-offset-2 has-[a:focus-visible]:outline-orange md:grid-cols-[6rem_minmax(0,1fr)_auto] md:px-5">
      <>
        <span
          className={`flex items-center gap-1.5 font-mono text-[0.62rem] font-bold uppercase tracking-[0.14em] ${STATUS_TONE[status]}`}
        >
          <span
            aria-hidden
            className={`h-1.5 w-1.5 shrink-0 ${
              status === "REGISTRATION_OPEN" ||
              status === "IDEA_PHASE" ||
              status === "IMPLEMENTATION_PHASE"
                ? "bg-orange"
                : "border border-foreground/40"
            }`}
          />
          {STATUS_LABEL[status]}
        </span>

        <span className="min-w-0">
          <span className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <Link
              href={`/arena/${arena.slug}`}
              className="font-display text-[1.12rem] leading-snug text-foreground transition-colors after:absolute after:inset-0 after:content-[''] group-hover/row:text-orange-ink focus-visible:outline-none"
            >
              {arena.title}
            </Link>
            {tier && (
              <span
                className={`border px-1.5 py-px font-mono text-[0.48rem] font-bold uppercase tracking-[0.14em] ${tier.className}`}
              >
                {tier.label}
              </span>
            )}
            {isHost && (
              <span className="border border-foreground/40 px-1.5 py-px font-mono text-[0.48rem] font-bold uppercase tracking-[0.14em] text-foreground/70">
                Yours
              </span>
            )}
            {isIn && !isHost && (
              <span className="border border-orange bg-orange px-1.5 py-px font-mono text-[0.48rem] font-bold uppercase tracking-[0.14em] text-[#0E0E0D]">
                You&rsquo;re in
              </span>
            )}
            {arena.isPrivate && (
              <span className="border border-foreground/40 px-1.5 py-px font-mono text-[0.48rem] font-bold uppercase tracking-[0.14em] text-foreground/70">
                Invite only
              </span>
            )}
          </span>
          <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[0.58rem] uppercase tracking-[0.1em] text-foreground/75">
            {/* First, not last: who is running it is the thing a reader
                recognises before anything else on this line. `relative z-10`
                lifts it above the title's stretched link so it stays its own
                click target. */}
            {host && (
              <>
                <Link
                  href={host.href}
                  className="relative z-10 flex items-center gap-1.5 font-bold text-foreground transition-colors hover:text-orange-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
                >
                  {host.avatarUrl ? (
                    <Image
                      src={host.avatarUrl}
                      alt=""
                      width={18}
                      height={18}
                      className="h-[18px] w-[18px] shrink-0 border border-foreground/20 object-cover"
                    />
                  ) : (
                    <span
                      aria-hidden
                      className="flex h-[18px] w-[18px] shrink-0 items-center justify-center border border-foreground/25 bg-secondary text-[0.5rem] font-bold text-foreground/70"
                    >
                      {host.initial}
                    </span>
                  )}
                  {host.name}
                </Link>
                <span aria-hidden className="text-foreground/30">
                  ·
                </span>
              </>
            )}
            {facts.map((fact, i) => (
              <span key={fact} className="flex items-center gap-2">
                {i > 0 && (
                  <span aria-hidden className="text-foreground/30">
                    ·
                  </span>
                )}
                {fact === "__online__" ? (
                  <span className="flex items-center gap-1.5">
                    <span
                      aria-hidden
                      className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500"
                    />
                    online
                  </span>
                ) : (
                  fact
                )}
              </span>
            ))}
            {prize && (
              <span className="flex items-center gap-2">
                <span aria-hidden className="text-foreground/30">
                  ·
                </span>
                <span className="font-bold text-orange-ink">{prize}</span>
              </span>
            )}
          </span>
        </span>

        {/* Third column on wide screens; on narrow it wraps under the title,
            which is why the countdown repeats the verb ("closes in") rather
            than relying on the column header it no longer sits beneath. */}
        <span className="col-start-2 font-mono text-[0.62rem] font-bold tabular-nums uppercase tracking-[0.1em] text-foreground md:col-start-3 md:text-right">
          {deadline(arena, status, now)}
        </span>
      </>
    </li>
  );
}

/**
 * Memoised: the list re-renders every minute to move the countdowns, and a row
 * whose arena and minute are unchanged has nothing new to draw.
 */
export const ArenaRow = memo(ArenaRowInner);

export default ArenaRow;

/**
 * The row's own outline, so a load does not resize the page.
 *
 * The list previously just dimmed itself to 60% while fetching, which does
 * nothing on a first load when there is nothing to dim - and any generic
 * skeleton would have been the wrong height, so the content would jump when it
 * arrived. This mirrors the real grid exactly: same columns, same padding,
 * same three text runs at the same sizes, so the swap is only a change of
 * colour.
 */
export function ArenaRowSkeleton() {
  return (
    <li
      aria-hidden
      className="grid animate-pulse grid-cols-[5.5rem_minmax(0,1fr)] items-baseline gap-x-5 gap-y-1 border-b border-foreground/12 px-4 py-3 last:border-b-0 md:grid-cols-[6rem_minmax(0,1fr)_auto] md:px-5"
    >
      <span className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 shrink-0 bg-foreground/15" />
        <span className="h-[0.62rem] w-12 bg-foreground/15" />
      </span>

      <span className="min-w-0">
        <span className="block h-[1.12rem] w-2/3 bg-foreground/15" />
        <span className="mt-2 block h-[0.58rem] w-5/6 bg-foreground/10" />
      </span>

      <span className="col-start-2 h-[0.62rem] w-24 bg-foreground/15 md:col-start-3 md:justify-self-end" />
    </li>
  );
}
