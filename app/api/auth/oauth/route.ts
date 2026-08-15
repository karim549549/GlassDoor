import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/server/supabase/server";
import { logger } from "@/lib/server/logger";
import { safeRedirectPath } from "@/lib/url";

const ALLOWED_PROVIDERS = ["google", "github"] as const;
type AllowedProvider = (typeof ALLOWED_PROVIDERS)[number];

function isAllowedProvider(value: string | null): value is AllowedProvider {
  return value !== null && (ALLOWED_PROVIDERS as readonly string[]).includes(value);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const provider = searchParams.get("provider");
  const redirectTo = safeRedirectPath(searchParams.get("redirectTo"), "");

  if (!isAllowedProvider(provider)) {
    return NextResponse.json({ error: "Unsupported provider." }, { status: 400 });
  }

  const supabase = await createClient();
  const origin = request.nextUrl.origin;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
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
