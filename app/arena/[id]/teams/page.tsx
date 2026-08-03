import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { extractUuidFromSlug } from "@/lib/arena-slug";
import { ArenaContainer } from "@/components/arena/ArenaContainer";
import { BackgroundGrid } from "@/components/ui/BackgroundGrid";
import { Footer } from "@/components/home/Footer";
import { ArenaTeamMatchmakingClient } from "@/components/arena/detail/ArenaTeamMatchmakingClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

const MOCK_ARENA_DATA = {
  title: "CYBERPUNK ALGORITHM BATTLE 2026",
  description: "Architect and implement high-throughput real-time distributed systems.",
  coverImageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
  status: "REGISTRATION_OPEN",
  isTeam: true,
  minTeamSize: 2,
  maxTeamSize: 4,
  maxParticipants: 50,
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Squad Matchmaking & Team Lobbies | ${MOCK_ARENA_DATA.title}`,
    description: `Browse open team lobbies, claim slots, or host your own squad for ${MOCK_ARENA_DATA.title}.`,
  };
}

export default async function ArenaTeamsPage({ params }: PageProps) {
  const { id: slugParam } = await params;
  const decodedSlug = decodeURIComponent(slugParam);
  const uuid = extractUuidFromSlug(decodedSlug);

  const arenaId = uuid || "prototype-arena-1";

  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative overflow-x-hidden pt-0 pb-20 space-y-0">
      {/* Top Navigation Banner */}
      <div className="bg-[#0E0E0D] text-[#F1EFE9] border-b-2 border-[#0E0E0D] pt-20 pb-8 px-6 md:px-12">
        <div className="max-w-7xl mx-auto space-y-3">
          <nav aria-label="Breadcrumb" className="font-mono text-[0.58rem] tracking-widest uppercase font-bold flex flex-wrap items-center gap-1.5 text-orange">
            <Link href="/" className="hover:underline text-orange/80">HOME</Link>
            <span className="text-white/40">&gt;</span>
            <Link href={`/arena/${slugParam}`} className="hover:underline text-orange/80">
              {MOCK_ARENA_DATA.title}
            </Link>
            <span className="text-white/40">&gt;</span>
            <span className="text-white">MATCHMAKING & SQUAD LOBBIES</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div>
              <h1 className="font-display italic text-3xl sm:text-4xl uppercase tracking-tight text-[#F1EFE9]">
                SQUAD MATCHMAKING HUB
              </h1>
              <p className="font-mono text-xs text-[#F1EFE9]/70 mt-1 max-w-xl">
                Claim an open slot in a squad lobby, form a new team, or recruit free agents for {MOCK_ARENA_DATA.title}.
              </p>
            </div>

            <Link
              href={`/arena/${slugParam}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-[#0E0E0D] font-mono text-[0.62rem] uppercase font-bold tracking-widest border-2 border-white hover:bg-[#0E0E0D] hover:text-[#F1EFE9] transition-colors cursor-pointer self-start sm:self-auto shadow-[2px_2px_0px_0px_rgba(255,255,255,0.3)]"
            >
              <span>← ARENA DETAILS & RULES</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <ArenaContainer className="py-10">
        <BackgroundGrid opacity={0.05} />
        <div className="relative z-10 max-w-5xl mx-auto">
          <ArenaTeamMatchmakingClient
            arenaId={arenaId}
            arenaTitle={MOCK_ARENA_DATA.title}
            minTeamSize={MOCK_ARENA_DATA.minTeamSize}
            maxTeamSize={MOCK_ARENA_DATA.maxTeamSize}
            slugParam={slugParam}
          />
        </div>
      </ArenaContainer>

      <Footer />
    </div>
  );
}
