"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { KeyRound, CheckCircle } from "lucide-react";

const schema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

interface ChangePasswordFormProps {
  onSuccess: () => void;
}

export function ChangePasswordForm({ onSuccess }: ChangePasswordFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
    setSuccess(null);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: data.password }),
      });

      const body = await res.json();
      if (!res.ok) {
        setError(body.error || "Failed to update password.");
      } else {
        setSuccess(body.message || "Password updated successfully!");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col h-full justify-between">
        <div className="text-center py-8">
          <CheckCircle className="h-12 w-12 text-foreground mx-auto mb-4" />
          <h2 className="font-display text-[2rem] leading-none mb-4 text-foreground">
            Password Updated
          </h2>
          <p className="font-mono text-[0.75rem] text-muted-foreground uppercase tracking-wide leading-relaxed">
            {success}
          </p>
        </div>
        <Button
          onClick={onSuccess}
          className="w-full flex items-center justify-center gap-2"
        >
          Go to Homepage
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        <h2 className="font-display text-[2rem] leading-none mb-2 text-foreground">
          New password
        </h2>
        <p className="font-mono text-[0.65rem] text-muted-foreground uppercase tracking-wider mb-8">
          Enter your new password below
        </p>

        {error && (
          <div className="p-3 bg-accent/10 border border-accent/30 text-accent font-mono text-[0.65rem] uppercase tracking-wider mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1 text-left">
            <label className="font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground">
              New Password
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              {...register("password")}
              error={errors.password?.message}
            />
            {errors.password && (
              <p className="font-mono text-[0.55rem] text-accent mt-1 uppercase tracking-wider">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-1 text-left">
            <label className="font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground">
              Confirm Password
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              {...register("confirmPassword")}
              error={errors.confirmPassword?.message}
            />
            {errors.confirmPassword && (
              <p className="font-mono text-[0.55rem] text-accent mt-1 uppercase tracking-wider">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full flex items-center justify-center gap-2 mt-4"
          >
            <KeyRound className="h-3.5 w-3.5" />
            Update password
          </Button>
        </form>
      </div>
    </div>
  );
}
export default ChangePasswordForm;
