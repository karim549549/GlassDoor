"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Users, Trophy, ExternalLink } from "lucide-react";
import { buildArenaSlug } from "@/lib/arena-slug";
import type { SerializedArenaListItem } from "@/lib/arena/types";

import { GoldenTicketTag } from "@/components/ui/GoldenTicketTag";

export interface ArenaCardProps {
  arena: SerializedArenaListItem;
}

/**
 * Data needed to render a card's visual body. A subset of SerializedArenaListItem
 * rather than the full type, since the create-flow's live preview renders this same
 * body for an in-progress form that has no persisted id/timestamps yet.
 */
export interface ArenaCardBodyData {
  title: string;
  description: string;
  coverImageUrl?: string | null;
  status: string;
  isPrivate: boolean;
  isTeam: boolean;
  minTeamSize: number;
  maxTeamSize: number;
  requireGithubUrl?: boolean;
  requireFigmaUrl?: boolean;
  tags?: { tag: { id: string; name: string; slug: string; color?: string | null } }[];
}

export interface ArenaCardBodyProps {
  arena: ArenaCardBodyData;
  /** Precomputed "time remaining" label; omit to hide it (e.g. in a live preview). */
  timeLeft?: string;
  /** ISO date string shown in the footer; shows "PENDING DATE" when omitted. */
  footerDate?: string;
}

function getStatusColor(status: string) {
  switch (status) {
    case "IMPLEMENTATION_PHASE":
    case "IDEA_PHASE":
      return "bg-green-100 text-green-900 border-green-300";
    case "REGISTRATION_OPEN":
      return "bg-blue-100 text-blue-900 border-blue-300";
    default:
      return "bg-neutral-100 text-neutral-600 border-neutral-300";
  }
}

