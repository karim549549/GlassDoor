import { prisma } from "./prisma";

type TransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

/**
 * Synchronize a Supabase authenticated user with our public PostgreSQL database and assign a role.
 */
export async function syncUser(params: {
  id: string;
  email: string;
  fullName?: string;
  roleName?: "ADMIN" | "USER" | "COMPANY";
  emailVerified?: boolean;
}) {
  const { id, email, fullName, roleName = "USER", emailVerified = false } = params;

  // 1. Upsert the User profile
  const user = await prisma.user.upsert({
    where: { id },
    update: { email, fullName, emailVerified },
    create: { id, email, fullName, emailVerified },
  });

  // 2. Fetch or dynamically create the corresponding Role if missing
  let role = await prisma.role.findUnique({
    where: { name: roleName },
  });

  if (!role) {
    try {
      role = await prisma.role.create({
        data: { name: roleName },
      });
    } catch {
      // Fallback in case of concurrent insert race conditions
      role = await prisma.role.findUnique({
        where: { name: roleName },
      });
    }
  }

  if (!role) {
    throw new Error(`Role ${roleName} could not be resolved.`);
  }

  // 3. Upsert UserRole link
  await prisma.userRole.upsert({
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
