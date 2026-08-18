"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Navigation, ExternalLink } from "lucide-react";
import { ArenaActionButtons } from "./ArenaActionButtons";

interface ArenaDetailHeroProps {
  id: string;
  title: string;
  description: string;
  isPrivate: boolean;
  isTeam: boolean;
  minTeamSize: number;
  maxTeamSize: number;
  maxParticipants: number | null;
  totalParticipants: number;
  status: string;
  registrationStart: string;
  registrationEnd: string;
  inviteCode?: string | null;
  locationType?: "ONLINE" | "IN_PERSON" | "HYBRID";
  locationName?: string | null;
  venueName?: string | null;
  googleMapsUrl?: string | null;
  creator: {
    id: string;
    fullName: string | null;
    /** Nullable in the database - User.handle is optional. */
    handle: string | null;
    avatarUrl: string | null;
  };
  tags: {
    tag: {
      id: string;
      name: string;
      slug: string;
      color?: string | null;
    };
  }[];

  mode?: "details" | "matchmaking";

  // Actor & Action props
  isGuest?: boolean;
  isJoined?: boolean;
  isHost?: boolean;
  onJoin?: () => void;
  onQuit?: () => void;
  onResign?: () => void;
  onLoginRedirect?: () => void;
  onRequestPrivateJoin?: (code?: string) => void;
}

