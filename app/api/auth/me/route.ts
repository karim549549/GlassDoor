import { NextResponse } from "next/server";
import { createClient } from "@/app/api/lib/supabase/server";
import { getUserRoles } from "@/app/api/lib/auth-service";
import { prisma } from "@/app/api/lib/prisma";

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
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { avatarUrl: true, coverUrl: true },
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
