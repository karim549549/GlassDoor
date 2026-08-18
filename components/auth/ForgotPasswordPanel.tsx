"use client";

import { useRouter } from "next/navigation";
import ForgotPasswordForm from "@/components/login/ForgotPasswordForm";

/**
 * Client boundary for the reset page. ForgotPasswordForm needs somewhere to
 * send "back to login", and a route's page.tsx stays a Server Component.
 */
export function ForgotPasswordPanel() {
  const router = useRouter();
  return <ForgotPasswordForm onBackToLogin={() => router.push("/login")} />;
}

export default ForgotPasswordPanel;
