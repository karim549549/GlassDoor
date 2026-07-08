import React from "react";
import prisma from "@/lib/server/prisma";
import { notFound } from "next/navigation";
import { ContestHeader } from "@/components/contest/ContestHeader";
import { extractUuidFromSlug } from "@/lib/contest-slug";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ContestDetailPage({ params }: PageProps) {
  const { id: slugParam } = await params;

  // Extract the UUID from the SEO slug (last 36 chars)
  const uuid = extractUuidFromSlug(decodeURIComponent(slugParam));

  // Fetch contest from DB
  const contest = await prisma.contest.findUnique({
    where: { id: uuid },
    include: {
      creator: {
        select: { id: true, fullName: true, avatarUrl: true }
      },
      teams: {
        include: {
          members: {
            include: {
              user: { select: { id: true, fullName: true, avatarUrl: true } }
            }
          }
        }
      }
    }
  }).catch(() => null);

  if (!contest) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative overflow-x-hidden pt-0">
      {/* Reusable Dark Masthead */}
      <ContestHeader
        breadcrumbs={`Home > Arena > ${contest.title}`}
        title={contest.title}
        description={contest.description}
      />

      {/* Main Page Layout Container */}
      <div className="relative z-10 w-[92%] xl:w-[80%] max-w-[1700px] mx-auto py-12 md:py-16">

        {/* Editorial Background Blueprint Grid */}
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

        {/* Placeholder — wireframe content will be added after discussion */}
        <div className="relative z-10 border-2 border-[#0E0E0D] bg-white p-8 shadow-[4px_4px_0px_0px_#0E0E0D] space-y-4">
          <span className="font-mono text-[0.6rem] text-orange font-bold uppercase tracking-[0.2em] block">
            [ARENA DETAIL — WIREFRAME STAGED]
          </span>
          <h2 className="font-display italic text-2xl uppercase tracking-tight text-[#0E0E0D]">
            {contest.title}
          </h2>
          <p className="font-sans text-sm text-muted-foreground leading-relaxed max-w-xl">
            {contest.description}
          </p>
          <div className="pt-4 border-t border-dashed border-[#0E0E0D]/15 font-mono text-[0.55rem] text-muted-foreground uppercase tracking-wider space-y-1">
            <p>UUID: <code className="bg-secondary px-1.5 py-0.5 border border-border">{contest.id}</code></p>
            <p>Status: <code className="bg-secondary px-1.5 py-0.5 border border-border">{contest.status}</code></p>
            <p>Created by: <code className="bg-secondary px-1.5 py-0.5 border border-border">{contest.creator?.fullName ?? "Unknown"}</code></p>
          </div>
        </div>

      </div>
    </div>
  );
}