/** Pure presentational card visuals, shared by the real ArenaCard and the create-flow live preview. */
export function ArenaCardBody({ arena, timeLeft, footerDate }: ArenaCardBodyProps) {
  const formattedStatus = arena.status.replace("_", " ");

  return (
    <div className="flex flex-col gap-3">

      {/* Cover Image Block (Enforced 4:1 crop ratio for layout parity) */}
      <div className="w-full aspect-[4/1] relative border border-[#0E0E0D]/10 bg-[#0E0E0D]/5 overflow-hidden shrink-0 flex items-center justify-center">
        {arena.coverImageUrl ? (
          <Image
            src={arena.coverImageUrl}
            alt={arena.title}
            fill
            sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-2 text-center select-none text-[#0E0E0D]/20">
            <Trophy className="h-6 w-6 stroke-[1.25]" />
            <span className="font-mono text-[0.38rem] tracking-[0.2em] uppercase mt-1">NO COVER</span>
          </div>
        )}

        {/* Cover Overlay status tag */}
        <div className="absolute top-1.5 left-1.5 flex flex-wrap gap-1">
          <span className="font-mono text-[0.38rem] font-bold uppercase tracking-wider bg-orange text-white px-1 py-0.5 border border-[#0E0E0D]">
            {arena.isPrivate ? "INVITE ONLY" : "PUBLIC"}
          </span>
        </div>
      </div>

      {/* Card Main Info */}
      <div className="min-w-0 flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`font-mono text-[0.42rem] font-bold uppercase tracking-widest px-1 py-0.5 border ${getStatusColor(arena.status)}`}>
            [{formattedStatus}]
          </span>
          {timeLeft && (
            <span className="font-mono text-[0.42rem] font-bold uppercase tracking-widest text-[#0E0E0D]/60">
              {timeLeft}
            </span>
          )}
        </div>

        <h3 className="font-display italic text-base leading-tight text-[#0E0E0D] uppercase group-hover:text-accent transition-colors duration-200 truncate">
          {arena.title}
        </h3>

        <p className="font-sans text-[0.62rem] text-muted-foreground line-clamp-2 normal-case leading-normal">
          {arena.description}
        </p>

        {/* Golden Ticket Badges */}
        {arena.tags && arena.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {arena.tags.slice(0, 3).map((item) => (
              <GoldenTicketTag
                key={item.tag.id}
                label={item.tag.name}
                variant={(item.tag.color as "golden" | "emerald" | "cyan" | "purple" | "orange" | "ruby" | "outline") || "golden"}
                size="sm"
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer Details */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 mt-1 border-t border-dashed border-[#0E0E0D]/10">
        <div className="flex items-center gap-2.5 font-mono text-[0.48rem] uppercase tracking-wider text-muted-foreground">
          <span className="flex items-center gap-0.5">
            <Users className="h-2.5 w-2.5" /> {arena.isTeam ? `Squad: ${arena.minTeamSize}-${arena.maxTeamSize} Devs` : "Solo Arena"}
          </span>
          <span className="flex items-center gap-0.5">
            <Calendar className="h-2.5 w-2.5" /> {footerDate ? new Date(footerDate).toLocaleDateString() : "PENDING DATE"}
          </span>
        </div>

        <div className="flex gap-1 items-center">
          {arena.requireGithubUrl && (
            <span className="font-mono text-[0.4rem] font-bold text-[#0E0E0D] bg-secondary border border-border px-1 py-0.5">
              [GITHUB]
            </span>
          )}
          {arena.requireFigmaUrl && (
            <span className="font-mono text-[0.4rem] font-bold text-[#0E0E0D] bg-secondary border border-border px-1 py-0.5">
              [FIGMA]
            </span>
          )}
          <span className="font-mono text-[0.45rem] text-accent font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 ml-1">
            ENTER <ExternalLink className="h-1.5 w-1.5" />
          </span>
        </div>
      </div>

    </div>
  );
}

function ArenaCardImpl({ arena }: ArenaCardProps) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      let targetTime = 0;
      let label = "";

      if (arena.status === "REGISTRATION_OPEN") {
        targetTime = new Date(arena.registrationEnd).getTime();
        label = "Reg Closes In";
      } else if (arena.status === "IMPLEMENTATION_PHASE" || arena.status === "IDEA_PHASE") {
        targetTime = new Date(arena.implPhaseEnd).getTime();
        label = "Ends In";
      } else {
        setTimeLeft("COMPLETED");
        return;
      }

      const difference = targetTime - now;
      if (difference <= 0) {
        setTimeLeft("CLOSED");
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeLeft(`${label}: ${days}d ${hours}h`);
      } else {
        setTimeLeft(`${label}: ${hours}h ${minutes}m`);
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 60000);
    return () => clearInterval(interval);
  }, [arena]);

  return (
    <Link
      href={`/arena/${buildArenaSlug(arena.title, arena.id)}`}
      className="group block bg-white text-[#0E0E0D] border-2 border-[#0E0E0D] p-4 relative shadow-[4px_4px_0px_0px_#0E0E0D] hover:shadow-[6px_6px_0px_0px_#0E0E0D] hover:-translate-y-0.5 transition-all duration-200"
    >
      <ArenaCardBody arena={arena} timeLeft={timeLeft} footerDate={arena.implPhaseStart} />
    </Link>
  );
}

/** Memoized: re-rendering every card on unrelated list-state changes is wasted work. */
export const ArenaCard = React.memo(ArenaCardImpl);

export function ArenaCardSkeleton() {
  return (
    <div className="block bg-white text-[#0E0E0D] border-2 border-[#0E0E0D] p-4 relative shadow-[4px_4px_0px_0px_#0E0E0D] animate-pulse">
      <div className="flex flex-col gap-3">
        {/* Cover Image Block Placeholder */}
        <div className="w-full aspect-[4/1] bg-[#0E0E0D]/10 border border-[#0E0E0D]/10" />

        {/* Card Main Info Placeholder */}
        <div className="min-w-0 flex flex-col gap-2">
          {/* Status Tag Placeholder */}
          <div className="h-4 w-20 bg-[#0E0E0D]/10 border border-[#0E0E0D]/10" />
          
          {/* Title Placeholder */}
          <div className="h-6 w-3/4 bg-[#0E0E0D]/10" />

          {/* Description Placeholder */}
          <div className="space-y-1.5 mt-1">
            <div className="h-3 w-full bg-[#0E0E0D]/10" />
            <div className="h-3 w-5/6 bg-[#0E0E0D]/10" />
          </div>
        </div>

        {/* Footer Details Placeholder */}
        <div className="flex items-center justify-between pt-2.5 mt-1 border-t border-dashed border-[#0E0E0D]/10">
          <div className="flex gap-2">
            <div className="h-3.5 w-16 bg-[#0E0E0D]/10" />
            <div className="h-3.5 w-16 bg-[#0E0E0D]/10" />
          </div>
          <div className="h-3.5 w-12 bg-[#0E0E0D]/10" />
        </div>
      </div>
    </div>
  );
}

export default ArenaCard;
