import { z } from "zod";
import type { RawCompany, Company } from "./types";

export const companyDtoSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  domain: z.string(),
  industry: z.string(),
  size: z.string(),
  logoUrl: z.string().nullable(),
  website: z.string().nullable(),
  websiteUrl: z.string().nullable(),
  location: z.string().nullable(),
  locationName: z.string().nullable(),
  governorate: z.string().nullable(),
  country: z.string(),
  bio: z.string().nullable(),
  description: z.string().nullable(),
  sector: z.string().nullable().optional(),
  techStack: z.array(z.string()),
  isVerified: z.boolean(),
  subscriptionTier: z.string(),
  maxRecruiters: z.number(),
  rating: z.number().default(5.0),
  reviews: z.number().default(0),
});

export type CompanyDto = z.infer<typeof companyDtoSchema>;

export function toCompanyDto(raw: RawCompany): Company {
  const loc = raw.locationName || `${raw.governorate || "Cairo"}, ${raw.country || "Egypt"}`;
  return companyDtoSchema.parse({
    id: raw.id,
    slug: raw.slug,
    name: raw.name,
    domain: raw.domain,
    industry: String(raw.industry),
    size: String(raw.size),
    logoUrl: raw.logoUrl,
    website: raw.websiteUrl,
    websiteUrl: raw.websiteUrl,
    location: loc,
    locationName: raw.locationName,
    governorate: raw.governorate,
    country: raw.country,
    bio: raw.bio,
    description: raw.bio,
    sector: String(raw.industry),
    techStack: raw.techStack ?? [],
    isVerified: raw.isVerified,
    subscriptionTier: raw.subscriptionTier,
    maxRecruiters: raw.maxRecruiters,
    rating: 5.0,
    reviews: 0,
  });
}
