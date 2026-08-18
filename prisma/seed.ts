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

  // Twelve arenas, not a hundred and two.
  //
  // The old block generated 102 from a grid of cities x topics x suffixes -
  // "Tanta Kubernetes Mesh Sprint #8" - which filled the board with noise while
  // covering barely any of the states the UI actually has. 81 of them were
  // finished, every one was FULL_STACK_WEB, none had a prize, and none was
  // in-person, so most of the interface had nothing to render against.
  //
  // These twelve are chosen so that every visual state appears at least once:
  // each status, solo and team, online and in-person, private and public,
  // prized and free, and all four difficulties. Small enough to read the whole
  // board while working on it.
  console.log("Reseeding arenas...");
  await prisma.arena.deleteMany({});

  let creator = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
  if (!creator) {
    creator = await prisma.user.upsert({
      where: { id: "11111111-1111-1111-1111-111111111111" },
      update: {},
      create: {
        id: "11111111-1111-1111-1111-111111111111",
        email: "system-host@devsarena.eg",
        fullName: "System Host",
        handle: "devsarena_host",
        emailVerified: true,
      },
    });
  }

  const now = new Date();
  const at = (days: number, hours = 0) =>
    new Date(now.getTime() + days * 86_400_000 + hours * 3_600_000);

  type Phase = "scheduled" | "open" | "planning" | "building" | "finished";

  /** The six windows for a given phase, shaped like a real Saturday. */
  const windows = (phase: Phase) => {
    switch (phase) {
      case "scheduled":
        return { reg: [at(3), at(10)], idea: [at(10), at(10, 0.5)], impl: [at(10, 0.5), at(10, 4.5)] };
      case "open":
        return { reg: [at(-2), at(5)], idea: [at(5), at(5, 0.5)], impl: [at(5, 0.5), at(5, 4.5)] };
      case "planning":
        return { reg: [at(-7), at(0, -0.25)], idea: [at(0, -0.25), at(0, 0.25)], impl: [at(0, 0.25), at(0, 4.25)] };
      case "building":
        return { reg: [at(-7), at(0, -2)], idea: [at(0, -2), at(0, -1.5)], impl: [at(0, -1.5), at(0, 2.5)] };
      case "finished":
        return { reg: [at(-21), at(-14)], idea: [at(-14), at(-14, 0.5)], impl: [at(-14, 0.5), at(-14, 4.5)] };
    }
  };

  interface Spec {
    title: string;
    description: string;
    phase: Phase;
    difficulty: "NOVICE" | "INTERMEDIATE" | "ADVANCED" | "GRANDMASTER";
    isTeam: boolean;
    inPerson?: string;
    isPrivate?: boolean;
    prize?: number;
  }

  // The briefs are written in the voice PRD 1.3 asks for: playful, specific,
  // a little absurd. A seed is the first thing anyone reads, and generated
  // titles like "Giza Node.js Duel #47" teach the wrong tone to every host who
  // sees them before writing their own.
  const specs: Spec[] = [
    { title: "The most devious video player", description: "It has to play video. Beyond that, make watching something a genuinely hostile experience. Bonus points for anything that makes a person apologise to their own laptop.", phase: "open", difficulty: "INTERMEDIATE", isTeam: true },
    { title: "A site with absolutely zero business value", description: "Ship something polished, responsive and accessible that no one could ever monetise. Investors must weep.", phase: "open", difficulty: "NOVICE", isTeam: false },
    { title: "Build something that makes two strangers talk", description: "Any medium. The only requirement is that at the end of it, two people who did not know each other have said something to each other.", phase: "open", difficulty: "INTERMEDIATE", isTeam: true, inPerson: "Greek Campus, Downtown Cairo" },
    { title: "The worst possible date picker", description: "Every date picker is already bad. Go further. It must still return a valid date.", phase: "open", difficulty: "NOVICE", isTeam: false, prize: 3000 },
    { title: "Make a game playable on two devices at once", description: "One game, two screens, both doing something. Phone and laptop, two laptops, a phone and a smart fridge - your problem.", phase: "planning", difficulty: "ADVANCED", isTeam: true, prize: 10000 },
    { title: "A dashboard for something that needs no dashboard", description: "Charts, filters, a live-updating KPI row. For something with no metrics whatsoever.", phase: "building", difficulty: "INTERMEDIATE", isTeam: true },
    { title: "Ship a CLI you would actually use tomorrow", description: "Four hours, one terminal, no UI. It has to be genuinely useful to you personally by the end.", phase: "building", difficulty: "ADVANCED", isTeam: false },
    { title: "Rebuild something famous, but wrong", description: "Pick a well-known interface. Rebuild it faithfully, except for one decision that ruins it. That decision is the entry.", phase: "scheduled", difficulty: "INTERMEDIATE", isTeam: true },
    { title: "Consensus, in one sitting", description: "Three nodes, one agreed value, arbitrary message loss. No libraries that do the hard part for you.", phase: "scheduled", difficulty: "GRANDMASTER", isTeam: true, prize: 25000 },
    { title: "Alexandria: build for someone on 3G", description: "In the room, on a throttled connection. If it does not work at 400kbps it does not count.", phase: "scheduled", difficulty: "ADVANCED", isTeam: true, inPerson: "Smouha, Alexandria" },
    { title: "Internal tools night", description: "Bring the boring internal thing you have been putting off. We build it together and demo at the end.", phase: "open", difficulty: "NOVICE", isTeam: true, isPrivate: true },
    { title: "The zero-JavaScript challenge", description: "A genuinely interactive page. No JavaScript ships to the browser. Yes, really.", phase: "finished", difficulty: "ADVANCED", isTeam: false },
  ];

  for (const [i, spec] of specs.entries()) {
    const w = windows(spec.phase);
    await prisma.arena.create({
      data: {
        title: spec.title,
        description: spec.description,
        creatorId: creator.id,
        publishedAt: at(-30),
        difficulty: spec.difficulty,
        isPrivate: Boolean(spec.isPrivate),
        inviteCode: spec.isPrivate ? `INTERNAL-TOOLS-${i + 100}` : null,
        locationType: spec.inPerson ? "IN_PERSON" : "ONLINE",
        locationName: spec.inPerson ?? null,
        hasPrizePool: Boolean(spec.prize),
        totalPrizePool: spec.prize ?? null,
        firstPlacePrize: spec.prize ?? null,
        registrationStart: w.reg[0],
        registrationEnd: w.reg[1],
        ideaPhaseStart: w.idea[0],
        ideaPhaseEnd: w.idea[1],
        implPhaseStart: w.impl[0],
        implPhaseEnd: w.impl[1],
        isTeam: spec.isTeam,
        minTeamSize: spec.isTeam ? 2 : 1,
        maxTeamSize: spec.isTeam ? 4 : 1,
        maxParticipants: spec.isTeam ? 32 : 60,
        requireGithubUrl: true,
        requireVideoUrl: true,
        requireWriteup: true,
        rulesText: "Original work only. Any stack. Be nice in the chat.",
      },
    });
  }

  console.log(`Seeded ${specs.length} arenas.`);

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
