"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { BackgroundGrid } from "@/components/ui/BackgroundGrid";
import { ArenaContainer } from "@/components/arena/ArenaContainer";
import { ArenaDetailHero } from "./ArenaDetailHero";
import { ArenaOverviewTab } from "./ArenaOverviewTab";
import { ArenaLeaderboardTab } from "./ArenaLeaderboardTab";
import { ArenaCommentsSection } from "./ArenaCommentsSection";
import { Footer } from "@/components/home/Footer";
import { CheckCircle2 } from "lucide-react";

interface ArenaDetailClientProps {
  arena: {
    id: string;
    title: string;
    description: string;
    coverImageUrl?: string | null;
    additionalImages?: string[];
    status: string;
    isPrivate: boolean;
    inviteCode?: string | null;
    isTeam: boolean;
    minTeamSize: number;
    maxTeamSize: number;
    maxParticipants: number | null;
    registrationStart: string;
    registrationEnd: string;
    ideaPhaseStart: string;
    ideaPhaseEnd: string;
    implPhaseStart: string;
    implPhaseEnd: string;
    requireGithubUrl: boolean;
    requireFigmaUrl: boolean;
    requireVideoUrl: boolean;
    requireWriteup: boolean;
    rulesText: string;
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
  };
  meta: {
    isOwner: boolean;
    isRegistered: boolean;
    totalParticipants: number;
  };
}

