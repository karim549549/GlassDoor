import { prisma } from "../../lib/server/prisma";

async function main() {
  console.log("Starting database truncation...");

  // Delete user-role links first to prevent foreign key constraint issues
  const userRolesCount = await prisma.userRole.deleteMany({});
  console.log(`Cleared ${userRolesCount.count} user-role links.`);

  // Delete user profiles
  const usersCount = await prisma.user.deleteMany({});
  console.log(`Cleared ${usersCount.count} users.`);

  console.log("Database cleared successfully (System roles preserved).");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Truncate failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
