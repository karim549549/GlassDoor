import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/server/supabase/server";
import { prisma } from "@/lib/server/prisma";
import * as z from "zod";

const contestSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  coverImageUrl: z.string().url().optional().or(z.literal("")).nullable(),
  isPrivate: z.boolean().default(false),
  inviteCode: z.string().optional().nullable(),
  registrationStart: z.string().min(1),
  registrationEnd: z.string().min(1),
  ideaPhaseStart: z.string().min(1),
  ideaPhaseEnd: z.string().min(1),
  implPhaseStart: z.string().min(1),
  implPhaseEnd: z.string().min(1),
  isTeam: z.boolean().default(false),
  minTeamSize: z.coerce.number().min(1).default(1),
  maxTeamSize: z.coerce.number().min(1).default(1),
  maxParticipants: z.coerce.number().optional().nullable(),
  requireGithubUrl: z.boolean().default(true),
  requireFigmaUrl: z.boolean().default(false),
  requireVideoUrl: z.boolean().default(false),
  requireWriteup: z.boolean().default(true),
  rulesText: z.string().min(10),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 1. Authenticate user against their session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    // 2. Parse request JSON body
    const body = await request.json();

    // 3. Validate request schema
    const parsed = contestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed.", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Validate date constraints
    const regStart = new Date(data.registrationStart);
    const regEnd = new Date(data.registrationEnd);
    if (regEnd <= regStart) {
      return NextResponse.json(
        { error: "Registration end must be after registration start date." },
        { status: 400 }
      );
    }

    // Check unique invite code if private
    if (data.isPrivate && data.inviteCode) {
      const existing = await prisma.contest.findUnique({
        where: { inviteCode: data.inviteCode },
      });
      if (existing) {
        return NextResponse.json(
          { error: "This invitation code is already in use by another arena." },
          { status: 400 }
        );
      }
    }

    // 4. Create Contest database record using Prisma
    const contest = await prisma.contest.create({
      data: {
        title: data.title,
        description: data.description,
        coverImageUrl: data.coverImageUrl || null,
        isPrivate: data.isPrivate,
        inviteCode: data.isPrivate ? data.inviteCode || null : null,
        registrationStart: new Date(data.registrationStart),
        registrationEnd: new Date(data.registrationEnd),
        ideaPhaseStart: new Date(data.ideaPhaseStart),
        ideaPhaseEnd: new Date(data.ideaPhaseEnd),
        implPhaseStart: new Date(data.implPhaseStart),
        implPhaseEnd: new Date(data.implPhaseEnd),
        isTeam: data.isTeam,
        minTeamSize: data.isTeam ? data.minTeamSize : 1,
        maxTeamSize: data.isTeam ? data.maxTeamSize : 1,
        maxParticipants: data.maxParticipants || null,
        requireGithubUrl: data.requireGithubUrl,
        requireFigmaUrl: data.requireFigmaUrl,
        requireVideoUrl: data.requireVideoUrl,
        requireWriteup: data.requireWriteup,
        rulesText: data.rulesText,
        creatorId: user.id,
        status: "REGISTRATION_OPEN", // Default initial active status
      },
    });

    return NextResponse.json({ success: true, id: contest.id });
  } catch (error: any) {
    console.error("Contest creation API error:", error);
    return NextResponse.json({ error: "An unexpected database error occurred." }, { status: 500 });
  }
}
