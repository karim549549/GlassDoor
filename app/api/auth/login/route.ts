import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/server/supabase/server";
import { syncUser } from "@/lib/server/auth/auth-service";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return NextResponse.json({ error: error?.message || "Login failed." }, { status: 401 });
    }

    // Synchronize user profile into public DB on login. If this fails, the user is
    // authenticated with Supabase but has no profile row - surface that as a real
    // error instead of silently returning success (see auth-service.ts for the sync logic).
    try {
      await syncUser({
        id: data.user.id,
        email: data.user.email ?? "",
        fullName: data.user.user_metadata?.full_name || null,
        roleName: "USER",
        emailVerified: true,
      });
    } catch (syncError) {
      console.error("Profile sync failed on login:", syncError);
      return NextResponse.json(
        { error: "PROFILE_SYNC_FAILED" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.user_metadata?.full_name || null,
      },
      session: {
        refreshToken: data.session?.refresh_token || null,
      },
    });
  } catch {
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
