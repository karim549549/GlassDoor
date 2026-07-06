import { NextResponse } from "next/server";
import { createClient } from "@/app/api/lib/supabase/server";
import { getUserRoles } from "@/app/api/lib/auth-service";

export async function GET() {
  try {
    const supabase = await createClient();

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

    try {
      const roles = await getUserRoles(user.id);
      return NextResponse.json({
        authenticated: true,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.user_metadata.full_name || null,
        },
        roles: roles.length > 0 ? roles : ["USER"],
      });
    } catch (dbError) {
      console.error("Failed to fetch user roles from database:", dbError);
      return NextResponse.json({
        authenticated: true,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.user_metadata.full_name || null,
        },
        roles: ["USER"],
      });
    }
  } catch (error) {
    console.error("Auth status query failed (Supabase or database unconfigured/down):", error);
    return NextResponse.json({
      authenticated: false,
      user: null,
      roles: ["GUEST"],
    });
  }
}
