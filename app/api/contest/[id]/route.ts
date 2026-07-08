import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/server/supabase/server";
import { prisma } from "@/lib/server/prisma";
import { extractUuidFromSlug } from "@/lib/contest-slug";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id: slugParam } = await context.params;
    const uuid = extractUuidFromSlug(decodeURIComponent(slugParam));

    // Optionally get the authenticated user (not required — public page)
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const currentUserId = user?.id ?? null;

    // Fetch contest with relations
    const contest = await prisma.contest.findUnique({
      where: { id: uuid },
      include: {
        creator: {
          select: { id: true, fullName: true, handle: true, avatarUrl: true }
        },
        teams: {
          include: {
            members: {
              include: {
                user: { select: { id: true, fullName: true, handle: true, avatarUrl: true } }
              }
            }
          }
        },
        _count: {
          select: {
            teams: true,
            invitations: true,
          }
        }
      }
    });

    if (!contest) {
      return NextResponse.json({ error: "Contest not found." }, { status: 404 });
    }

    // Compute role flags based on the authenticated user
    const isOwner = currentUserId ? contest.creatorId === currentUserId : false;

    const isRegistered = currentUserId
      ? contest.teams.some(team =>
          team.members.some(member => member.userId === currentUserId)
        )
      : false;

    // Count total registered participants across all teams
    const totalParticipants = contest.teams.reduce(
      (sum, team) => sum + team.members.length, 0
    );

    return NextResponse.json({
      contest,
      meta: {
        isOwner,
        isRegistered,
        totalParticipants,
      }
    });
  } catch (err) {
    console.error("Contest detail API error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
