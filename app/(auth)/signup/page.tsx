import type { Metadata } from "next";
import SignupForm from "@/components/signup/SignupForm";

export const metadata: Metadata = {
  title: "Create Account",
  description:
    "Create a free Devs Arena account. Enter four-hour team coding challenges online or in Cairo - no entry fee, ever.",
  alternates: { canonical: "/signup" },
};

export default function SignupPage() {
  return <SignupForm />;
}
