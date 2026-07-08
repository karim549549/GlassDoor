import React from "react";
import prisma from "@/lib/server/prisma";
import { notFound } from "next/navigation";
import { extractUuidFromSlug } from "@/lib/contest-slug";
import { ContestHeader } from "@/components/contest/ContestHeader";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ContestDetailPage({ params }: PageProps) {
  const { id: slugParam } = await params;
  const uuid = extractUuidFromSlug(decodeURIComponent(slugParam));

  // Fetch minimal contest data for SSR header
  const contest = await prisma.contest.findUnique({
    where: { id: uuid },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
    }
  }).catch(() => null);

  if (!contest) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative overflow-x-hidden pt-0">
      <ContestHeader
        breadcrumbs={`Home > Arena > ${contest.title}`}
        title={contest.title}
        description={contest.description}
      />

      {/* Main content — wireframe placeholder */}
      <div className="relative z-10 w-[92%] xl:w-[80%] max-w-[1700px] mx-auto py-12 md:py-16">
        <div className="absolute inset-0 opacity-[0.085] pointer-events-none z-0">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="detail-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#detail-grid)" />
          </svg>
        </div>

        <div className="relative z-10 border-2 border-dashed border-[#0E0E0D]/30 bg-white/50 p-12 flex items-center justify-center">
          <span className="font-mono text-[0.6rem] text-muted-foreground uppercase tracking-[0.2em]">
            [WIREFRAME LAYOUT PENDING — DETAIL VIEW]
          </span>
        </div>
      </div>
    </div>
  );
}
