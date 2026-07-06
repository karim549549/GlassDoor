import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "../prisma";

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
}) {
  const { id, email, fullName, roleName = "USER", emailVerified = false } = params;

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
      const staleUser = await prisma.user.findUnique({ where: { email } });
      if (staleUser && staleUser.id !== id) {
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
