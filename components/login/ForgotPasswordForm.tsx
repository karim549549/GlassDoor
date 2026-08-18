"use client";

import React, { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Mail } from "lucide-react";
import { logger } from "@/lib/client/logger";
import { VerifyCodeForm } from "@/components/auth/VerifyCodeForm";
import { ChangePasswordForm } from "./ChangePasswordForm";

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type FormData = z.infer<typeof schema>;

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
}

/**
 * Reset in three steps in one place: address, code, new password.
 *
 * It used to be two disconnected halves - this form said "check your email"
 * and stopped, and the actual password field lived behind a mailed link that
 * reopened the site at /?action=reset-password. Anyone whose mail client
 * opened that link in its own embedded browser got a session in a window they
 * were not using, and the tab they started in sat on a dead end.
 *
 * The final step is the existing ChangePasswordForm, unchanged: verifying the
 * code establishes a real session, which is exactly what
 * /api/auth/change-password already requires.
 */
export function ForgotPasswordForm({ onBackToLogin }: ForgotPasswordFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [devBypass, setDevBypass] = useState(false);
  const [verified, setVerified] = useState(false);
  const emailId = useId();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });

      const body = await res.json();
      if (!res.ok) {
        setError(body.error || "Failed to send a code.");
      } else {
        setDevBypass(Boolean(body.devBypass));
        setSentTo(data.email);
      }
    } catch (err) {
      logger.error("Reset password request failed", {
        error: err instanceof Error ? err.message : String(err),
      });
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (verified) {
    return <ChangePasswordForm onSuccess={onBackToLogin} />;
  }

  if (sentTo) {
    return (
      <VerifyCodeForm
        email={sentTo}
        purpose="recovery"
        devBypass={devBypass}
        title="Enter your code"
        onVerified={() => setVerified(true)}
        onBack={() => setSentTo(null)}
        backLabel="Use a different email"
      />
    );
  }

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        <button
          onClick={onBackToLogin}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-mono text-[0.65rem] uppercase tracking-wider mb-6 bg-transparent border-none cursor-pointer p-0"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to login
        </button>

        <h2 className="font-display text-[2rem] leading-none mb-2 text-foreground">
          Reset password
        </h2>
        <p className="font-mono text-[0.65rem] text-muted-foreground uppercase tracking-wider mb-8">
          Enter your email to receive a six-digit code
        </p>

        {error && (
          <div className="p-3 bg-accent/10 border border-accent/30 text-accent font-mono text-[0.65rem] uppercase tracking-wider mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1 text-left">
            <label htmlFor={emailId} className="font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground">
              Email Address
            </label>
            <Input
              id={emailId}
              type="email"
              placeholder="e.g., mail@example.com"
              {...register("email")}
              error={errors.email?.message}
            />
            {errors.email && (
              <p className="font-mono text-[0.55rem] text-accent mt-1 uppercase tracking-wider">
                {errors.email.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full flex items-center justify-center gap-2 mt-2"
          >
            <Mail className="h-3.5 w-3.5" />
            Send code
          </Button>
        </form>
      </div>
    </div>
  );
}
export default ForgotPasswordForm;
