import { ComponentProps } from "react";
import type { Metadata } from "next";
import { extractUuidFromSlug } from "@/lib/arena-slug";
import { ArenaDetailClient } from "@/components/arena/detail/ArenaDetailClient";

type ArenaDetailClientProps = ComponentProps<typeof ArenaDetailClient>;

interface PageProps {
  params: Promise<{ id: string }>;
}

const MOCK_ARENA_DATA = {
  title: "CYBERPUNK ALGORITHM BATTLE 2026",
  description:
    `Architect and implement **high-throughput real-time distributed systems** under simulated cyber-threat scenarios. Compete in teams or solo to build resilient microservices with Next.js, Prisma, and WebSockets.

## 🎯 Challenge Objectives
- Build **partition-tolerant** services that remain available during simulated network splits.
- Implement real-time telemetry streaming via \`WebSockets\` and \`Server-Sent Events\`.
- Guarantee idempotency and eventual consistency across heterogeneous database replicas.

## 🛠️ Recommended Tech Stack
> "Simplicity is prerequisite for reliability." — Edsger W. Dijkstra

You are free to leverage open-source packages, but core distributed primitives (\`circuit-breakers\`, \`rate-limiters\`, \`message-queues\`) must be implemented or explicitly configured by your team.

### Evaluation Criteria
1. **System Resilience & Throughput** (40%)
2. **Code Cleanliness & Architectural Choices** (30%)
3. **Observability & Live Demo Quality** (30%)`,
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

export async function generateMetadata(): Promise<Metadata> {
  
  // Clean description text for meta description
  const cleanDescription = MOCK_ARENA_DATA.description
    .replace(/[#*`>]/g, "")
    .slice(0, 160)
    .trim();

  return {
    title: `${MOCK_ARENA_DATA.title} | GlassDoor Arena`,
    description: cleanDescription,
    keywords: ["hackathon", "arena", "distributed systems", "coding competition", "Next.js", "Prisma"],
    openGraph: {
      title: MOCK_ARENA_DATA.title,
      description: cleanDescription,
      type: "website",
      images: [
        {
          url: MOCK_ARENA_DATA.coverImageUrl,
          width: 1200,
          height: 630,
          alt: MOCK_ARENA_DATA.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: MOCK_ARENA_DATA.title,
      description: cleanDescription,
      images: [MOCK_ARENA_DATA.coverImageUrl],
    },
  };
}

export default async function ArenaDetailPage({ params }: PageProps) {
  const { id: slugParam } = await params;
  const decodedSlug = decodeURIComponent(slugParam);
  const uuid = extractUuidFromSlug(decodedSlug);

  const arenaData = {
    ...MOCK_ARENA_DATA,
    id: uuid || "prototype-arena-1",
  };

  const metaData = {
    isOwner: false,
    isRegistered: false,
    totalParticipants: 24,
  };

  // Structured Data (JSON-LD) for Google Search Event indexing
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": arenaData.title,
    "description": arenaData.description.replace(/[#*`>]/g, "").slice(0, 300),
    "image": [arenaData.coverImageUrl],
    "startDate": arenaData.registrationStart,
    "endDate": arenaData.implPhaseEnd,
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "eventStatus": "https://schema.org/EventScheduled",
    "location": {
      "@type": "Place",
      "name": "CAIRO TECH INNOVATION HUB",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Cairo",
        "addressCountry": "EG"
      }
    },
    "organizer": {
      "@type": "Person",
      "name": arenaData.creator.fullName || arenaData.creator.handle
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ArenaDetailClient
        arena={arenaData as ArenaDetailClientProps["arena"]}
        meta={metaData as ArenaDetailClientProps["meta"]}
      />
    </>
  );
}
