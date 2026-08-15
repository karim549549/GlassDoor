import { z } from "zod";

export const companyListQuerySchema = z.object({
  q: z.string().trim().default(""),
  industry: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export type CompanyListQuery = z.infer<typeof companyListQuerySchema>;

export const companyCreateSchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters."),
  domain: z.string().min(3, "Valid company domain is required (e.g. coon.ai)."),
  bio: z.string().optional(),
  websiteUrl: z.string().url("Valid website URL required.").optional().or(z.literal("")),
  locationName: z.string().optional(),
  governorate: z.string().default("Cairo"),
  industry: z.enum([
    "FINTECH",
    "ARTIFICIAL_INTELLIGENCE",
    "HEALTH_TECH",
    "E_COMMERCE",
    "ED_TECH",
    "LOGISTICS_SUPPLY_CHAIN",
    "CYBERSECURITY",
    "DEVELOPER_TOOLS",
    "GAMING_ENTERTAINMENT",
    "ENTERPRISE_SAAS",
    "TELECOMMUNICATIONS",
    "GREEN_TECH",
    "OTHER",
  ]).default("DEVELOPER_TOOLS"),
  size: z.enum(["SEED", "STARTUP", "GROWTH", "MID_MARKET", "ENTERPRISE"]).default("STARTUP"),
  techStack: z.array(z.string()).default([]),
});

export type CompanyCreateInput = z.infer<typeof companyCreateSchema>;
