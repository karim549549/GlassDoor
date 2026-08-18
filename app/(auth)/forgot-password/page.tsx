import type { Metadata } from "next";
import { ForgotPasswordPanel } from "@/components/auth/ForgotPasswordPanel";

export const metadata: Metadata = {
  title: "Reset Password",
  alternates: { canonical: "/forgot-password" },
  robots: { index: false, follow: true },
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordPanel />;
}
