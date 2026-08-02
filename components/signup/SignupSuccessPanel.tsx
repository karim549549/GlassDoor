"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

/** "Check your email" confirmation shown after a successful signup. */
export function SignupSuccessPanel() {
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (successRef.current) {
      gsap.fromTo(
        successRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)" }
      );
    }
  }, []);

  return (
    <div ref={successRef} className="w-full text-center">
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

export default SignupSuccessPanel;
