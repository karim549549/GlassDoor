"use client";

import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import gsap from "gsap";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/lib/store/useAuthStore";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginSchemaType = z.infer<typeof loginSchema>;

interface LoginFormProps {
  prefilledEmail?: string;
  onBackToSwitcher?: () => void;
}

export default function LoginForm({ prefilledEmail, onBackToSwitcher }: LoginFormProps = {}) {
  const { setAuth } = useAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirectTo = searchParams.get("redirectTo") || "/profile";
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

  useEffect(() => {
    // Elegant entrance animation using GSAP
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        containerRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8 }
      );

      tl.fromTo(
        titleRef.current,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.6 },
        "-=0.4"
      );

      if (formRef.current) {
        const formElements = formRef.current.children;
        tl.fromTo(
          formElements,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 },
          "-=0.3"
        );
      }

      tl.fromTo(
        footerRef.current,
        { opacity: 0 },
        { opacity: 0.55, duration: 0.6 },
        "-=0.2"
      );
    });

    return () => ctx.revert();
  }, []);

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
        try {
          const stored = localStorage.getItem("devs_arena_saved_users");
          let accounts = stored ? JSON.parse(stored) : [];
          const existingIndex = accounts.findIndex(
            (acc: any) => acc.email.toLowerCase() === data.email.toLowerCase()
          );

          const accountData = {
            email: data.email,
            name: result.user?.fullName || data.email.split("@")[0],
            refreshToken: result.session?.refreshToken || null,
          };

          if (existingIndex > -1) {
            accounts[existingIndex] = accountData;
          } else {
            accounts.push(accountData);
          }
          localStorage.setItem("devs_arena_saved_users", JSON.stringify(accounts));
        } catch (e) {
          console.error("Failed to save local account", e);
        }

        // Instantly update active auth state so header updates and modal closes
        setAuth(result.user, ["USER"]);

        const finalTarget = redirectTo === "/profile" ? `/user/${result.user.id}` : redirectTo;
        router.push(finalTarget);
        router.refresh();
      }
    } catch {
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
          Sign in to access salary transparency in Egypt
        </p>
      </div>

      {serverError && (
        <div className="mb-6 p-3 bg-destructive/10 border border-destructive/20 text-accent font-mono text-[0.65rem] uppercase tracking-wider">
          {serverError}
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Email address"
          type="email"
          placeholder="e.g. name@company.com"
          error={errors.email?.message}
          disabled={isLoading}
          {...register("email")}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          disabled={isLoading}
          {...register("password")}
        />

        <div className="pt-2">
          <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
            Sign in
          </Button>
        </div>
      </form>

      <div className="my-5 flex items-center justify-between gap-3">
        <span className="h-px bg-border/65 flex-grow" />
        <span className="font-mono text-[0.55rem] text-muted-foreground uppercase tracking-widest">or</span>
        <span className="h-px bg-border/65 flex-grow" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex items-center justify-center gap-2"
          onClick={() => {
            window.location.href = `/api/auth/oauth?provider=google&redirectTo=${encodeURIComponent(redirectTo)}`;
          }}
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          Google
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex items-center justify-center gap-2"
          onClick={() => {
            window.location.href = `/api/auth/oauth?provider=github&redirectTo=${encodeURIComponent(redirectTo)}`;
          }}
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
          </svg>
          GitHub
        </Button>
      </div>

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
