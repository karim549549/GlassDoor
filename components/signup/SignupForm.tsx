"use client";

import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { upsertSavedAccount } from "@/lib/client/saved-accounts";
import { useAuthFormAnimation } from "@/components/login/shared/useAuthFormAnimation";
import { AuthErrorBanner } from "@/components/login/shared/AuthErrorBanner";
import { OAuthOptions } from "@/components/login/shared/OAuthOptions";
import { RoleSelector } from "./RoleSelector";
import { SignupFormFields } from "./SignupFormFields";
import { SignupSuccessPanel } from "./SignupSuccessPanel";

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

export type SignupSchemaType = z.infer<typeof signupSchema>;

export default function SignupForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

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

  useAuthFormAnimation({ containerRef, titleRef, formRef, footerRef });

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
        upsertSavedAccount({
          email: data.email,
          name: data.fullName || data.email.split("@")[0],
          refreshToken: result.session?.refreshToken || null,
        });

        setIsSuccess(true);
        setIsLoading(false);
      }
    } catch {
      setServerError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return <SignupSuccessPanel />;
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

      <AuthErrorBanner message={serverError} />

      <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <RoleSelector selectedRole={selectedRole} onSelect={(role) => setValue("roleName", role)} />

        <SignupFormFields register={register} errors={errors} disabled={isLoading} />

        <div className="pt-2">
          <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
            Create account
          </Button>
        </div>
      </form>

      <OAuthOptions />

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
