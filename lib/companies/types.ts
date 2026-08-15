import type { Prisma } from "@prisma/client";

export const COMPANY_SELECT = {
  id: true,
  slug: true,
  name: true,
  domain: true,
  industry: true,
  size: true,
  logoUrl: true,
  websiteUrl: true,
  locationName: true,
  governorate: true,
  country: true,
  bio: true,
  techStack: true,
  isVerified: true,
  subscriptionTier: true,
  maxRecruiters: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.CompanySelect;

export type RawCompany = Prisma.CompanyGetPayload<{ select: typeof COMPANY_SELECT }>;

export interface Company {
  id: string;
  slug: string;
  name: string;
  domain: string;
  industry: string;
  size: string;
  logoUrl: string | null;
  website: string | null;
  websiteUrl: string | null;
  location: string | null;
  locationName: string | null;
  governorate: string | null;
  country: string;
  bio: string | null;
  description: string | null;
  sector?: string | null;
  techStack: string[];
  isVerified: boolean;
  subscriptionTier: string;
  maxRecruiters: number;
  rating: number;
  reviews: number;
  roles?: unknown[];
}
