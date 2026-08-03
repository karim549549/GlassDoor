"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Camera, ShieldCheck, UserCheck, LogOut, Flag, ArrowRight } from "lucide-react";
import { ArenaCarousel } from "./ArenaCarousel";

interface ArenaDetailHeroProps {
  id: string;
  title: string;
  description: string;
  coverImageUrl?: string | null;
  additionalImages?: string[];
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
  creator: {
    id: string;
    fullName: string | null;
    handle: string;
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

  // Actor & Action props
  isGuest: boolean;
  isJoined: boolean;
  isHost: boolean;
  onJoin: () => void;
  onQuit: () => void;
  onResign: () => void;
  onLoginRedirect: () => void;
  onRequestPrivateJoin: (code?: string) => void;
  onEditCoverClick?: () => void;
}

export function ArenaDetailHero({
  title,
  description,
  coverImageUrl,
  additionalImages = [],
  isPrivate,
  isTeam,
  minTeamSize,
  maxTeamSize,
  maxParticipants,
  totalParticipants,
  status,
  inviteCode,
  creator,
  tags,
  isGuest,
  isJoined,
  isHost,
  onJoin,
  onQuit,
  onResign,
  onLoginRedirect,
  onRequestPrivateJoin,
  onEditCoverClick,
}: ArenaDetailHeroProps) {
  const [inputCode, setInputCode] = useState("");
  const [codeError, setCodeError] = useState("");

  const isFull = maxParticipants !== null && totalParticipants >= maxParticipants;
  const isCompleted = status === "COMPLETED";
  const isRegistrationPhase = status === "REGISTRATION_OPEN" || status === "DRAFT";

  const handlePrivateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteCode && inputCode.trim() !== inviteCode.trim()) {
      setCodeError("Invalid code.");
      return;
    }
    setCodeError("");
    onRequestPrivateJoin(inputCode);
  };

  return (
    <div className="relative w-full bg-[#0E0E0D] text-[#F1EFE9] border-b-4 border-double border-[#F1EFE9]/25 pt-20 pb-12 px-6 md:px-12 overflow-hidden">
      {/* BACKGROUND COVER IMAGE LAYER (Same design aesthetic as User Profile Header) */}
      <div className="absolute inset-0 z-0">
        {coverImageUrl ? (
          <Image
            src={coverImageUrl}
            alt={`${title} Cover`}
            fill
            sizes="100vw"
            priority
            className="object-cover opacity-40 mix-blend-luminosity"
          />
        ) : (
          <div className="w-full h-full bg-[#0E0E0D] bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]" />
        )}
        {/* Dark subtle gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E0D] via-[#0E0E0D]/80 to-[#0E0E0D]/50 z-10" />
      </div>

      {/* Edit Cover Banner Button (Host Only) */}
      {isHost && (
        <button
          onClick={onEditCoverClick}
          className="absolute top-20 right-6 z-30 p-2 bg-[#F1EFE9] text-[#0E0E0D] border border-[#0E0E0D] font-mono text-[0.55rem] uppercase tracking-wider font-bold hover:bg-[#0E0E0D] hover:text-[#F1EFE9] transition-colors flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(14,14,13,0.3)] cursor-pointer"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>EDIT COVER</span>
        </button>
      )}

      {/* HERO MAIN CONTAINER */}
      <div className="max-w-7xl mx-auto relative z-20 space-y-6">
        {/* Top Header: Clickable Breadcrumbs (Left) & Header Badges (Right - NO EMOJIS) */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/15 pb-4">
          <nav aria-label="Breadcrumb" className="font-mono text-[0.58rem] tracking-widest uppercase font-bold flex flex-wrap items-center gap-1.5 text-orange">
            <Link href="/" className="hover:underline hover:text-orange/80 transition-colors">
              HOME
            </Link>
            <span className="text-white/40">&gt;</span>
            <Link href="/arena" className="hover:underline hover:text-orange/80 transition-colors">
              ARENAS
            </Link>
            <span className="text-white/40">&gt;</span>
            <span className="text-[#F1EFE9] truncate max-w-xs">{title}</span>
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

            <span className="px-2 py-0.5 bg-white/10 text-[#F1EFE9] border border-white/20">
              {isTeam ? `TEAM (${minTeamSize}-${maxTeamSize})` : "SOLO"}
            </span>

            <span className="px-2 py-0.5 bg-orange/20 text-orange border border-orange/40">
              {status.replace(/_/g, " ")}
            </span>

            {/* Capacity Pill on Right Side */}
            <span className="px-2 py-0.5 bg-white/10 text-[#F1EFE9] border border-white/20">
              {totalParticipants} / {maxParticipants ?? "∞"} PLACES JOINED
            </span>
          </div>
        </div>

        {/* HERO BODY: Left Title & Description (60%) vs Right Carousel & Join Action (40%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
          {/* Left Column (7/12 = 58%): Title, Organizer, Description */}
          <div className="lg:col-span-7 space-y-4">
            <h1 className="font-display italic text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-[#F1EFE9] leading-[1.05]">
              {title}
            </h1>

            {/* Sleek 1-Line Organizer Pill */}
            <div className="flex items-center gap-2 font-mono text-[0.6rem] text-[#F1EFE9]/70">
              <span>Organized by</span>
              <div className="relative w-4 h-4 rounded-full overflow-hidden bg-orange/20 border border-orange">
                {creator.avatarUrl ? (
                  <Image src={creator.avatarUrl} alt={creator.handle} fill className="object-cover" />
                ) : (
                  <span className="w-full h-full flex items-center justify-center font-bold text-[0.4rem]">
                    {creator.handle.substring(0, 1).toUpperCase()}
                  </span>
                )}
              </div>
              <Link
                href={`/profile/${creator.handle}`}
                className="font-bold text-orange hover:underline flex items-center gap-0.5"
              >
                <span>@{creator.handle}</span>
                <ShieldCheck className="w-3 h-3 text-orange" />
              </Link>
            </div>

            <p className="font-mono text-xs text-[#F1EFE9]/75 max-w-2xl leading-relaxed">
              {description}
            </p>

            {/* Tags badges */}
            {tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {tags.map((t) => (
                  <span
                    key={t.tag.id}
                    className="font-mono text-[0.52rem] uppercase tracking-wider px-2 py-0.5 bg-white/10 border border-white/15 text-[#F1EFE9]/90 font-bold"
                  >
                    #{t.tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right Column (5/12 = 42%): Additional Images Carousel + Action Button */}
          <div className="lg:col-span-5 space-y-4">
            {/* Additional Screenshots Auto-Playing Carousel */}
            {additionalImages.length > 0 && (
              <ArenaCarousel images={additionalImages} title={title} />
            )}

            {/* COMPACT ACTION BUTTON DIRECTLY UNDER CAROUSEL */}
            <div className="w-full">
              {isHost ? (
                <button className="w-full py-2.5 px-4 bg-[#0E0E0D] hover:bg-[#1f1f1d] text-[#F1EFE9] font-mono text-[0.65rem] uppercase tracking-[0.2em] font-bold border-2 border-white/30">
                  EDIT ARENA
                </button>
              ) : isJoined ? (
                <div className="space-y-2">
                  <div className="p-2 bg-emerald-950/60 border border-emerald-500/50 text-center font-mono text-[0.55rem] text-emerald-300 uppercase font-bold flex items-center justify-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>YOU ARE PARTICIPATING</span>
                  </div>

                  {!isCompleted && (
                    isRegistrationPhase ? (
                      <button
                        onClick={onQuit}
                        className="w-full py-2 px-3 bg-red-950/60 hover:bg-red-900/60 text-red-300 font-mono text-[0.6rem] uppercase tracking-widest font-bold border border-red-500/50 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>QUIT ARENA</span>
                      </button>
                    ) : (
                      <button
                        onClick={onResign}
                        className="w-full py-2 px-3 bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 font-mono text-[0.6rem] uppercase tracking-widest font-bold border border-amber-500/50 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Flag className="w-3.5 h-3.5" />
                        <span>RESIGN FROM ARENA</span>
                      </button>
                    )
                  )}
                </div>
              ) : isFull ? (
                <button
                  disabled
                  className="w-full py-2.5 px-4 bg-gray-900 text-gray-500 font-mono text-[0.6rem] uppercase tracking-widest font-bold border border-gray-700 cursor-not-allowed"
                >
                  ARENA FULL
                </button>
              ) : isPrivate && !isGuest ? (
                <form onSubmit={handlePrivateSubmit} className="space-y-2">
                  <input
                    type="text"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    placeholder="ENTER INVITE CODE..."
                    className="w-full px-3 py-1.5 border-2 border-white/30 font-mono text-xs uppercase bg-[#0E0E0D] text-white focus:outline-none focus:ring-2 focus:ring-orange"
                  />
                  {codeError && (
                    <p className="font-mono text-[0.5rem] text-red-400 font-bold uppercase">{codeError}</p>
                  )}
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-orange text-white font-mono text-[0.65rem] uppercase tracking-[0.2em] font-bold border-2 border-white/30"
                  >
                    JOIN
                  </button>
                </form>
              ) : (
                /* SINGLE COMPACT "JOIN" ACTION BUTTON */
                <button
                  onClick={isGuest ? onLoginRedirect : onJoin}
                  className="w-full py-3 px-4 bg-orange hover:bg-orange/90 text-white font-mono text-[0.7rem] uppercase tracking-[0.25em] font-bold border-2 border-white/30 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex items-center justify-center gap-1.5 group"
                >
                  <span>JOIN</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ArenaDetailHero;
