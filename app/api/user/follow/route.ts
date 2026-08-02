import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { requireUser } from "@/lib/server/auth/require-user";
import { withApiErrorHandling } from "@/lib/server/api-route";

export async function POST(req: Request) {
  return withApiErrorHandling("Follow action failed", async () => {
    const auth = await requireUser();
    if ("response" in auth) return auth.response;
    const { user } = auth;

    const body = await req.json();
    const { targetUserId } = body;

    if (!targetUserId) {
      return NextResponse.json({ error: "Target User ID is required" }, { status: 400 });
    }

    if (targetUserId === user.id) {
      return NextResponse.json({ error: "You cannot follow yourself" }, { status: 400 });
    }

    // Verify target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Target user not found" }, { status: 404 });
    }

    // Check if relationship already exists
    const existingFollow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: user.id,
          followingId: targetUserId,
        },
      },
    });

    let isFollowing = false;

    if (existingFollow) {
      // Unfollow (delete connection)
      await prisma.follows.delete({
        where: {
          followerId_followingId: {
            followerId: user.id,
            followingId: targetUserId,
          },
        },
      });
      isFollowing = false;
    } else {
      // Follow (create connection)
      await prisma.follows.create({
        data: {
          followerId: user.id,
          followingId: targetUserId,
        },
      });
      isFollowing = true;
    }

    // Get updated followers count
    const followersCount = await prisma.follows.count({
      where: { followingId: targetUserId },
    });

    return NextResponse.json({
      success: true,
      following: isFollowing,
      followersCount,
    });
  });
}
