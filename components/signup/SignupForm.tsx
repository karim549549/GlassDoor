"use client";

import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import gsap from "gsap";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/lib/store/useAuthStore";

const signupSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character"),
  roleName: z.enum(["USER", "COMPANY"]),
});

type SignupSchemaType = z.infer<typeof signupSchema>;

export default function SignupForm() {
  const { setAuth } = useAuthStore();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignupSchemaType>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      roleName: "USER",
    },
  });

  const selectedRole = watch("roleName");

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

  useEffect(() => {
    if (isSuccess && successRef.current) {
      gsap.fromTo(
        successRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)" }
      );
    }
  }, [isSuccess]);

  const onSubmit = async (data: SignupSchemaType) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          fullName: data.fullName,
          roleName: data.roleName,
        }),
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        setServerError(result.error || "Registration failed.");
        setIsLoading(false);
      } else if (result.success) {
        if (rememberMe) {
          try {
            const stored = localStorage.getItem("devs_arena_saved_users");
            let accounts = stored ? JSON.parse(stored) : [];
            const existingIndex = accounts.findIndex(
              (acc: any) => acc.email.toLowerCase() === data.email.toLowerCase()
            );

            const accountData = {
              email: data.email,
              name: data.fullName || data.email.split("@")[0],
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
        }

        setIsSuccess(true);
        setIsLoading(false);
      }
    } catch {
      setServerError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div
        ref={successRef}
        className="w-full text-center"
      >
        <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-orange">
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="font-display text-3xl italic text-foreground tracking-tight mb-3">
          Check your email
        </h2>
        <p className="font-sans text-sm text-muted-foreground mb-8">
          We have sent a verification link to your email address to complete registration.
        </p>
        <Link href="/login" passHref legacyBehavior>
          <Button variant="primary" className="w-full">
            Proceed to Sign In
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full"
    >
      <div className="mb-8">
        <h1 ref={titleRef} className="font-display text-4xl italic text-foreground tracking-tight">
          Create account
        </h1>
        <p className="font-mono text-[0.6rem] text-muted-foreground uppercase mt-2 tracking-widest">
          Join the community for Egyptian market transparency
        </p>
      </div>

      {serverError && (
        <div className="mb-6 p-3 bg-destructive/10 border border-destructive/20 text-accent font-mono text-[0.65rem] uppercase tracking-wider">
          {serverError}
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Editorial Role Selector */}
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground">
            I am joining as an
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setValue("roleName", "USER")}
              className={`font-mono text-[0.65rem] uppercase tracking-wider py-2 border transition-all duration-200 cursor-pointer text-center ${
                selectedRole === "USER"
                  ? "bg-foreground text-background border-foreground"
                  : "bg-transparent text-foreground border-border hover:border-foreground/45"
              }`}
            >
              Employee
            </button>
            <button
              type="button"
              onClick={() => setValue("roleName", "COMPANY")}
              className={`font-mono text-[0.65rem] uppercase tracking-wider py-2 border transition-all duration-200 cursor-pointer text-center ${
                selectedRole === "COMPANY"
                  ? "bg-foreground text-background border-foreground"
                  : "bg-transparent text-foreground border-border hover:border-foreground/45"
              }`}
            >
              Company Rep
            </button>
          </div>
        </div>

        <Input
          label="Full name"
          type="text"
          placeholder="e.g. Aly Maher"
          error={errors.fullName?.message}
          disabled={isLoading}
          {...register("fullName")}
        />

        <Input
          label="Email address"
          type="email"
          placeholder="e.g. aly.maher@company.com"
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

        {/* Remember Me Checkbox */}
        <div className="flex items-center gap-2 py-1 select-none">
          <input
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-3.5 w-3.5 accent-orange rounded-none border border-border cursor-pointer focus:ring-0 focus:ring-offset-0"
          />
          <label
            htmlFor="rememberMe"
            className="font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
          >
            Remember this account
          </label>
        </div>

        <div className="pt-2">
          <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
            Create account
          </Button>
        </div>
      </form>

      <div className="my-5 flex items-center justify-between gap-3">
        <span className="h-px bg-border/65 flex-grow" />
        <span className="font-mono text-[0.55rem] text-muted-foreground uppercase tracking-widest">or</span>
        <span className="h-px bg-border/65 flex-grow" />
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full flex items-center justify-center gap-2"
        onClick={() => {
          window.location.href = "/api/auth/oauth?provider=google";
        }}
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </Button>

      <div ref={footerRef} className="mt-8 pt-6 border-t border-border/60 text-center">
        <p className="font-mono text-[0.65rem] text-muted-foreground uppercase tracking-wider">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-foreground hover:underline transition-all duration-150"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
