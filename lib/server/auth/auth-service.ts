import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "../prisma";
import { logger } from "../logger";

/**
 * Synchronize a Supabase authenticated user with our public PostgreSQL database and assign a role.
 *
 * Roles are seeded ahead of time (see prisma/seed.ts) so this never needs to create one at
 * runtime - that's what removes the concurrent-create race the old implementation had to
 * work around. The two writes are batched via `$transaction([...])` (not the interactive
 * `async (tx) => {}` form) because PgBouncer's transaction-mode pooling can't hold an
 * interactive transaction open across round-trips.
 */
export async function syncUser(params: {
  id: string;
  email: string;
  fullName?: string;
  roleName?: "ADMIN" | "USER" | "COMPANY";
  emailVerified?: boolean;
  /**
   * Opt in to the destructive stale-row reconciliation in the P2002 catch
   * below. Defaults to false so the dangerous path is never reached by
   * accident - only callers holding a verified Supabase session (login,
   * OAuth callback) should pass true.
   */
  allowStaleEmailReconciliation?: boolean;
}) {
  const {
    id,
    email,
    fullName,
    roleName = "USER",
    emailVerified = false,
    allowStaleEmailReconciliation = false,
  } = params;

  const role = await prisma.role.findUniqueOrThrow({
    where: { name: roleName },
  });

  const syncTransaction = () =>
    prisma.$transaction([
      prisma.user.upsert({
        where: { id },
        update: { email, fullName, emailVerified },
        create: { id, email, fullName, emailVerified },
      }),
      prisma.userRole.upsert({
        where: {
          userId_roleId: {
            userId: id,
            roleId: role.id,
          },
        },
        update: {},
        create: {
          userId: id,
          roleId: role.id,
        },
      }),
    ]);

  try {
    const [user] = await syncTransaction();
    return user;
  } catch (err) {
    // P2002 here can only be the `email` unique constraint - `id` is the
    // primary key and the upsert's `where: { id }` already established no row
    // with that id exists, so the conflict must come from a stale row: a
    // Postgres user profile left over under a different id after the
    // corresponding Supabase auth user was deleted and recreated (or
    // re-provisioned) with the same email. Supabase is the source of truth
    // for identity, so the stale row is safe to replace with one matching
    // the current session id.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      // GUARD: this branch DELETES a real user row, so it must only ever run
      // for a genuine Supabase identity. Supabase returns a success-shaped
      // response with a throwaway id when signUp is called for an
      // already-registered address; reaching here with such an id would let an
      // unauthenticated caller destroy the profile and role assignments of any
      // account whose email they knew. Callers are responsible for not passing
      // a throwaway id (app/api/auth/signup/route.ts checks `identities`), and
      // this refuses to guess if the caller opts out of the reconciliation.
      if (!allowStaleEmailReconciliation) {
        logger.warn("Refusing stale-row reconciliation for an unverified identity", { userId: id });
        throw err;
      }
      const staleUser = await prisma.user.findUnique({ where: { email } });
      if (staleUser && staleUser.id !== id) {
        logger.warn("Replacing stale user row after Supabase identity change", {
          staleUserId: staleUser.id,
          newUserId: id,
        });
        await prisma.userRole.deleteMany({ where: { userId: staleUser.id } });
        await prisma.user.delete({ where: { id: staleUser.id } });
        const [user] = await syncTransaction();
        return user;
      }
    }
    throw err;
  }
}

/**
 * Flip `emailVerified` after a verification code has been accepted.
 *
 * Deliberately NOT syncUser(). That function upserts a UserRole row as well,
 * defaulting to "USER" - so calling it here would silently grant USER to an
 * account that signed up as COMPANY. The role was already assigned during
 * signup; this step only confirms the address.
 *
 * The missing-row fallback covers the case where signup's own sync failed and
 * left a Supabase identity with no profile. Passing
 * allowStaleEmailReconciliation is safe at this call site and only here:
 * verifyOtp has just established a real session, so the id is a genuine
 * identity rather than the throwaway signUp returns for a known address.
 */
export async function markEmailVerified(params: {
  id: string;
  email: string;
  fullName?: string | null;
}) {
  const { id, email, fullName } = params;

  const existing = await prisma.user.findUnique({ where: { id }, select: { id: true } });

  if (!existing) {
    return syncUser({
      id,
      email,
      fullName: fullName ?? undefined,
      emailVerified: true,
      allowStaleEmailReconciliation: true,
    });
  }

  return prisma.user.update({
    where: { id },
    data: { email, emailVerified: true },
  });
}

/**
 * Retrieve all roles assigned to a user.
 */
export async function getUserRoles(userId: string): Promise<string[]> {
  const userRoles = await prisma.userRole.findMany({
    where: { userId },
    include: { role: true },
  });
  return userRoles.map((ur) => ur.role.name);
}

/**
 * Check if a user has a specific role.
 */
export async function hasRole(userId: string, roleName: string): Promise<boolean> {
  const roles = await getUserRoles(userId);
  return roles.includes(roleName);
}
