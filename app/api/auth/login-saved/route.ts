import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/app/api/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return NextResponse.json({ error: "Refresh token is required." }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Restore session using the refresh token
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.user) {
      return NextResponse.json({ error: error?.message || "Invalid or expired session token." }, { status: 401 });
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
  } catch (err) {
    console.error("Auto-login session exchange failed:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
