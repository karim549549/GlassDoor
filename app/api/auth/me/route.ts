import { NextResponse } from "next/server";
import { createClient } from "@/lib/server/supabase/server";
import { getUserRoles } from "@/lib/server/auth/auth-service";
import { prisma } from "@/lib/server/prisma";

export async function GET() {
  try {
    const supabase = await createClient();

    // Authoritative auth check - getUser() revalidates against Supabase Auth,
    // unlike getSession() which just reads the (unverified) cookie.
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({
        authenticated: false,
        user: null,
        roles: ["GUEST"],
      });
    }

    // Non-gating: only used to read the refresh token for the client's
    // saved-accounts convenience feature, not for any authorization decision.
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const roles = await getUserRoles(user.id);
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { avatarUrl: true, coverUrl: true, lastActiveAt: true },
    });

    // Only write lastActiveAt if it's stale - this endpoint fires on every
    // authenticated page load, so an unconditional write turns every page
    // view into a DB write.
    const STALE_THRESHOLD_MS = 5 * 60 * 1000;
    const isStale =
      !dbUser?.lastActiveAt || Date.now() - dbUser.lastActiveAt.getTime() > STALE_THRESHOLD_MS;
    if (isStale) {
      await prisma.user.update({
        where: { id: user.id },
        data: { lastActiveAt: new Date() },
      }).catch(() => {
        // Best-effort - don't fail the whole request over a presence timestamp.
      });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.user_metadata.full_name || null,
        avatarUrl: dbUser?.avatarUrl || null,
        coverUrl: dbUser?.coverUrl || null,
      },
      roles: roles.length > 0 ? roles : ["USER"],
      session: {
        refreshToken: session?.refresh_token || null,
      },
    });
  } catch (error) {
    console.error("Auth status query failed (Supabase or database unconfigured/down):", error);
    return NextResponse.json({
      authenticated: false,
      user: null,
      roles: ["GUEST"],
    });
  }
}
