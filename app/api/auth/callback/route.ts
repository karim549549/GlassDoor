import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/server/supabase/server";
import { syncUser } from "@/lib/server/auth/auth-service";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectTo = searchParams.get("redirectTo") || "";

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=Authorization+code+missing", request.url));
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !user) {
    console.error("Code exchange failed:", error);
    return NextResponse.redirect(new URL("/login?error=Authentication+failed", request.url));
  }

  // Synchronize user profile and default role in public DB. Unlike the credentials
  // login flow, an OAuth session is already fully established at this point, so a
  // sync failure can't be silently ignored - redirect with an error instead of a raw 500.
  try {
    await syncUser({
      id: user.id,
      email: user.email ?? "",
      fullName: user.user_metadata.full_name || null,
      roleName: "USER",
      emailVerified: true,
    });
  } catch (syncError) {
    console.error(`Profile sync failed on OAuth callback for user ${user.id}:`, syncError);
    return NextResponse.redirect(new URL("/login?error=Profile+sync+failed", request.url));
  }

  const finalRedirect = redirectTo || `/user/${user.id}`;
  return NextResponse.redirect(new URL(finalRedirect, request.url));
}
