import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { withApiErrorHandling } from "@/lib/server/api-route";

export async function GET() {
  return withApiErrorHandling(
    "Metadata fetch API error",
    async () => {
      const [skills, jobTypes] = await Promise.all([
        prisma.skill.findMany({ orderBy: { name: "asc" } }),
        prisma.jobType.findMany({ orderBy: { name: "asc" } }),
      ]);
      return NextResponse.json({ skills, jobTypes });
    },
    "Failed to fetch options metadata"
  );
}
