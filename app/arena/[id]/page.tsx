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

  // Pure Prototype Mock Data with direct public Unsplash image URLs
  const arenaData = {
    id: uuid || "prototype-arena-1",
    title: "CYBERPUNK ALGORITHM BATTLE 2026",
    description:
      `Architect and implement high-throughput real-time distributed systems under simulated cyber-threat scenarios. Compete in teams or solo to build resilient microservices with Next.js, Prisma, and WebSockets that can withstand adversarial network conditions.

This arena pushes participants to think beyond the happy path. You will be building systems that must remain available, consistent, and partition-tolerant — all at the same time. Judges will evaluate not just whether your system works, but how gracefully it fails under pressure.

Participants are expected to design their own data models, define their own API contracts, and make real architectural trade-offs. The problem statement is intentionally open-ended — there is no one correct solution. The best submissions will be those that clearly justify every decision made.

Distributed tracing, circuit breakers, event-driven architectures, CQRS patterns — these are the tools of the trade. Whether you use them is up to you. What matters is that your system is observable, recoverable, and defensible in front of our judging panel.

The top three teams will present their systems live in a 10-minute final showcase. Questions from judges will be technical, direct, and unforgiving. Come prepared.`,
    coverImageUrl:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80",
    ],
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
      avatarUrl:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
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
