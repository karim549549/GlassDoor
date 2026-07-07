import { prisma } from "../lib/server/prisma";

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

const SKILLS = [
  "React.js", "Next.js", "NestJS", "JavaScript", "TypeScript", "Node.js", 
  "Python", "PostgreSQL", "Go", "Docker", "Tailwind CSS", "HTML5", "CSS3", 
  "Git", "GraphQL", "REST API", "MongoDB", "AWS", "Kubernetes"
];

const JOB_TYPES = [
  "Frontend Developer", "Backend Developer", "Full Stack Developer", 
  "Mobile Developer", "DevOps Engineer", "Data Scientist", "QA Engineer", "UI/UX Designer"
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

  console.log("Start seeding database skills...");
  for (const skillName of SKILLS) {
    const upsertedSkill = await prisma.skill.upsert({
      where: { name: skillName },
      update: {},
      create: { name: skillName },
    });
    console.log(`Upserted skill: ${upsertedSkill.name}`);
  }

  console.log("Start seeding database job types...");
  for (const jtName of JOB_TYPES) {
    const upsertedJT = await prisma.jobType.upsert({
      where: { name: jtName },
      update: {},
      create: { name: jtName },
    });
    console.log(`Upserted job type: ${upsertedJT.name}`);
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
