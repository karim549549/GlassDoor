import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/server/supabase/server";
import type { Provider } from "@supabase/supabase-js";
import { logger } from "@/lib/server/logger";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const provider = searchParams.get("provider");
  const redirectTo = searchParams.get("redirectTo") || "";

  if (!provider) {
    return NextResponse.json({ error: "Provider is required." }, { status: 400 });
  }

  const supabase = await createClient();
  const origin = request.nextUrl.origin;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider as Provider,
    options: {
      redirectTo: `${origin}/api/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`,
    },
  });

  if (error || !data.url) {
    logger.error("OAuth sign-in initiation failed", { provider, error: error?.message });
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent("OAuth initiation failed")}`, request.url)
    );
  }

  return NextResponse.redirect(data.url);
}
