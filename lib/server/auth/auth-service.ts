import "server-only";
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

  const [user] = await prisma.$transaction([
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

  return user;
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