export function ArenaDetailClient({ arena, meta }: ArenaDetailClientProps) {
  const isGuest = false;
  const [isJoined, setIsJoined] = useState<boolean>(meta.isRegistered);
  const isHost = meta.isOwner;

  const [totalParticipants, setTotalParticipants] = useState<number>(
    meta.totalParticipants || 24
  );

  const [notification, setNotification] = useState<string | null>(null);

  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleLoginRedirect = () => {
    if (typeof window !== "undefined") {
      window.location.href = `/login?returnUrl=${encodeURIComponent(window.location.pathname)}`;
    }
  };

  const handleJoin = () => {
    setIsJoined(true);
    setTotalParticipants((prev) => prev + 1);
    triggerNotification("Successfully joined the arena!");
  };

  const handleQuit = () => {
    setIsJoined(false);
    setTotalParticipants((prev) => Math.max(0, prev - 1));
    triggerNotification("You have quit the arena.");
  };

  const handleResign = () => {
    setIsJoined(false);
    triggerNotification("You have resigned from this active competition.");
  };

  const handleRequestPrivateJoin = (_code?: string) => {
    setIsJoined(true);
    setTotalParticipants((prev) => prev + 1);
    const msg = _code ? `Code ${_code} verified! Joined private arena.` : "Access granted to private arena!";
    triggerNotification(msg);
  };



  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-foreground font-sans relative overflow-x-hidden pt-0 pb-0">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-[#0E0E0D] text-[#F1EFE9] border-2 border-orange shadow-[4px_4px_0px_0px_#FF5722] p-4 max-w-md font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-orange shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      <main className="flex-1">
        {/* Hero Component */}
        <ArenaDetailHero
          id={arena.id}
          title={arena.title}
          description={arena.description}
          coverImageUrl={arena.coverImageUrl}
          additionalImages={arena.additionalImages || []}
          isPrivate={arena.isPrivate}
          isTeam={arena.isTeam}
          minTeamSize={arena.minTeamSize}
          maxTeamSize={arena.maxTeamSize}
          maxParticipants={arena.maxParticipants}
          totalParticipants={totalParticipants}
          status={arena.status}
          inviteCode={arena.inviteCode}
          registrationStart={arena.registrationStart}
          registrationEnd={arena.registrationEnd}
          creator={arena.creator}
          tags={arena.tags}
          isGuest={isGuest}
          isJoined={isJoined}
          isHost={isHost}
          onJoin={handleJoin}
          onQuit={handleQuit}
          onResign={handleResign}
          onLoginRedirect={handleLoginRedirect}
          onRequestPrivateJoin={handleRequestPrivateJoin}
          onEditCoverClick={() => triggerNotification("Edit Cover modal coming soon.")}
        />

        {/* Main Content Area */}
        <ArenaContainer className="py-10">
          <BackgroundGrid opacity={0.05} />
          <div className="relative z-10 max-w-7xl mx-auto space-y-12">
            {/* Full Markdown Description */}
            <section id="arena-description" className="space-y-4 pt-2">
              <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-orange font-bold border-b border-[#0E0E0D]/15 pb-2">
                CHALLENGE OVERVIEW &amp; OBJECTIVES
              </h2>
              <article className="bg-white border-2 border-[#0E0E0D] shadow-[6px_6px_0px_0px_#0E0E0D] p-6 sm:p-8">
                <div className="prose max-w-none font-sans text-foreground leading-relaxed
                  prose-headings:font-display prose-headings:italic prose-headings:uppercase prose-headings:tracking-tight prose-headings:text-[#0E0E0D]
                  prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-h2:mt-6 prose-h2:mb-3 prose-h3:mt-4 prose-h3:mb-2
                  prose-p:font-sans prose-p:text-[#0E0E0D]/85 prose-p:my-3
                  prose-strong:font-bold prose-strong:text-[#0E0E0D]
                  prose-code:font-mono prose-code:text-xs prose-code:bg-[#0E0E0D]/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:border prose-code:border-[#0E0E0D]/20
                  prose-pre:bg-[#0E0E0D] prose-pre:text-[#F1EFE9] prose-pre:p-4 prose-pre:border-2 prose-pre:border-[#0E0E0D]
                  prose-ul:list-disc prose-ul:pl-5 prose-ol:list-decimal prose-ol:pl-5
                  prose-li:font-sans prose-li:text-sm prose-li:text-[#0E0E0D]/85
                  prose-a:text-orange prose-a:no-underline hover:prose-a:underline
                  prose-blockquote:border-l-4 prose-blockquote:border-orange prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-[#0E0E0D]/60">
                  <ReactMarkdown>{arena.description}</ReactMarkdown>
                </div>
              </article>
            </section>

            {/* Deliverables & Official Rules */}
            <section className="space-y-4 pt-2 border-t border-[#0E0E0D]/10">
              <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-orange font-bold border-b border-[#0E0E0D]/15 pb-2">
                REQUIRED DELIVERABLES &amp; OFFICIAL RULES
              </h2>
              <ArenaOverviewTab
                description={arena.description}
                rulesText={arena.rulesText}
                requireGithubUrl={arena.requireGithubUrl}
                requireFigmaUrl={arena.requireFigmaUrl}
                requireVideoUrl={arena.requireVideoUrl}
                requireWriteup={arena.requireWriteup}
              />
            </section>

            {/* 2-Stage Editorial L-Shape Layout: Top area is 2/3 Comments + 1/3 Leaderboard; Bottom area is 100% Full-Width Comments */}
            <div className="pt-6 border-t-2 border-[#0E0E0D] space-y-6">
              {/* Stage 1: Top 2-Column Grid (Comments 2/3 vs Leaderboard 1/3) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column (8/12 = 66.67%): Header, Comment Input, and Top Featured Comments */}
                <div className="lg:col-span-8 space-y-4">
                  <ArenaCommentsSection
                    isGuest={isGuest}
                    onLoginRedirect={handleLoginRedirect}
                    limit={2}
                    startIndex={0}
                    showInput={true}
                    hideHeader={false}
                  />
                </div>

                {/* Right Column (4/12 = 33.33%): Leaderboard Standings */}
                <div className="lg:col-span-4 space-y-4">
                  <ArenaLeaderboardTab />
                </div>
              </div>

              {/* Stage 2: Bottom Full-Width Discussion (Expands 100% across all 12 columns below the Leaderboard) */}
              <div className="w-full pt-2">
                <ArenaCommentsSection
                  isGuest={isGuest}
                  onLoginRedirect={handleLoginRedirect}
                  limit={10}
                  startIndex={2}
                  showInput={false}
                  hideHeader={true}
                />
              </div>
            </div>
          </div>
        </ArenaContainer>
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

export default ArenaDetailClient;
