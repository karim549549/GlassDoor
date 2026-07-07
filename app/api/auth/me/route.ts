import { NextResponse } from "next/server";
import { createClient } from "@/lib/server/supabase/server";
import { getUserRoles } from "@/lib/server/auth/auth-service";
import { prisma } from "@/lib/server/prisma";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    const user = session?.user;

    if (error || !user) {
      return NextResponse.json({
        authenticated: false,
        user: null,
        roles: ["GUEST"],
      });
    }

    const roles = await getUserRoles(user.id);
    const dbUser = await prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() },
      select: { avatarUrl: true, coverUrl: true },
    }).catch(async () => {
      return await prisma.user.findUnique({
        where: { id: user.id },
        select: { avatarUrl: true, coverUrl: true },
      });
    });

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
        refreshToken: session.refresh_token || null,
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
