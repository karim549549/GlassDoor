import { NextResponse } from "next/server";
import { createClient } from "@/lib/server/supabase/server";
import { prisma } from "@/lib/server/prisma";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    const user = session?.user;
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      firstName,
      lastName,
      handle,
      bio,
      employmentStatus,
      currentEmployer,
      seniority,
      education,
      githubUrl,
      linkedinUrl,
      portfolioUrl,
      skills, // Array of skill UUID strings
      jobTypes, // Array of jobType UUID strings
    } = body;

    // Check if handle is taken (if provided)
    if (handle) {
      const formattedHandle = handle.trim().toLowerCase().replace(/^@/, "");
      const existingUser = await prisma.user.findFirst({
        where: {
          handle: formattedHandle,
          NOT: { id: user.id },
        },
      });

      if (existingUser) {
        return NextResponse.json({ error: "Handle is already taken" }, { status: 400 });
      }
    }

    const processedHandle = handle ? handle.trim().toLowerCase().replace(/^@/, "") : null;

    // Update core user data (sequential standard queries to prevent PgBouncer transaction timeouts)
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName: firstName || null,
        lastName: lastName || null,
        fullName: firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || null,
        handle: processedHandle,
        bio: bio || null,
        employmentStatus: employmentStatus || null,
        currentEmployer: (employmentStatus === "EMPLOYED" || employmentStatus === "FREELANCER" || employmentStatus === "INTERN") ? (currentEmployer || null) : null,
        seniority: seniority || null,
        education: education || null,
        githubUrl: githubUrl || null,
        linkedinUrl: linkedinUrl || null,
        portfolioUrl: portfolioUrl || null,
      },
    });

    // Sync skills relationship
    if (skills && Array.isArray(skills)) {
      await prisma.userSkill.deleteMany({
        where: { userId: user.id },
      });

      if (skills.length > 0) {
        await prisma.userSkill.createMany({
          data: skills.map((skillId: string) => ({
            userId: user.id,
            skillId,
          })),
        });
      }
    }

    // Sync job types relationship
    if (jobTypes && Array.isArray(jobTypes)) {
      await prisma.userJobType.deleteMany({
        where: { userId: user.id },
      });

      if (jobTypes.length > 0) {
        await prisma.userJobType.createMany({
          data: jobTypes.map((jobTypeId: string) => ({
            userId: user.id,
            jobTypeId,
          })),
        });
      }
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error("Profile update failed:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
