import type { Metadata } from "next";
import { LoginPanel } from "@/components/auth/LoginPanel";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to Devs Arena to enter a challenge, form a team, or post a brief of your own.",
  alternates: { canonical: "/login" },
  // A sign-in form is not a search result. Followed, so the links out of it
  // (signup, support) are still crawled.
  robots: { index: false, follow: true },
};

export default function LoginPage() {
  return <LoginPanel />;
}
