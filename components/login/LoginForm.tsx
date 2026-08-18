"use client";

import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { loginSchema } from "@/lib/auth/schema";
import { useAuthStore } from "@/lib/client/useAuthStore";
import { upsertSavedAccount } from "@/lib/client/saved-accounts";
import { logger } from "@/lib/client/logger";
import { authLandingPath } from "@/lib/auth/landing";
import { currentRedirectTo } from "@/lib/client/redirect-target";
import { useAuthFormAnimation } from "@/components/login/shared/useAuthFormAnimation";
import { AuthErrorBanner } from "@/components/login/shared/AuthErrorBanner";
import { OAuthOptions } from "@/components/login/shared/OAuthOptions";
import { LoginFormFields } from "./LoginFormFields";

export type LoginSchemaType = z.infer<typeof loginSchema>;

interface LoginFormProps {
  prefilledEmail?: string;
  onBackToSwitcher?: () => void;
}

export default function LoginForm({ prefilledEmail, onBackToSwitcher }: LoginFormProps = {}) {
  const { setAuth } = useAuthStore();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: prefilledEmail ? { email: prefilledEmail } : undefined,
  });

  useAuthFormAnimation({ containerRef, titleRef, formRef, footerRef });

  const onSubmit = async (data: LoginSchemaType) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        setServerError(result.error || "Login failed.");
        setIsLoading(false);
      } else {
        upsertSavedAccount({
          email: data.email,
          name: result.user?.fullName || data.email.split("@")[0],
        });

        // Re-verify against the server rather than trusting the client-supplied
        // role, then navigate via the router so the RSC cache picks up the new
        // session instead of forcing a full page reload.
        const meRes = await fetch("/api/auth/me");
        const meData = await meRes.json();
        if (meData.authenticated && meData.user) {
          setAuth(meData.user, meData.roles);
        } else {
          setAuth(result.user, ["USER"]);
        }

        const finalTarget = authLandingPath(result.user.id, currentRedirectTo());
        router.push(finalTarget);
        router.refresh();
      }
    } catch (err) {
      logger.error("Login request failed", {
        error: err instanceof Error ? err.message : String(err),
      });
      setServerError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-full"
    >
      {onBackToSwitcher && (
        <button
          onClick={onBackToSwitcher}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-mono text-[0.65rem] uppercase tracking-wider mb-6 bg-transparent border-none cursor-pointer p-0"
        >
          ← Back to accounts
        </button>
      )}
      <div className="mb-8">
        <h1 ref={titleRef} className="font-display text-4xl italic text-foreground tracking-tight">
          Welcome back
        </h1>
        <p className="font-mono text-[0.6rem] text-muted-foreground uppercase mt-2 tracking-widest">
          Sign in to compete, judge, and claim your credential
        </p>
      </div>

      <AuthErrorBanner message={serverError} />

      <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <LoginFormFields register={register} errors={errors} disabled={isLoading} />

        <div className="pt-2">
          <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
            Sign in
          </Button>
        </div>
      </form>

      <OAuthOptions />

      <div ref={footerRef} className="mt-8 pt-6 border-t border-border/60 text-center">
        <p className="font-mono text-[0.65rem] text-muted-foreground uppercase tracking-wider">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-foreground hover:underline transition-all duration-150"
          >
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
