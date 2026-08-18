import * as z from "zod";
import { handleSchema } from "@/lib/user/handle";

/**
 * Single source of truth for credential validation, imported by the login and
 * signup forms, the signup route, and the change-password route.
 *
 * Previously each of those carried its own `min(6)` - and the signup route had
 * no server-side password rule at all, deferring entirely to whatever the
 * Supabase project default happened to be.
 */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  // bcrypt silently truncates past 72 bytes; reject rather than truncate so a
  // user's long passphrase never means something different than they typed.
  .max(72, "Password must be at most 72 characters")
  // The four complexity rules came from the signup form's original local
  // schema. They are kept here rather than dropped, and now also apply to
  // change-password - which previously enforced nothing but `length >= 6`.
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character");

/**
 * Roles a caller may self-assign at signup. Deliberately excludes ADMIN:
 * app/api/auth/signup/route.ts used to destructure `roleName` straight from
 * the request body and pass it to syncUser(), whose signature accepts "ADMIN".
 */
export const SELF_ASSIGNABLE_ROLES = ["USER", "COMPANY"] as const;
export type SelfAssignableRole = (typeof SELF_ASSIGNABLE_ROLES)[number];

export const signupSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: passwordSchema,
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
  // Collected at signup rather than left for a later profile edit. The column
  // has existed since the schema was written and nothing ever set it, so every
  // profile addressed itself by uuid; asking once here is what finally makes
  // /u/<handle> possible. See lib/user/handle.ts for the rules.
  handle: handleSchema,
  roleName: z.enum(SELF_ASSIGNABLE_ROLES).default("USER"),
});

/**
 * Login deliberately does NOT reuse passwordSchema: an existing account may
 * have been created under the old 6-character rule with no complexity
 * requirement, and rejecting it client-side would lock that user out of the
 * very form they need in order to change it. The policy is enforced when a
 * password is SET, never when one is presented.
 */
export const loginSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const changePasswordSchema = z.object({
  password: passwordSchema,
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
