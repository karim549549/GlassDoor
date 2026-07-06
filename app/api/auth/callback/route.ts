import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/app/api/lib/supabase/server";
import { syncUser } from "@/app/api/lib/auth-service";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectTo = searchParams.get("redirectTo") || "/";

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

  // Synchronize user profile and default role in public DB
  await syncUser({
    id: user.id,
    email: user.email ?? "",
    fullName: user.user_metadata.full_name || null,
    roleName: "USER",
  });

  return NextResponse.redirect(new URL(redirectTo, request.url));
}
