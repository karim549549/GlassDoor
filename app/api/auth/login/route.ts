import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/app/api/lib/supabase/server";
import { syncUser } from "@/app/api/lib/auth-service";

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

    // Synchronize user profile into public DB on login to ensure it exists
    await syncUser({
      id: data.user.id,
      email: data.user.email ?? "",
      fullName: data.user.user_metadata?.full_name || null,
      roleName: "USER",
      emailVerified: true,
    });

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
