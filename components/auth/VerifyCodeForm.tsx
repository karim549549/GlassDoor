"use client";

import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { ArrowLeft, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AuthErrorBanner } from "@/components/login/shared/AuthErrorBanner";
import { OtpInput } from "./OtpInput";
import { OTP_LENGTH, RESEND_COOLDOWN_SECONDS, type OtpPurpose } from "@/lib/auth/otp";
import { logger } from "@/lib/client/logger";

export interface VerifiedUser {
  id: string;
  email: string | null;
  fullName: string | null;
}

interface VerifyCodeFormProps {
  email: string;
  purpose: OtpPurpose;
  onVerified: (user: VerifiedUser) => void;
  /** Rendered as "Use a different email" / "Back to sign in" when provided. */
  onBack?: () => void;
  backLabel?: string;
  title?: string;
  /** Sentence under the heading. Defaults to the signup wording. */
  hint?: string;
  /**
   * True when DEV_OTP_CODE is set on the server. Reported by the route that
   * sent the code rather than read from NODE_ENV here, because the bypass is
   * deliberately usable on the pre-launch deployment - where NODE_ENV is
   * "production" and a build-time check would render nothing.
   */
  devBypass?: boolean;
}

/**
 * The code screen, shared by signup and password reset.
 *
 * Both flows previously ended on a dead-end "check your email" panel with
 * nothing to do on it - the reader had to leave for their inbox and come back
 * through a link, which lands the session in whatever browser the mail client
 * embeds rather than the one they started in. The step that used to be a
 * full stop is now the step that finishes the job.
 */
export function VerifyCodeForm({
  email,
  purpose,
  onVerified,
  onBack,
  backLabel = "Use a different email",
  title = "Check your email",
  hint,
  devBypass = false,
}: VerifyCodeFormProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const statusId = useId();

  // Guards the auto-submit: onComplete fires on every keystroke that leaves the
  // field full, so a corrected digit could otherwise fire a second request
  // while the first is still open.
  const inFlight = useRef(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setInterval(() => setCooldown((s) => (s <= 1 ? 0 : s - 1)), 1000);
    return () => window.clearInterval(id);
  }, [cooldown]);

  const verify = useCallback(
    async (submitted: string) => {
      if (inFlight.current) return;
      inFlight.current = true;
      setIsVerifying(true);
      setError(null);
      setNotice(null);

      try {
        const res = await fetch("/api/auth/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code: submitted, purpose }),
        });
        const body = await res.json();

        if (!res.ok || !body.success) {
          setError(body.error || "That code did not work. Try again.");
          setCode("");
          return;
        }

        onVerified(body.user as VerifiedUser);
      } catch (err) {
        logger.error("OTP verification request failed", {
          error: err instanceof Error ? err.message : String(err),
        });
        setError("An unexpected error occurred. Please try again.");
      } finally {
        inFlight.current = false;
        setIsVerifying(false);
      }
    },
    [email, purpose, onVerified]
  );

  const resend = async () => {
    if (cooldown > 0) return;
    setError(null);
    setNotice(null);
    setCooldown(RESEND_COOLDOWN_SECONDS);

    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error || "Could not send a new code just yet.");
        return;
      }
      setNotice("A new code is on its way.");
    } catch (err) {
      logger.error("Resend code request failed", {
        error: err instanceof Error ? err.message : String(err),
      });
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <div className="mb-5 inline-flex h-11 w-11 items-center justify-center border border-foreground/20 bg-secondary text-orange">
          <MailCheck className="h-5 w-5" />
        </div>
        <h1 className="font-display text-[2.2rem] italic leading-none tracking-tight text-foreground">
          {title}
        </h1>
        <p className="mt-3 font-sans text-sm leading-relaxed text-muted-foreground">
          {hint ?? `We sent a ${OTP_LENGTH}-digit code to `}
          <span className="font-medium text-foreground">{email}</span>. Enter it
          below to finish.
        </p>
      </div>

      <AuthErrorBanner message={error} />

      {/* Deliberately loud. While DEV_OTP_CODE is set, anyone who knows it
          can sign in as any address, and the likeliest way that becomes a
          real problem is nobody remembering it is on. The value itself never
          leaves the server - only the fact that it is active. */}
      {devBypass && (
        <p className="mb-5 border-2 border-orange bg-orange/10 p-3 font-mono text-[0.58rem] uppercase leading-relaxed tracking-wider text-orange-ink">
          Test mode: DEV_OTP_CODE is set on the server, so a known fixed code
          signs in as any address here. Remove it before signups open.
        </p>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (code.length === OTP_LENGTH) verify(code);
        }}
        className="space-y-5"
      >
        <OtpInput
          value={code}
          onChange={(next) => {
            setCode(next);
            if (error) setError(null);
          }}
          onComplete={verify}
          disabled={isVerifying}
          invalid={Boolean(error)}
          describedBy={statusId}
        />

        {/* aria-live so the resend confirmation and the countdown are announced
            rather than only seen - this region is the only feedback a reader
            gets that pressing "resend" did anything. */}
        <p
          id={statusId}
          aria-live="polite"
          className="min-h-[1rem] font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground"
        >
          {notice ?? (cooldown > 0 ? `You can request a new code in ${cooldown}s` : "")}
        </p>

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          isLoading={isVerifying}
          disabled={code.length !== OTP_LENGTH}
        >
          Verify
        </Button>
      </form>

      <div className="mt-8 flex flex-col gap-4 border-t border-border/60 pt-6 text-center">
        <button
          type="button"
          onClick={resend}
          disabled={cooldown > 0}
          className="cursor-pointer border-none bg-transparent p-0 font-mono text-[0.65rem] uppercase tracking-wider text-foreground transition-opacity hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline"
        >
          {cooldown > 0 ? `Resend code (${cooldown}s)` : "Resend code"}
        </button>

        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mx-auto flex cursor-pointer items-center gap-2 border-none bg-transparent p-0 font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" />
            {backLabel}
          </button>
        )}
      </div>
    </div>
  );
}

export default VerifyCodeForm;
