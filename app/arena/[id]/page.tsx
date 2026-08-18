import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildArenaSlug, extractUuidFromSlug } from "@/lib/arena-slug";
import { serializeJsonLd } from "@/lib/json-ld";
import { getSiteUrl } from "@/lib/site-url";
import { getArenaDetail } from "@/lib/arena/service";
import { deriveArenaStatus } from "@/lib/arena/status";
import { getOptionalUser } from "@/lib/server/auth/require-user";
import { ArenaDetailClient } from "@/components/arena/detail/ArenaDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

const loadArena = cache((uuid: string, viewerId: string | null) =>
  getArenaDetail(uuid, viewerId)
);

function toMetaText(description: string, maxLength: number): string {
  return description.replace(/[#*`>]/g, "").slice(0, maxLength).trim();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id: slugParam } = await params;
  const uuid = extractUuidFromSlug(decodeURIComponent(slugParam));
  const result = uuid ? await loadArena(uuid, null) : null;

  if (!result) {
    return { title: "Arena Not Found" };
  }

  const { arena } = result;
  const cleanDescription = toMetaText(arena.description, 160);
  const canonicalUrl = `${getSiteUrl()}/arena/${buildArenaSlug(arena.title, arena.id)}`;

  return {
    title: `${arena.title} | Devs Arena`,
    description: cleanDescription,
    keywords: ["hackathon", "arena", "coding competition", arena.title],
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: arena.title,
      description: cleanDescription,
      type: "website",
      url: canonicalUrl,
    },
    twitter: {
      card: "summary_large_image",
      title: arena.title,
      description: cleanDescription,
    },
  };
}

export default async function ArenaDetailPage({ params }: PageProps) {
  const { id: slugParam } = await params;
  const uuid = extractUuidFromSlug(decodeURIComponent(slugParam));

  const viewer = await getOptionalUser();
  const result = uuid ? await loadArena(uuid, viewer?.id ?? null) : null;

  if (!result) {
    notFound();
  }

  const { arena, meta } = result;
  const now = new Date();
  const derivedStatus = deriveArenaStatus(arena, now);

  const canonicalUrl = `${getSiteUrl()}/arena/${buildArenaSlug(arena.title, arena.id)}`;
  const isOnline = arena.locationType === "ONLINE";

  const location = isOnline
    ? { "@type": "VirtualLocation", url: canonicalUrl }
    : arena.locationName
      ? {
          "@type": "Place",
          name: arena.locationName,
          address: arena.locationName,
          ...(arena.googleMapsUrl ? { hasMap: arena.googleMapsUrl } : {}),
        }
      : null;

  const organizerName = arena.creator.fullName || arena.creator.handle;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: arena.title,
    description: toMetaText(arena.description, 300),
    url: canonicalUrl,
    startDate: arena.registrationStart.toISOString(),
    endDate: arena.implPhaseEnd.toISOString(),
    eventAttendanceMode: isOnline
      ? "https://schema.org/OnlineEventAttendanceMode"
      : "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    ...(location ? { location } : {}),
    ...(organizerName ? { organizer: { "@type": "Person", name: organizerName } } : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <ArenaDetailClient
        arena={{
          id: arena.id,
          title: arena.title,
          description: arena.description,
          status: derivedStatus,
          isPrivate: arena.isPrivate,
          inviteCode: arena.inviteCode,
          locationType: arena.locationType,
          locationName: arena.locationName,
          googleMapsUrl: arena.googleMapsUrl,
          isTeam: arena.isTeam,
          minTeamSize: arena.minTeamSize,
          maxTeamSize: arena.maxTeamSize,
          maxParticipants: arena.maxParticipants,
          registrationStart: arena.registrationStart.toISOString(),
          registrationEnd: arena.registrationEnd.toISOString(),
          ideaPhaseStart: arena.ideaPhaseStart.toISOString(),
          ideaPhaseEnd: arena.ideaPhaseEnd.toISOString(),
          implPhaseStart: arena.implPhaseStart.toISOString(),
          implPhaseEnd: arena.implPhaseEnd.toISOString(),
          requireGithubUrl: arena.requireGithubUrl,
          requireFigmaUrl: arena.requireFigmaUrl,
          requireVideoUrl: arena.requireVideoUrl,
          requireWriteup: arena.requireWriteup,
          rulesText: arena.rulesText,
          creator: {
            id: arena.creator.id,
            fullName: arena.creator.fullName,
            handle: arena.creator.handle ?? "",
            avatarUrl: arena.creator.avatarUrl,
          },
        }}
        meta={meta}
        isGuest={!viewer}
      />
    </>
  );
}
