import React from "react";
import type { Metadata } from "next";
import { extractUuidFromSlug } from "@/lib/arena-slug";
import { ArenaContainer } from "@/components/arena/ArenaContainer";
import { BackgroundGrid } from "@/components/ui/BackgroundGrid";
import { Footer } from "@/components/home/Footer";
import { ArenaDetailHero } from "@/components/arena/detail/ArenaDetailHero";
import { ArenaTeamMatchmakingClient } from "@/components/arena/detail/ArenaTeamMatchmakingClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

const MOCK_ARENA_DATA = {
  title: "CYBERPUNK ALGORITHM BATTLE 2026",
  description:
    `Architect and implement **high-throughput real-time distributed systems** under simulated cyber-threat scenarios. Compete in teams or solo to build resilient microservices with Next.js, Prisma, and WebSockets.`,
  coverImageUrl:
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
  status: "REGISTRATION_OPEN",
  isPrivate: false,
  inviteCode: "CYBER-2026-X",
  isTeam: true,
  minTeamSize: 2,
  maxTeamSize: 4,
  maxParticipants: 50,
  totalParticipants: 24,
  registrationStart: "2026-08-01T00:00:00.000Z",
  registrationEnd: "2026-08-15T23:59:59.000Z",
  creator: {
    id: "creator-uuid",
    fullName: "Alex River",
    handle: "alex_dev",
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
  },
  tags: [
    { tag: { id: "t1", name: "Next.js", slug: "nextjs", color: "golden" } },
    { tag: { id: "t2", name: "Prisma", slug: "prisma", color: "cyan" } },
    { tag: { id: "t3", name: "Distributed AI", slug: "ai", color: "purple" } },
  ],
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

  const arenaId = uuid || slugParam;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative overflow-x-hidden pt-0 pb-20 space-y-0">
      {/* REUSED HERO COMPONENT: Same cover image, title, tags, badges, location & rollback breadcrumbs */}
      <ArenaDetailHero
        mode="matchmaking"
        id={slugParam}
        title={MOCK_ARENA_DATA.title}
        description={MOCK_ARENA_DATA.description}
        coverImageUrl={MOCK_ARENA_DATA.coverImageUrl}
        isPrivate={MOCK_ARENA_DATA.isPrivate}
        isTeam={MOCK_ARENA_DATA.isTeam}
        minTeamSize={MOCK_ARENA_DATA.minTeamSize}
        maxTeamSize={MOCK_ARENA_DATA.maxTeamSize}
        maxParticipants={MOCK_ARENA_DATA.maxParticipants}
        totalParticipants={MOCK_ARENA_DATA.totalParticipants}
        status={MOCK_ARENA_DATA.status}
        registrationStart={MOCK_ARENA_DATA.registrationStart}
        registrationEnd={MOCK_ARENA_DATA.registrationEnd}
        creator={MOCK_ARENA_DATA.creator}
        tags={MOCK_ARENA_DATA.tags}
      />

      {/* Dedicated Matchmaking Hub Content */}
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
