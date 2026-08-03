"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Globe, Lock, Users, Calendar, ShieldCheck, Tag as TagIcon } from "lucide-react";
import { BackgroundGrid } from "@/components/ui/BackgroundGrid";
import { ArenaCoverGallery } from "./ArenaCoverGallery";
import { ArenaActionCard, PrototypeUserRole } from "./ArenaActionCard";

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

  // Prototype state props
  currentUserRole: PrototypeUserRole;
  onChangeUserRole: (role: PrototypeUserRole) => void;
  onJoinSolo: () => void;
  onOpenTeamModal: () => void;
  onRequestPrivateJoin: (code?: string) => void;
  onGoToSubmission: () => void;
  onLoginRedirect: () => void;
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
  currentUserRole,
  onChangeUserRole,
  onJoinSolo,
  onOpenTeamModal,
  onRequestPrivateJoin,
  onGoToSubmission,
  onLoginRedirect,
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
    <div className="w-full bg-[#0E0E0D] text-[#F1EFE9] border-b-4 border-double border-[#F1EFE9]/25 pt-20 pb-12 px-6 md:px-12 relative overflow-hidden">
      {/* Blueprint grid background effect */}
      <BackgroundGrid opacity={0.06} patternSize={28} />

      <div className="max-w-7xl mx-auto relative z-10 space-y-8">
        {/* Top Breadcrumb & Status Bar */}
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

        {/* 2-Column Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (7/12 = 58%): Title & Rich Metadata */}
          <div className="lg:col-span-7 space-y-6">
            {/* Title */}
            <h1 className="font-display italic text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-[#F1EFE9] leading-[1.05]">
              {title}
            </h1>

            {/* Description */}
            <p className="font-mono text-xs sm:text-sm text-[#F1EFE9]/70 leading-relaxed max-w-2xl">
              {description}
            </p>

            {/* RICH METADATA ROW DIRECTLY UNDER TITLE */}
            <div className="p-4 bg-white/5 border-2 border-white/15 space-y-4">
              {/* Host Profile */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full border border-orange overflow-hidden bg-[#0E0E0D]">
                    {creator.avatarUrl ? (
                      <Image
                        src={creator.avatarUrl}
                        alt={creator.handle}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-mono text-xs font-bold text-orange">
                        {creator.handle.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-xs font-bold text-[#F1EFE9]">
                        {creator.fullName || `@${creator.handle}`}
                      </span>
                      <ShieldCheck className="w-3.5 h-3.5 text-orange" />
                    </div>
                    <span className="font-mono text-[0.52rem] uppercase tracking-widest text-[#F1EFE9]/50 block">
                      ARENA ORGANIZER & HOST
                    </span>
                  </div>
                </div>

                <Link
                  href={`/profile/${creator.handle}`}
                  className="font-mono text-[0.55rem] uppercase tracking-wider text-orange hover:underline font-bold"
                >
                  View Host Profile &rarr;
                </Link>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-[0.58rem]">
                <div className="space-y-0.5">
                  <span className="text-[#F1EFE9]/40 uppercase tracking-widest block text-[0.5rem]">
                    REGISTRATION DEADLINE
                  </span>
                  <span className="text-[#F1EFE9] font-bold flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-orange" />
                    {formatDate(registrationEnd)}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[#F1EFE9]/40 uppercase tracking-widest block text-[0.5rem]">
                    PLACES & PARTICIPANTS
                  </span>
                  <span className="text-[#F1EFE9] font-bold flex items-center gap-1">
                    <Users className="w-3 h-3 text-emerald-400" />
                    {totalParticipants} / {maxParticipants ?? "∞"} Joined
                  </span>
                </div>

                <div className="space-y-0.5 col-span-2 sm:col-span-1">
                  <span className="text-[#F1EFE9]/40 uppercase tracking-widest block text-[0.5rem]">
                    ACCESS VISIBILITY
                  </span>
                  <span className="text-[#F1EFE9] font-bold flex items-center gap-1">
                    {isPrivate ? (
                      <Lock className="w-3 h-3 text-amber-400" />
                    ) : (
                      <Globe className="w-3 h-3 text-emerald-400" />
                    )}
                    {isPrivate ? "INVITE ONLY" : "OPEN TO ALL"}
                  </span>
                </div>
              </div>

              {/* Tags Badges Row */}
              {tags.length > 0 && (
                <div className="pt-2 border-t border-white/10 flex flex-wrap items-center gap-1.5">
                  <TagIcon className="w-3 h-3 text-orange shrink-0" />
                  {tags.map((t) => (
                    <span
                      key={t.tag.id}
                      className="font-mono text-[0.52rem] uppercase tracking-wider px-2 py-0.5 bg-white/10 border border-white/15 text-[#F1EFE9]"
                    >
                      #{t.tag.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column (5/12 = 42%): Cover Image Frame & Action Card */}
          <div className="lg:col-span-5 space-y-6">
            {/* Cover Image & Media Showcase */}
            <ArenaCoverGallery
              coverImageUrl={coverImageUrl}
              additionalImages={additionalImages}
              title={title}
            />

            {/* Action Box CTA */}
            <ArenaActionCard
              isPrivate={isPrivate}
              isTeam={isTeam}
              minTeamSize={minTeamSize}
              maxTeamSize={maxTeamSize}
              maxParticipants={maxParticipants}
              totalParticipants={totalParticipants}
              status={status}
              inviteCode={inviteCode}
              currentUserRole={currentUserRole}
              onChangeUserRole={onChangeUserRole}
              onJoinSolo={onJoinSolo}
              onOpenTeamModal={onOpenTeamModal}
              onRequestPrivateJoin={onRequestPrivateJoin}
              onGoToSubmission={onGoToSubmission}
              onLoginRedirect={onLoginRedirect}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ArenaDetailHero;
