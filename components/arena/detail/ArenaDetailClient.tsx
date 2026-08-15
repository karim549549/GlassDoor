"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { BackgroundGrid } from "@/components/ui/BackgroundGrid";
import { ArenaContainer } from "@/components/arena/ArenaContainer";
import { ArenaDetailHero } from "./ArenaDetailHero";
import { ArenaOverviewTab } from "./ArenaOverviewTab";
import { ArenaTimelineStepper } from "./ArenaTimelineStepper";
import { ArenaActionCard } from "./ArenaActionCard";
import { ArenaHostCard } from "./ArenaHostCard";
import { ArenaComments } from "./ArenaComments";
import { ArenaLeaderboard } from "./ArenaLeaderboard";
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
    locationType: "ONLINE" | "IN_PERSON";
    locationName: string | null;
    googleMapsUrl: string | null;
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
  };
  meta: {
    isOwner: boolean;
    isRegistered: boolean;
    totalParticipants: number;
  };
  /** True when nobody is signed in, so join actions redirect to login instead. */
  isGuest: boolean;
}

export function ArenaDetailClient({ arena, meta, isGuest }: ArenaDetailClientProps) {
  const [isJoined, setIsJoined] = useState<boolean>(meta.isRegistered);
  const isHost = meta.isOwner;

  const [totalParticipants, setTotalParticipants] = useState<number>(
    meta.totalParticipants
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

  const handleJoin = async () => {
    try {
      const res = await fetch(`/api/arena/${arena.id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        triggerNotification(data.error || "Failed to join arena.");
        return;
      }
      setIsJoined(true);
      setTotalParticipants((prev) => prev + 1);
      triggerNotification("Successfully joined the arena!");
    } catch {
      triggerNotification("Network error. Could not join arena.");
    }
  };

  const handleQuit = async () => {
    try {
      const res = await fetch(`/api/arena/${arena.id}/leave`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        triggerNotification(data.error || "Failed to leave arena.");
        return;
      }
      setIsJoined(false);
      setTotalParticipants((prev) => Math.max(0, prev - 1));
      triggerNotification("You have left the arena.");
    } catch {
      triggerNotification("Network error. Could not leave arena.");
    }
  };

  const handleResign = async () => {
    await handleQuit();
  };

  const handleRequestPrivateJoin = async (code?: string) => {
    try {
      const res = await fetch(`/api/arena/${arena.id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode: code }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        triggerNotification(data.error || "Invalid invitation code.");
        return;
      }
      setIsJoined(true);
      setTotalParticipants((prev) => prev + 1);
      triggerNotification("Access granted! Joined private arena.");
    } catch {
      triggerNotification("Network error. Could not verify code.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-foreground font-sans relative overflow-x-hidden pt-0 pb-0">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-foreground text-background border-2 border-orange shadow-[4px_4px_0px_0px_#FF5722] p-4 max-w-md font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
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
          locationType={arena.locationType}
          locationName={arena.locationName}
          venueName={null}
          googleMapsUrl={arena.googleMapsUrl}
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
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column (8 cols): Description & Deliverables */}
              <div className="lg:col-span-8 space-y-10">
                {/* Full Markdown Description */}
                <section id="arena-description" className="space-y-4 pt-2">
                  <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-orange font-bold border-b border-foreground/15 pb-2">
                    CHALLENGE OVERVIEW &amp; OBJECTIVES
                  </h2>
                  <article className="bg-white border-2 border-foreground shadow-[6px_6px_0px_0px_var(--foreground)] p-6 sm:p-8">
                    <div className="prose max-w-none font-sans text-foreground leading-relaxed
                      prose-headings:font-display prose-headings:italic prose-headings:uppercase prose-headings:tracking-tight prose-headings:text-foreground
                      prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-h2:mt-6 prose-h2:mb-3 prose-h3:mt-4 prose-h3:mb-2
                      prose-p:font-sans prose-p:text-foreground/85 prose-p:my-3
                      prose-strong:font-bold prose-strong:text-foreground
                      prose-code:font-mono prose-code:text-xs prose-code:bg-foreground/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:border prose-code:border-foreground/20
                      prose-pre:bg-foreground prose-pre:text-background prose-pre:p-4 prose-pre:border-2 prose-pre:border-foreground
                      prose-ul:list-disc prose-ul:pl-5 prose-ol:list-decimal prose-ol:pl-5
                      prose-li:font-sans prose-li:text-sm prose-li:text-foreground/85
                      prose-a:text-orange prose-a:no-underline hover:prose-a:underline
                      prose-blockquote:border-l-4 prose-blockquote:border-orange prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-foreground/60">
                      <ReactMarkdown>{arena.description}</ReactMarkdown>
                    </div>
                  </article>
                </section>

                {/* Deliverables & Official Rules */}
                <section className="space-y-4 pt-2 border-t border-foreground/10">
                  <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-orange font-bold border-b border-foreground/15 pb-2">
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
              </div>

              {/* Right Column (4 cols): Action Card, Timeline Stepper & Host Card */}
              <div className="lg:col-span-4 space-y-6">
                <ArenaActionCard
                  isPrivate={arena.isPrivate}
                  isTeam={arena.isTeam}
                  minTeamSize={arena.minTeamSize}
                  maxTeamSize={arena.maxTeamSize}
                  maxParticipants={arena.maxParticipants}
                  totalParticipants={totalParticipants}
                  status={arena.status}
                  inviteCode={arena.inviteCode}
                  isGuest={isGuest}
                  isJoined={isJoined}
                  isHost={isHost}
                  onJoin={handleJoin}
                  onQuit={handleQuit}
                  onResign={handleResign}
                  onLoginRedirect={handleLoginRedirect}
                  onRequestPrivateJoin={handleRequestPrivateJoin}
                />

                <ArenaTimelineStepper
                  status={arena.status}
                  registrationStart={arena.registrationStart}
                  registrationEnd={arena.registrationEnd}
                  ideaPhaseStart={arena.ideaPhaseStart}
                  ideaPhaseEnd={arena.ideaPhaseEnd}
                  implPhaseStart={arena.implPhaseStart}
                  implPhaseEnd={arena.implPhaseEnd}
                />

                <ArenaHostCard
                  creator={{
                    id: arena.creator.id,
                    fullName: arena.creator.fullName,
                    handle: arena.creator.handle || "host",
                    avatarUrl: arena.creator.avatarUrl,
                  }}
                  isPrivate={arena.isPrivate}
                  inviteCode={arena.inviteCode}
                />
              </div>
            </div>

            {/* Discussion and Standings Panels */}
            <div className="pt-6 border-t-2 border-foreground grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-8">
                <ArenaComments arenaId={arena.id} />
              </div>

              <div className="lg:col-span-4">
                <ArenaLeaderboard arenaId={arena.id} />
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
