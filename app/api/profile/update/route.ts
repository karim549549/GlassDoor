import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { createClient } from "@/lib/server/supabase/server";
import { prisma } from "@/lib/server/prisma";
import { isSafeHttpUrl } from "@/lib/url";

const EMPLOYMENT_STATUS_VALUES = ["UNEMPLOYED", "EMPLOYED", "FREELANCER", "INTERN", "STUDENT"] as const;
const SENIORITY_VALUES = ["JUNIOR", "MID", "SENIOR", "LEAD", "MANAGER"] as const;

const emptyToUndefined = (val: unknown) => (val === "" || val === null ? undefined : val);

const urlSchema = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .trim()
    .refine(isSafeHttpUrl, { message: "Must be a valid URL starting with http:// or https://" })
    .optional()
);

const updateProfileSchema = z.object({
  fullName: z.preprocess(emptyToUndefined, z.string().trim().min(1)).optional(),
  handle: z.preprocess(emptyToUndefined, z.string().trim()).optional(),
  bio: z.preprocess(emptyToUndefined, z.string().trim()).optional(),
  employmentStatus: z.preprocess(emptyToUndefined, z.enum(EMPLOYMENT_STATUS_VALUES)).optional(),
  currentEmployer: z.preprocess(emptyToUndefined, z.string().trim()).optional(),
  seniority: z.preprocess(emptyToUndefined, z.enum(SENIORITY_VALUES)).optional(),
  education: z.preprocess(emptyToUndefined, z.string().trim()).optional(),
  location: z.preprocess(emptyToUndefined, z.string().trim()).optional(),
  githubUrl: urlSchema,
  linkedinUrl: urlSchema,
  portfolioUrl: urlSchema,
  skills: z.array(z.string()).optional(),
  jobTypes: z.array(z.string()).optional(),
});

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rawBody = await req.json();
    const parsed = updateProfileSchema.safeParse(rawBody);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstIssue ? `${firstIssue.path.join(".")}: ${firstIssue.message}` : "Invalid request body." },
        { status: 400 }
      );
    }

    const {
      fullName,
      handle,
      bio,
      employmentStatus,
      currentEmployer,
      seniority,
      education,
      location,
      githubUrl,
      linkedinUrl,
      portfolioUrl,
      skills,
      jobTypes,
    } = parsed.data;

    const processedHandle = handle ? handle.toLowerCase().replace(/^@/, "") : null;

    // Fast-path friendly check - not the authoritative guard against the race,
    // see the P2002 catch below for that.
    if (processedHandle) {
      const existingUser = await prisma.user.findFirst({
        where: { handle: processedHandle, NOT: { id: user.id } },
      });
      if (existingUser) {
        return NextResponse.json({ error: "Handle is already taken" }, { status: 400 });
      }
    }

    let firstNameVal: string | null = null;
    let lastNameVal: string | null = null;
    if (fullName) {
      const parts = fullName.split(/\s+/);
      firstNameVal = parts[0] || null;
      lastNameVal = parts.slice(1).join(" ") || null;
    }

    const showEmployer =
      employmentStatus === "EMPLOYED" || employmentStatus === "FREELANCER" || employmentStatus === "INTERN";

    // Batched as a single transaction (array form, not the interactive
    // `async (tx) => {}` form - PgBouncer's transaction-mode pooling can't
    // hold an interactive transaction open across round-trips, same
    // constraint as lib/server/auth/auth-service.ts's syncUser).
    const ops: Prisma.PrismaPromise<unknown>[] = [
      prisma.user.update({
        where: { id: user.id },
        data: {
          fullName: fullName ?? null,
          firstName: firstNameVal,
          lastName: lastNameVal,
          handle: processedHandle,
          bio: bio ?? null,
          employmentStatus: employmentStatus ?? null,
          currentEmployer: showEmployer ? (currentEmployer ?? null) : null,
          seniority: seniority ?? null,
          education: education ?? null,
          location: location ?? null,
          githubUrl: githubUrl ?? null,
          linkedinUrl: linkedinUrl ?? null,
          portfolioUrl: portfolioUrl ?? null,
        },
      }),
    ];

    if (skills) {
      const uniqueSkills = [...new Set(skills)];
      ops.push(prisma.userSkill.deleteMany({ where: { userId: user.id } }));
      if (uniqueSkills.length > 0) {
        ops.push(
          prisma.userSkill.createMany({
            data: uniqueSkills.map((skillId) => ({ userId: user.id, skillId })),
          })
        );
      }
    }

    if (jobTypes) {
      const uniqueJobTypes = [...new Set(jobTypes)];
      ops.push(prisma.userJobType.deleteMany({ where: { userId: user.id } }));
      if (uniqueJobTypes.length > 0) {
        ops.push(
          prisma.userJobType.createMany({
            data: uniqueJobTypes.map((jobTypeId) => ({ userId: user.id, jobTypeId })),
          })
        );
      }
    }

    try {
      const [updatedUser] = await prisma.$transaction(ops);
      return NextResponse.json({ success: true, user: updatedUser });
    } catch (err) {
      // Authoritative check for the handle race: the pre-check above is only
      // a fast/friendly path, this catch is what actually prevents two
      // concurrent requests from both slipping through with the same handle.
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        return NextResponse.json({ error: "Handle is already taken" }, { status: 400 });
      }
      throw err;
    }
  } catch (error) {
    console.error("Profile update failed:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
