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
    logger.warn("Unauthenticated request to a protected route");
    return { response: NextResponse.json({ error: "Unauthorized." }, { status: 401 }) };
  }
  return { user };
}

/**
 * Ensures the authenticated user has at least one of the required roles.
 * Returns 401 if unauthenticated, 403 if missing required roles.
 */
export async function requireRole(allowedRoles: string[]): Promise<RequireUserResult> {
  const auth = await requireUser();
  if ("response" in auth) return auth;
  const { user } = auth;

  // Import prisma dynamically to prevent circular dependencies
  const prisma = (await import("@/lib/server/prisma")).default;
  const userRoles = await prisma.userRole.findMany({
    where: { userId: user.id },
    include: { role: true },
  });

  const roleNames = userRoles.map((ur) => ur.role.name);
  const hasRole = allowedRoles.some((r) => roleNames.includes(r));

  if (!hasRole) {
    logger.warn(`Forbidden role access attempt: user ${user.id} has [${roleNames.join(", ")}], required one of [${allowedRoles.join(", ")}]`);
    return { response: NextResponse.json({ error: "Forbidden. Insufficient permissions." }, { status: 403 }) };
  }

  return { user };
}
