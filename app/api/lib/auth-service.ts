import { prisma } from "./prisma";

/**
 * Synchronize a Supabase authenticated user with our public PostgreSQL database and assign a role.
 */
export async function syncUser(params: {
  id: string;
  email: string;
  fullName?: string;
  roleName?: "ADMIN" | "USER" | "COMPANY";
}) {
  const { id, email, fullName, roleName = "USER" } = params;

  return await prisma.$transaction(async (tx) => {
    // 1. Upsert the User profile
    const user = await tx.user.upsert({
      where: { id },
      update: { email, fullName },
      create: { id, email, fullName },
    });

    // 2. Fetch the corresponding Role ID
    const role = await tx.role.findUnique({
      where: { name: roleName },
    });

    if (!role) {
      throw new Error(`Role ${roleName} does not exist in the database. Run db seed first.`);
    }

    // 3. Upsert UserRole link
    await tx.userRole.upsert({
      where: {
        userId_roleId: {
          userId: user.id,
          roleId: role.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        roleId: role.id,
      },
    });

    return user;
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
