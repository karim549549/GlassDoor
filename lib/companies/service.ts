import "server-only";
import { Prisma, type IndustryType, type CompanySize } from "@prisma/client";
import prisma from "@/lib/server/prisma";
import type { CompanyListQuery, CompanyCreateInput } from "./schema";
import { COMPANY_SELECT, type RawCompany } from "./types";

export { COMPANY_SELECT };

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface ListCompaniesResult {
  companies: RawCompany[];
  total: number;
}

export async function listCompanies(query: CompanyListQuery): Promise<ListCompaniesResult> {
  const { q, industry, limit } = query;

  const where: Prisma.CompanyWhereInput = {
    isDeleted: false,
  };

  if (industry) {
    where.industry = industry as IndustryType;
  }

  if (q.trim()) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { domain: { contains: q, mode: "insensitive" } },
      { bio: { contains: q, mode: "insensitive" } },
    ];
  }

  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where,
      orderBy: { name: "asc" },
      take: limit,
      select: COMPANY_SELECT,
    }),
    prisma.company.count({ where }),
  ]);

  return {
    companies,
    total,
  };
}

export async function getCompanyByIdOrSlug(idOrSlug: string): Promise<RawCompany | null> {
  const where: Prisma.CompanyWhereInput = {
    isDeleted: false,
    ...(UUID_PATTERN.test(idOrSlug) ? { id: idOrSlug } : { slug: idOrSlug.toLowerCase() }),
  };

  return prisma.company.findFirst({
    where,
    select: COMPANY_SELECT,
  });
}

export async function createCompany(data: CompanyCreateInput, ownerUserId: string) {
  const slug = data.name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const existing = await prisma.company.findFirst({
    where: {
      OR: [{ domain: data.domain.toLowerCase().trim() }, { slug }],
    },
  });

  if (existing) {
    return { error: "A company with this name or domain already exists." };
  }

  const company = await prisma.company.create({
    data: {
      name: data.name.trim(),
      slug,
      domain: data.domain.toLowerCase().trim(),
      bio: data.bio || null,
      websiteUrl: data.websiteUrl || null,
      locationName: data.locationName || null,
      governorate: data.governorate || "Cairo",
      industry: data.industry as IndustryType,
      size: data.size as CompanySize,
      techStack: data.techStack ?? [],
      members: {
        create: {
          userId: ownerUserId,
          role: "OWNER",
          isAccepted: true,
          isApproved: true,
        },
      },
    },
    select: COMPANY_SELECT,
  });

  return { company };
}

/**
 * The caller's seat at a company, or null if they have none.
 *
 * Shaped for `resolveArenaAuthority`, which decides whether an arena may be
 * published under a company's name. It returns the seat rather than a boolean
 * so the decision - which roles count, whether a pending invite counts - stays
 * in one pure, tested place instead of being spread across queries.
 */
export async function getCompanyStanding(userId: string, companyId: string) {
  return prisma.companyMember.findUnique({
    where: { companyId_userId: { companyId, userId } },
    select: { companyId: true, role: true, isAccepted: true, isApproved: true },
  });
}

export async function listCompanySlugs(): Promise<{ slug: string; updatedAt: Date }[]> {
  return prisma.company.findMany({
    where: { isDeleted: false },
    select: { slug: true, updatedAt: true },
  });
}

