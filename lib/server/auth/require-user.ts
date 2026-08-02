import "server-only";
import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/server/supabase/server";
import { logger } from "@/lib/server/logger";

/** For routes where the viewer's identity is optional (public data, personalized if logged in). */
export async function getOptionalUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ?? null;
}

export type RequireUserResult = { user: User } | { response: NextResponse };

/**
 * The create-client -> getUser() -> 401-if-missing sequence every protected
 * route repeated. Usage:
 *
 *   const auth = await requireUser();
 *   if ("response" in auth) return auth.response;
 *   const { user } = auth;
 */
export async function requireUser(): Promise<RequireUserResult> {
  const user = await getOptionalUser();
  if (!user) {
    // A failed auth check is worth tracking even though it's not a bug -
    // a pattern of these is exactly what's worth noticing.
    logger.warn("Unauthenticated request to a protected route");
    return { response: NextResponse.json({ error: "Unauthorized." }, { status: 401 }) };
  }
  return { user };
}
