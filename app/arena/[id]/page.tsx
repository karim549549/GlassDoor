import React from "react";
import { notFound } from "next/navigation";
import { extractUuidFromSlug } from "@/lib/arena-slug";
import { fetchInternalApi } from "@/lib/server/api-client";
import { ArenaHeader } from "@/components/arena/ArenaHeader";
import { ArenaContainer } from "@/components/arena/ArenaContainer";
import { BackgroundGrid } from "@/components/ui/BackgroundGrid";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ArenaDetailPage({ params }: PageProps) {
  const { id: slugParam } = await params;
  const uuid = extractUuidFromSlug(decodeURIComponent(slugParam));

  const res = await fetchInternalApi(`/api/arena/${uuid}`, { cache: "no-store" });

  if (res.status === 404) {
    notFound();
  }
  if (!res.ok) {
    throw new Error("Failed to load arena.");
  }

  const { arena } = await res.json();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative overflow-x-hidden pt-0">
      <ArenaHeader
        breadcrumbs={`Home > Arena > ${arena.title}`}
        title={arena.title}
        description={arena.description}
      />

      {/* Main content — wireframe placeholder */}
      <ArenaContainer className="relative py-12 md:py-16">
        <BackgroundGrid opacity={0.085} />

        <div className="relative z-10 border-2 border-dashed border-[#0E0E0D]/30 bg-white/50 p-12 flex items-center justify-center">
          <span className="font-mono text-[0.6rem] text-muted-foreground uppercase tracking-[0.2em]">
            [WIREFRAME LAYOUT PENDING — DETAIL VIEW]
          </span>
        </div>
      </ArenaContainer>
    </div>
  );
}
