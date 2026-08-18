import * as z from "zod";

/**
 * Email verification by code, not by link.
 *
 * The link flow it replaced asked a reader to leave the tab, find the mail,
 * and click through - which lands the session in whichever browser the mail
 * client happens to embed, not the one they signed up in. A code is read in
 * the mail app and typed where they already are, so the tab that started the
 * flow is the tab that finishes it.
 */
export const OTP_LENGTH = 6;

/**
 * The two moments this app asks for a code. Supabase's own `EmailOtpType` is a
 * wider union (`email_change`, `invite`, `magiclink`) that nothing here sends,
 * so it is narrowed at the boundary: an unsupported value cannot reach
 * verifyOtp, and the union is exhaustive at compile time.
 */
export const OTP_PURPOSES = ["signup", "recovery"] as const;
export type OtpPurpose = (typeof OTP_PURPOSES)[number];

const CODE_PATTERN = new RegExp(`^\d{${OTP_LENGTH}}$`);

export const otpCodeSchema = z
  .string()
  .trim()
  .regex(CODE_PATTERN, `Enter the ${OTP_LENGTH}-digit code from your email`);

export const verifyOtpSchema = z.object({
  email: z.email("Please enter a valid email address"),
  code: otpCodeSchema,
  purpose: z.enum(OTP_PURPOSES),
});

export const resendOtpSchema = z.object({
  email: z.email("Please enter a valid email address"),
  purpose: z.enum(OTP_PURPOSES),
});

export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type ResendOtpInput = z.infer<typeof resendOtpSchema>;

/**
 * Seconds before "Resend code" becomes available again. Client-side courtesy
 * only - the real cap is the rate limit on /api/auth/resend-otp, which a
 * caller cannot skip by reloading the page.
 */
export const RESEND_COOLDOWN_SECONDS = 45;
