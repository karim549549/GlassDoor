"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type FormData = z.infer<typeof schema>;

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
}

export function ForgotPasswordForm({ onBackToLogin }: ForgotPasswordFormProps) {
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
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });

      const body = await res.json();
      if (!res.ok) {
        setError(body.error || "Failed to send reset link.");
      } else {
        setSuccess(body.message || "Reset link sent! Check your inbox.");
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
            Check your email
          </h2>
          <p className="font-mono text-[0.75rem] text-muted-foreground uppercase tracking-wide leading-relaxed">
            {success}
          </p>
        </div>
        <Button
          onClick={onBackToLogin}
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Sign In
        </Button>
      </div>
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
          Enter your email to receive a recovery link
        </p>

        {error && (
          <div className="p-3 bg-accent/10 border border-accent/30 text-accent font-mono text-[0.65rem] uppercase tracking-wider mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1 text-left">
            <label className="font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground">
              Email Address
            </label>
            <Input
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
            Send recovery link
          </Button>
        </form>
      </div>
    </div>
  );
}
export default ForgotPasswordForm;
