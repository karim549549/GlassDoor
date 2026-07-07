import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";

export async function GET() {
  try {
    const [skills, jobTypes] = await Promise.all([
      prisma.skill.findMany({ orderBy: { name: "asc" } }),
      prisma.jobType.findMany({ orderBy: { name: "asc" } }),
    ]);
    return NextResponse.json({ skills, jobTypes });
  } catch (error: any) {
    console.error("Metadata fetch failed:", error);
    return NextResponse.json({ error: "Failed to fetch options metadata" }, { status: 500 });
  }
}
