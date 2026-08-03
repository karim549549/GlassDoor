import { ComponentProps } from "react";
import { extractUuidFromSlug } from "@/lib/arena-slug";
import { ArenaDetailClient } from "@/components/arena/detail/ArenaDetailClient";

type ArenaDetailClientProps = ComponentProps<typeof ArenaDetailClient>;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ArenaDetailPage({ params }: PageProps) {
  const { id: slugParam } = await params;
  const decodedSlug = decodeURIComponent(slugParam);
  const uuid = extractUuidFromSlug(decodedSlug);

  /* 
    API & DB Integration commented out for pure UI prototyping phase.
    Uncomment when backend models & seed data are ready.
    
    let arenaData: Record<string, unknown> | null = null;
    let metaData: Record<string, unknown> | null = null;
    try {
      const res = await fetchInternalApi(`/api/arena/${uuid}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        arenaData = data.arena;
        metaData = data.meta;
      }
    } catch (e) {
      console.warn("API fetch error:", e);
    }
  */

  // Pure Prototype Mock Data — Ensures page loads instantly for any URL
  const arenaData = {
    id: uuid || "prototype-arena-1",
    title: "CYBERPUNK ALGORITHM BATTLE 2026",
    description:
      "Architect and implement high-throughput real-time distributed systems under simulated cyber-threat scenarios. Compete in teams or solo to build resilient microservices with Next.js, Prisma, and WebSockets.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
    status: "IDEA_PHASE",
    isPrivate: false,
    inviteCode: "CYBER-2026-X",
    isTeam: true,
    minTeamSize: 2,
    maxTeamSize: 4,
    maxParticipants: 50,
    registrationStart: "2026-08-01T00:00:00.000Z",
    registrationEnd: "2026-08-15T23:59:59.000Z",
    ideaPhaseStart: "2026-08-16T00:00:00.000Z",
    ideaPhaseEnd: "2026-08-25T23:59:59.000Z",
    implPhaseStart: "2026-08-26T00:00:00.000Z",
    implPhaseEnd: "2026-09-05T23:59:59.000Z",
    requireGithubUrl: true,
    requireFigmaUrl: true,
    requireVideoUrl: true,
    requireWriteup: true,
    rulesText: `1. Code must be original and created during the official implementation window.\n2. Open-source libraries are permitted, but core logic must be custom.\n3. All entries must include a working GitHub repository and 2-minute video demonstration.\n4. Play fair, respect team members, and enjoy building!`,
    creator: {
      id: "creator-uuid",
      fullName: "Alex River",
      handle: "alex_dev",
      avatarUrl: null,
    },
    tags: [
      { tag: { id: "t1", name: "Next.js", slug: "nextjs", color: "golden" } },
      { tag: { id: "t2", name: "Prisma", slug: "prisma", color: "cyan" } },
      { tag: { id: "t3", name: "Distributed AI", slug: "ai", color: "purple" } },
    ],
  };

  const metaData = {
    isOwner: false,
    isRegistered: false,
    totalParticipants: 24,
  };

  return (
    <ArenaDetailClient
      arena={arenaData as ArenaDetailClientProps["arena"]}
      meta={metaData as ArenaDetailClientProps["meta"]}
    />
  );
}
