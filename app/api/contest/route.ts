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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const status = searchParams.get("status") || "all";
    const access = searchParams.get("access") || "all";
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "newest";
    const tab = searchParams.get("tab") || "all";

    const skip = (page - 1) * limit;
    const take = limit;

    const where: any = {};

    // 1. Tab Scope Filter
    if (tab === "my") {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: "Unauthorized scope query." }, { status: 401 });
      }
      where.OR = [
        { creatorId: user.id },
        {
          teams: {
            some: {
              members: {
                some: {
                  userId: user.id
                }
              }
            }
          }
        }
      ];
    }

    // 2. Status Filter
    if (status === "open") {
      where.status = "REGISTRATION_OPEN";
    } else if (status === "active") {
      where.status = { in: ["IDEA_PHASE", "IMPLEMENTATION_PHASE"] };
    } else if (status === "completed") {
      where.status = "COMPLETED";
    }

    // 3. Access Filter
    if (access === "public") {
      where.isPrivate = false;
    } else if (access === "private") {
      where.isPrivate = true;
    }

    // 4. Search Filter
    if (search.trim()) {
      // If we already have OR conditions (e.g. from tab='my'), wrap them logically
      const searchConditions = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { rulesText: { contains: search, mode: "insensitive" } }
      ];
      
      if (where.OR) {
        where.AND = [
          { OR: where.OR },
          { OR: searchConditions }
        ];
        delete where.OR;
      } else {
        where.OR = searchConditions;
      }
    }

    // 5. Sorting
    let orderBy: any = {};
    if (sortBy === "newest") {
      orderBy = { registrationStart: "desc" };
    } else if (sortBy === "oldest") {
      orderBy = { registrationStart: "asc" };
    } else if (sortBy === "title") {
      orderBy = { title: "asc" };
    } else if (sortBy === "teams") {
      orderBy = { teams: { _count: "desc" } };
    }

    // 6. DB Queries
    const [contests, total] = await Promise.all([
      prisma.contest.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          teams: {
            include: {
              members: true
            }
          }
        }
      }),
      prisma.contest.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      contests,
      total,
      totalPages,
      currentPage: page
    });
  } catch (error) {
    console.error("Contest fetch API error:", error);
    return NextResponse.json({ error: "Failed to fetch contests." }, { status: 500 });
  }
}
