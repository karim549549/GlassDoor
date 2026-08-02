import * as z from "zod";
import { isSafeHttpUrl } from "@/lib/url";
import { EGYPTIAN_UNIVERSITIES, EGYPT_LOCATIONS } from "./constants";

/**
 * Single source of truth for the employment-status/seniority enums. Both the
 * edit-profile form's <select> options and the API route's validation read
 * from here - previously these were hand-duplicated (hardcoded <option>
 * values in EditProfileModal.tsx, a separate local const tuple in
 * app/api/profile/update/route.ts), which could silently drift out of sync.
 */
export const EMPLOYMENT_STATUS_VALUES = ["UNEMPLOYED", "EMPLOYED", "FREELANCER", "INTERN", "STUDENT"] as const;
export const SENIORITY_VALUES = ["JUNIOR", "MID", "SENIOR", "LEAD", "MANAGER"] as const;

export type EmploymentStatus = (typeof EMPLOYMENT_STATUS_VALUES)[number];
export type Seniority = (typeof SENIORITY_VALUES)[number];

/**
 * Statuses for which the form requires (and displays) a current employer.
 * Exported so the client section that shows/hides the field and the service
 * that nulls it out server-side both read the same list.
 */
export const EMPLOYER_REQUIRED_STATUSES: readonly EmploymentStatus[] = ["EMPLOYED", "FREELANCER", "INTERN"];

const emptyToUndefined = (val: unknown) => (val === "" || val === null || val === undefined ? undefined : val);

const optionalTrimmedString = z.preprocess(emptyToUndefined, z.string().trim()).optional();

const optionalUrlSchema = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .trim()
    .refine(isSafeHttpUrl, { message: "Must be a valid URL starting with http:// or https://" })
    .optional()
);

/**
 * A plain-string field narrowed to one of `values` on output, but whose
 * *input* type stays a plain string - so an unselected native <select>'s ""
 * value type-checks going in, matching yup's `.required()` (no bare `.oneOf`
 * check) behavior the client previously had.
 */
function requiredEnumField<T extends readonly [string, ...string[]]>(values: T, message: string) {
  return z.string().refine((val): val is T[number] => (values as readonly string[]).includes(val), { message });
}

/**
 * Base field-level rules, exported separately so callers (e.g. per-section
 * progress checks, mirroring lib/contest/schema.ts's contestBaseSchema) can
 * validate a subset of fields via `.pick()` without the cross-field
 * `.superRefine()` below, which zod only allows on the full object.
 */
export const profileBaseSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
  handle: optionalTrimmedString,
  bio: optionalTrimmedString,
  employmentStatus: requiredEnumField(EMPLOYMENT_STATUS_VALUES, "Employment status is required"),
  currentEmployer: optionalTrimmedString,
  seniority: requiredEnumField(SENIORITY_VALUES, "Seniority level is required"),
  education: z
    .string()
    .trim()
    .min(1, "Education (University) is required")
    .refine((val) => (EGYPTIAN_UNIVERSITIES as readonly string[]).includes(val), {
      message: "Please select a valid Egyptian university",
    }),
  location: z
    .string()
    .trim()
    .min(1, "Location is required")
    .refine((val) => (EGYPT_LOCATIONS as readonly string[]).includes(val), {
      message: "Please select a valid location",
    }),
  githubUrl: optionalUrlSchema,
  linkedinUrl: optionalUrlSchema,
  portfolioUrl: optionalUrlSchema,
  skills: z.array(z.string()).optional().default([]),
  jobTypes: z.array(z.string()).min(1, "Current job title is required"),
});

/**
 * Single source of truth for profile-edit validation, consumed by both the
 * client form (components/profile/EditProfileModal.tsx) and the API route
 * (app/api/profile/update/route.ts). currentEmployer is only required when
 * the selected employment status implies one (matches the form's show/hide
 * behavior for that field).
 */
export const profileSchema = profileBaseSchema.superRefine((data, ctx) => {
  if (EMPLOYER_REQUIRED_STATUSES.includes(data.employmentStatus) && !data.currentEmployer) {
    ctx.addIssue({
      code: "custom",
      message: "Employer is required",
      path: ["currentEmployer"],
    });
  }
});

export type ProfileFormInput = z.input<typeof profileSchema>;
export type ProfileFormOutput = z.output<typeof profileSchema>;