export function ArenaDetailHero({
  id,
  title,
  description,
  isPrivate,
  isTeam,
  minTeamSize,
  maxTeamSize,
  maxParticipants,
  totalParticipants,
  status,
  inviteCode,
  // No fabricated fallbacks: these previously defaulted to IN_PERSON at a
  // hardcoded Cairo venue with a hardcoded maps link, so every arena - ONLINE
  // ones included - advertised a physical location it had no data for.
  locationType = "ONLINE",
  locationName,
  venueName = null,
  googleMapsUrl = null,
  creator,
  tags,
  mode = "details",
  isGuest = false,
  isJoined = false,
  isHost = false,
  onJoin = () => {},
  onQuit = () => {},
  onResign = () => {},
  onLoginRedirect = () => {},
  onRequestPrivateJoin = () => {},
}: ArenaDetailHeroProps) {
  const isFull = maxParticipants !== null && totalParticipants >= maxParticipants;
  const isCompleted = status === "COMPLETED";
  const isRegistrationPhase = status === "REGISTRATION_OPEN" || status === "DRAFT";
  const isInPerson = locationType === "IN_PERSON" || locationType === "HYBRID";
  /** Handle is optional on User, so fall back to the display name, then a generic label. */
  const organizerLabel = creator.handle ?? creator.fullName ?? "Host";

  return (
    <div className="relative w-full bg-foreground text-background border-b-4 border-double border-background/25 pt-20 pb-12 px-6 md:px-12 overflow-hidden">
      {/* The blueprint grid this used to fall back to when no cover was set.
          It is now the only treatment, which is why the gradient overlay went
          with the image - there is nothing left to darken for legibility. */}
      <div
        aria-hidden
        className="absolute inset-0 z-0 bg-foreground bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]"
      />


      {/* HERO MAIN CONTAINER */}
      <div className="max-w-7xl mx-auto relative z-20 space-y-6">
        {/* Top Header: Clickable Breadcrumbs (Left) & Header Badges (Right - NO EMOJIS) */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/15 pb-4">
          <nav aria-label="Breadcrumb" className="font-mono text-[0.58rem] tracking-widest uppercase font-bold flex flex-wrap items-center gap-1.5 text-orange">
            <Link href="/" className="hover:underline hover:text-orange/80 transition-colors cursor-pointer">
              HOME
            </Link>
            <span className="text-white/40">&gt;</span>
            <Link href="/arena" className="hover:underline hover:text-orange/80 transition-colors cursor-pointer">
              ARENAS
            </Link>
            <span className="text-white/40">&gt;</span>
            {mode === "matchmaking" ? (
              <>
                <Link href={`/arena/${id}`} className="hover:underline hover:text-orange/80 transition-colors cursor-pointer">
                  {title}
                </Link>
                <span className="text-white/40">&gt;</span>
                <span className="text-background">MATCHMAKING & SQUAD LOBBIES</span>
              </>
            ) : (
              <span className="text-background truncate max-w-xs">{title}</span>
            )}
          </nav>

          {/* Header Badges Row (No Emojis) */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-[0.55rem] font-bold uppercase tracking-wider">
            <span
              className={`px-2 py-0.5 border ${
                isPrivate
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
              }`}
            >
              {isPrivate ? "PRIVATE" : "PUBLIC"}
            </span>

            <span className="px-2 py-0.5 bg-white/10 text-background border border-white/20">
              {isTeam ? `TEAM (${minTeamSize}-${maxTeamSize})` : "SOLO"}
            </span>

            <span className="px-2 py-0.5 bg-orange/20 text-orange border border-orange/40">
              {status.replace(/_/g, " ")}
            </span>

            {/* Capacity Pill on Right Side */}
            <span className="px-2 py-0.5 bg-white/10 text-background border border-white/20">
              {totalParticipants} / {maxParticipants ?? "∞"} PLACES JOINED
            </span>
          </div>
        </div>

        {/* HERO BODY: Left Title & Description (60%) vs Right Carousel & Action (40%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
          {/* Left Column (7/12 = 58%): Title, Organizer, Description & Inline Location */}
          <div className="lg:col-span-7 space-y-4">
            <h1 className="font-display italic text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-background leading-[1.05]">
              {title}
            </h1>

            {/* Description — 2-line clamp. "Read More" scrolls to full description below. No CLS. */}
            <div className="relative max-w-2xl">
              <p className="font-mono text-xs text-background/75 leading-relaxed line-clamp-2">
                {description}
              </p>
              <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-foreground to-transparent pointer-events-none" />
              <a
                href="#arena-description"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("arena-description")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="mt-1.5 inline-block font-mono text-[0.55rem] uppercase tracking-widest font-bold text-orange hover:text-orange/70 transition-colors cursor-pointer"
              >
                READ MORE ↓
              </a>
            </div>

            {/* Sleek 1-Line Organizer Metadata Pill */}
            <div className="flex flex-wrap items-center gap-3 font-mono text-[0.62rem] text-background/70 pt-1">
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/15 px-2.5 py-1">
                <span className="text-background/50">Organized by</span>
                <div className="relative w-4 h-4 rounded-full overflow-hidden bg-orange/20 border border-orange">
                  {creator.avatarUrl ? (
                    <Image src={creator.avatarUrl} alt={organizerLabel} fill className="object-cover" />
                  ) : (
                    <span className="w-full h-full flex items-center justify-center font-bold text-[0.4rem]">
                      {organizerLabel.substring(0, 1).toUpperCase()}
                    </span>
                  )}
                </div>
                {/* A user without a handle has no profile URL to link to - render
                    plain text rather than a link to /profile/null. */}
                {creator.handle ? (
                  <Link
                    href={`/profile/${creator.handle}`}
                    className="font-bold text-orange hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>@{creator.handle}</span>
                    <ShieldCheck className="w-3 h-3 text-orange" />
                  </Link>
                ) : (
                  <span className="font-bold text-orange flex items-center gap-0.5">
                    <span>{organizerLabel}</span>
                    <ShieldCheck className="w-3 h-3 text-orange" />
                  </span>
                )}
              </div>

              {tags.length > 0 && (
                <>
                  <span className="text-white/20">•</span>
                  <div className="flex items-center gap-1">
                    {tags.map((t) => (
                      <span key={t.tag.id} className="text-background/80 font-bold uppercase">
                        #{t.tag.name}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* LOCATION BADGE & OPEN IN GOOGLE MAPS BUTTON UNDER IT */}
            <div className="pt-2 space-y-2 font-mono text-[0.6rem]">
              {isInPerson ? (
                <div className="space-y-2">
                  <div className="inline-block px-2.5 py-1 bg-white/10 text-background border border-white/20 font-bold uppercase tracking-wider">
                    IN-PERSON @ {locationName || venueName || "VENUE LOCATION"}
                  </div>

                  {googleMapsUrl && (
                    <div>
                      <a
                        href={googleMapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 py-2 px-3.5 bg-white text-foreground hover:bg-foreground hover:text-background font-bold uppercase tracking-widest border-2 border-white/40 hover:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] transition-colors cursor-pointer"
                      >
                        <Navigation className="w-3.5 h-3.5 text-orange" />
                        <span>OPEN IN GOOGLE MAPS</span>
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <span className="inline-block px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold uppercase tracking-wider">
                  ONLINE VIRTUAL EVENT
                </span>
              )}
            </div>
          </div>

          {/* Right Column (5/12 = 42%): Contextual Action */}
          <div className="lg:col-span-5 space-y-4">

            <div className="w-full">
              {mode === "matchmaking" ? (
                <div className="w-full py-3 px-4 bg-foreground/80 text-background/80 font-mono text-[0.62rem] uppercase tracking-[0.2em] font-bold border-2 border-white/20 flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>SQUAD MATCHMAKING HUB ACTIVE</span>
                </div>
              ) : (
                <ArenaActionButtons
                  isGuest={isGuest}
                  isJoined={isJoined}
                  isHost={isHost}
                  isFull={isFull}
                  isCompleted={isCompleted}
                  isRegistrationPhase={isRegistrationPhase}
                  isPrivate={isPrivate}
                  isTeam={isTeam}
                  arenaSlug={id}
                  inviteCode={inviteCode}
                  onJoin={onJoin}
                  onQuit={onQuit}
                  onResign={onResign}
                  onLoginRedirect={onLoginRedirect}
                  onRequestPrivateJoin={onRequestPrivateJoin}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ArenaDetailHero;
