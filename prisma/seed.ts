import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });
import { prisma } from "../lib/server/prisma";

const ROLES = [
  {
    name: "ADMIN",
    description: "System administrator with full access to manage platform data.",
  },
  {
    name: "USER",
    description: "Standard registered developer: enters arenas, submits work, earns a rating.",
  },
  {
    name: "COMPANY",
    description: "Company representative: hosts and sponsors arenas, manages the company profile.",
  },
  {
    // Gates /judge. NOT in SELF_ASSIGNABLE_ROLES (lib/auth/schema.ts) and must
    // never be - a judge who can grant themselves the role defeats the point of
    // open judging. Granted deliberately, the same way ADMIN is.
    name: "JUDGE",
    description: "Scores submissions against a published rubric. Granted manually, never self-assigned.",
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

  // Idempotent: re-runnable to pick up new roles, skills and job types without
  // stacking another hundred arenas on top of the ones already there.
  const existingArenas = await prisma.arena.count();
  if (existingArenas > 0) {
    console.log(`Skipping mock arenas: ${existingArenas} already exist.`);
    console.log("Seeding finished successfully.");
    return;
  }

  console.log("Seeding 102 mock arenas...");

  // Find creator
  let creator = await prisma.user.findFirst();
  if (!creator) {
    // If no user exists, create a system host user to satisfy relation
    const systemId = "11111111-1111-1111-1111-111111111111";
    creator = await prisma.user.upsert({
      where: { id: systemId },
      update: {},
      create: {
        id: systemId,
        email: "system-host@devsarena.eg",
        fullName: "System Host",
        emailVerified: true
      }
    });
  }

  const cities = ["Cairo", "Giza", "Alexandria", "Suez", "Mansoura", "Luxor", "Aswan", "Tanta", "Asyut", "Red Sea"];
  const topics = ["React", "Next.js", "Node.js", "Python", "Go API", "Rust Sync", "DevOps scaling", "Database Sync", "Kubernetes Mesh", "Web3 Cairo"];
  const suffixes = ["Speedrun", "Sprint", "Duel", "Hackathon", "Championship", "League", "Clash", "Showdown", "Marathon", "Expo"];

  const statuses = ["REGISTRATION_OPEN", "IDEA_PHASE", "IMPLEMENTATION_PHASE", "COMPLETED"];

  for (let i = 0; i < 102; i++) {
    const city = cities[i % cities.length];
    const topic = topics[Math.floor(Math.random() * topics.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const title = `${city} ${topic} ${suffix} #${i + 1}`;
    const description = `This is a high-stakes developers challenge in ${city} focusing on advanced engineering setups in ${topic}. Gather your squads and push code solutions under rigorous CPU benchmark loads.`;
    
    // Status assignment
    const status = statuses[i % statuses.length];
    
    // Calculate timelines relative to now
    const now = new Date();
    const regStart = new Date();
    const regEnd = new Date();
    const ideaStart = new Date();
    const ideaEnd = new Date();
    const implStart = new Date();
    const implEnd = new Date();

    if (status === "REGISTRATION_OPEN") {
      regStart.setDate(now.getDate() - 3);
      regEnd.setDate(now.getDate() + 7);
      ideaStart.setDate(now.getDate() + 7);
      ideaEnd.setDate(now.getDate() + 14);
      implStart.setDate(now.getDate() + 14);
      implEnd.setDate(now.getDate() + 21);
    } else if (status === "IDEA_PHASE") {
      regStart.setDate(now.getDate() - 10);
      regEnd.setDate(now.getDate() - 3);
      ideaStart.setDate(now.getDate() - 3);
      ideaEnd.setDate(now.getDate() + 4);
      implStart.setDate(now.getDate() + 4);
      implEnd.setDate(now.getDate() + 11);
    } else if (status === "IMPLEMENTATION_PHASE") {
      regStart.setDate(now.getDate() - 15);
      regEnd.setDate(now.getDate() - 8);
      ideaStart.setDate(now.getDate() - 8);
      ideaEnd.setDate(now.getDate() - 2);
      implStart.setDate(now.getDate() - 2);
      implEnd.setDate(now.getDate() + 5);
    } else {
      // COMPLETED
      regStart.setDate(now.getDate() - 30);
      regEnd.setDate(now.getDate() - 23);
      ideaStart.setDate(now.getDate() - 23);
      ideaEnd.setDate(now.getDate() - 16);
      implStart.setDate(now.getDate() - 16);
      implEnd.setDate(now.getDate() - 9);
    }

    const isPrivate = i % 5 === 0;
    const isTeam = i % 2 === 0;

    await prisma.arena.create({
      data: {
        title,
        description,
        creatorId: creator.id,
        publishedAt: new Date(),
        isPrivate,
        inviteCode: isPrivate ? `INVITE-CODE-${i + 1000}` : null,
        registrationStart: regStart,
        registrationEnd: regEnd,
        ideaPhaseStart: ideaStart,
        ideaPhaseEnd: ideaEnd,
        implPhaseStart: implStart,
        implPhaseEnd: implEnd,
        isTeam,
        minTeamSize: isTeam ? 2 : 1,
        maxTeamSize: isTeam ? 4 : 1,
        maxParticipants: isTeam ? 30 : 100,
        requireGithubUrl: true,
        requireFigmaUrl: i % 3 === 0,
        requireVideoUrl: i % 2 === 0,
        requireWriteup: true,
        rulesText: "Ensure valid commits, write documentation, respect time constraints, and obey submission deliverable types.",
      }
    });
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
