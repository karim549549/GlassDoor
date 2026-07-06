import { prisma } from "../app/api/lib/prisma";

const ROLES = [
  {
    name: "ADMIN",
    description: "System administrator with full access to manage platform data.",
  },
  {
    name: "USER",
    description: "Standard registered user with access to review companies and submit salaries.",
  },
  {
    name: "COMPANY",
    description: "Company representative profile for managing company reviews and details.",
  },
];

async function main() {
  console.log("Start seeding database roles...");
  for (const role of ROLES) {
    const upsertedRole = await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: {
        name: role.name,
        description: role.description,
      },
    });
    console.log(`Upserted role: ${upsertedRole.name}`);
  }
  console.log("Seeding finished successfully.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
