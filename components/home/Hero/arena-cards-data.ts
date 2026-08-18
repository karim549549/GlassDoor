import { buildArenaSlug } from "@/lib/arena-slug";
import { deriveArenaStatus } from "@/lib/arena/status";
import type { ArenaListItem } from "@/lib/arena/types";

export interface ArenaCardData {
  id: string;
  tag: string;
  title: string;
  description: string;
  tech: string[];
  timeLabel: string;
  timeValue: string;
  isLive: boolean;
  /** Where the card goes when clicked. Null for the placeholder cards. */
  href: string | null;
  /** Shown in the block beneath the docked card. */
  trackLabel: string;
  trackInitials: string;
}

/**
 * Shown only when the board is genuinely empty, so the section still has a
 * composition to hold. These are placeholders and deliberately link nowhere -
 * a card that looks real and goes nowhere is worse than one that does not
 * pretend.
 */
export const ARENA_CARDS: ArenaCardData[] = [
  {
    id: "card-database",
    tag: "Database Speedrun",
    title: "MIGRATE 10M RECORDS LIVE",
    description: "Optimize migration scripts to sync a database with zero downtime under load.",
    tech: ["POSTGRES", "PYTHON", "PRISMA"],
    timeLabel: "EXAMPLE",
    timeValue: "—",
    isLive: false,
    href: null,
    trackLabel: "Backend & Cloud",
    trackInitials: "BC",
  },
  {
    id: "card-devops",
    tag: "DevOps Sprint",
    title: "SCALE WEBSOCKET CLUSTER TO 10K",
    description: "Deploy and load-test a distributed messaging server with high availability.",
    tech: ["REDIS", "GO", "DOCKER"],
    timeLabel: "EXAMPLE",
    timeValue: "—",
    isLive: false,
    href: null,
    trackLabel: "DevOps & Mesh",
    trackInitials: "DM",
  },
  {
    id: "card-frontend",
    tag: "Arena Challenge",
    title: "BUILD A REAL-TIME DEVELOPER MAP",
    description: "Create an interactive map tracking live developer profiles and statuses during a 6-hour sprint.",
    tech: ["REACT", "NODE.JS", "WEBSOCKETS"],
    timeLabel: "EXAMPLE",
    timeValue: "—",
    isLive: false,
    href: null,
    trackLabel: "Frontend",
    trackInitials: "FE",
  },
];

/** "3 DAYS" / "24 HOURS" / "18 MIN", or null once the target has passed. */
function until(target: Date, now: Date): string | null {
  const ms = target.getTime() - now.getTime();
  if (ms <= 0) return null;

  const minutes = Math.floor(ms / 60_000);
  if (minutes < 60) return `${Math.max(1, minutes)} MIN`;

  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours} ${hours === 1 ? "HOUR" : "HOURS"}`;

  return `${Math.floor(hours / 24)} DAYS`;
}

function initialsOf(label: string): string {
  const words = label.replace(/[^A-Za-z ]/g, " ").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "DA";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

/**
 * Maps a real arena onto the card design.
 *
 * The stack previously rendered three hardcoded cards that linked nowhere while
 * the database held a hundred real arenas, so the first thing a visitor clicked
 * was fiction. The visual design is unchanged; only the content is now true.
 *
 * `now` is passed in rather than read here, for the same reason
 * `deriveArenaStatus` takes it: an arena sitting on a phase boundary must not
 * derive one status on the server and a different one in the browser.
 */
export function toArenaCardData(arena: ArenaListItem, now: Date): ArenaCardData {
  const status = deriveArenaStatus(arena, now);

  let timeLabel = "STATUS";
  let timeValue = "—";
  let isLive = false;

  switch (status) {
    case "REGISTRATION_OPEN": {
      timeLabel = "ENTRY CLOSES IN";
      timeValue = until(arena.registrationEnd, now) ?? "SOON";
      break;
    }
    case "SCHEDULED": {
      timeLabel = "OPENS IN";
      timeValue = until(arena.registrationStart, now) ?? "SOON";
      break;
    }
    case "IDEA_PHASE": {
      timeLabel = "PLANNING ENDS IN";
      timeValue = until(arena.ideaPhaseEnd, now) ?? "SOON";
      break;
    }
    case "IMPLEMENTATION_PHASE": {
      timeLabel = "TIME REGISTRY";
      timeValue = until(arena.implPhaseEnd, now) ?? "ENDING";
      isLive = true;
      break;
    }
    case "UNDER_JUDGING": {
      timeLabel = "STATUS";
      timeValue = "BEING JUDGED";
      break;
    }
    case "COMPLETED": {
      timeLabel = "STATUS";
      timeValue = "RESULTS OUT";
      break;
    }
    default: {
      timeLabel = "STATUS";
      timeValue = status.replace(/_/g, " ");
    }
  }

  // Tags and domains are both gone from the product, so the shape of the entry
  // is what is left to label a card with - and it is more honest than either
  // was: it is set by the host and it is true of every arena.
  const trackLabel = arena.isTeam ? "Team Arena" : "Solo Arena";

  return {
    id: arena.id,
    tag: trackLabel,
    title: arena.title,
    description: arena.description ?? "",
    // The card's third line used to list an arena's tags. With tags gone the
    // honest replacement is the difficulty, which every arena has.
    tech: [arena.difficulty.replace(/_/g, " ")],
    timeLabel,
    timeValue,
    isLive,
    href: `/arena/${buildArenaSlug(arena.title, arena.id)}`,
    trackLabel,
    trackInitials: initialsOf(trackLabel),
  };
}
