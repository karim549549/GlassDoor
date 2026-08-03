"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Users, Calendar, ShieldCheck, Tag as TagIcon } from "lucide-react";
import { BackgroundGrid } from "@/components/ui/BackgroundGrid";
import { ArenaCoverGallery } from "./ArenaCoverGallery";
import { ArenaActionCard } from "./ArenaActionCard";

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
  registrationEnd,
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
}: ArenaDetailHeroProps) {
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="w-full bg-[#0E0E0D] text-[#F1EFE9] border-b-4 border-double border-[#F1EFE9]/25 pt-20 pb-10 px-6 md:px-12 relative overflow-hidden">
      <BackgroundGrid opacity={0.06} patternSize={28} />

      <div className="max-w-7xl mx-auto relative z-10 space-y-6">
        {/* Top Breadcrumb & Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F1EFE9]/10 pb-4">
          <span className="font-mono text-[0.58rem] text-orange tracking-widest uppercase font-bold">
            Home &gt; Arenas &gt; <span className="text-[#F1EFE9]">{title}</span>
          </span>

          <div className="flex items-center gap-2">
            <span
              className={`font-mono text-[0.55rem] font-bold uppercase tracking-wider px-2 py-0.5 border ${
                isPrivate
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
              }`}
            >
              {isPrivate ? "🔒 PRIVATE ARENA" : "🌐 PUBLIC ARENA"}
            </span>

            <span className="font-mono text-[0.55rem] font-bold uppercase tracking-wider px-2 py-0.5 bg-white/10 text-[#F1EFE9] border border-white/20">
              {isTeam ? `👥 TEAM (${minTeamSize}-${maxTeamSize})` : "👤 SOLO"}
            </span>

            <span className="font-mono text-[0.55rem] font-bold uppercase tracking-wider px-2 py-0.5 bg-orange/20 text-orange border border-orange/40">
              ⚡ {status.replace(/_/g, " ")}
            </span>
          </div>
        </div>

        {/* Title & Compact Organizer Line */}
        <div className="space-y-3">
          <h1 className="font-display italic text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-[#F1EFE9] leading-[1.05]">
            {title}
          </h1>

          <p className="font-mono text-xs text-[#F1EFE9]/70 max-w-3xl leading-relaxed">
            {description}
          </p>

          {/* SLEEK 1-LINE ORGANIZER METADATA PILL (De-emphasized Host) */}
          <div className="flex flex-wrap items-center gap-3 font-mono text-[0.62rem] text-[#F1EFE9]/70 pt-1">
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/15 px-2.5 py-1">
              <span className="text-[#F1EFE9]/50">Organized by</span>
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

            <span className="text-white/20">•</span>

            <div className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-orange" />
              <span>Closes {formatDate(registrationEnd)}</span>
            </div>

            <span className="text-white/20">•</span>

            <div className="flex items-center gap-1.5">
              <Users className="w-3 h-3 text-emerald-400" />
              <span>{totalParticipants} / {maxParticipants ?? "∞"} Places Joined</span>
            </div>

            {tags.length > 0 && (
              <>
                <span className="text-white/20">•</span>
                <div className="flex items-center gap-1">
                  <TagIcon className="w-3 h-3 text-orange" />
                  {tags.map((t) => (
                    <span key={t.tag.id} className="text-[#F1EFE9]/80 font-bold uppercase">
                      #{t.tag.name}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Hero Showcase Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
          {/* Left Column (8/12 = 66%): Cover Image Frame */}
          <div className="lg:col-span-8">
            <ArenaCoverGallery
              coverImageUrl={coverImageUrl}
              additionalImages={additionalImages}
              title={title}
            />
          </div>

          {/* Right Column (4/12 = 34%): Compact Action Card */}
          <div className="lg:col-span-4">
            <ArenaActionCard
              isPrivate={isPrivate}
              isTeam={isTeam}
              minTeamSize={minTeamSize}
              maxTeamSize={maxTeamSize}
              maxParticipants={maxParticipants}
              totalParticipants={totalParticipants}
              status={status}
              inviteCode={inviteCode}
              isGuest={isGuest}
              isJoined={isJoined}
              isHost={isHost}
              onJoin={onJoin}
              onQuit={onQuit}
              onResign={onResign}
              onLoginRedirect={onLoginRedirect}
              onRequestPrivateJoin={onRequestPrivateJoin}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ArenaDetailHero;
