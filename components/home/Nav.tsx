"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/useAuthStore";

export function Nav() {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();

  const handleSubmitSalary = () => {
    if (!user) {
      router.push("/login?redirectTo=/submit-salary");
    } else {
      router.push("/submit-salary");
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      clearAuth();
      router.push("/");
      router.refresh();
    } catch {
      // Ignore errors on sign out
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-foreground text-primary-foreground">
      <div className="px-6 h-11 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <span className="font-display text-[1.1rem]">Sherh</span>
            <span className="font-mono text-[0.6rem] text-orange tracking-[0.2em]">
              شرح
            </span>
          </Link>
          <span className="font-mono text-[0.6rem] opacity-35 border-l border-primary-foreground/20 pl-3 hidden sm:block">
            Egypt tech · salary transparency
          </span>
        </div>
        <div className="flex items-center gap-5">
          <a
            href="#"
            className="font-mono text-[0.6rem] opacity-55 hover:opacity-100 transition-opacity hidden sm:block uppercase tracking-wider"
          >
            Companies
          </a>
          <a
            href="#"
            className="font-mono text-[0.6rem] opacity-55 hover:opacity-100 transition-opacity hidden sm:block uppercase tracking-wider"
          >
            Reviews
          </a>
          {user ? (
            <button
              onClick={handleSignOut}
              className="font-mono text-[0.6rem] opacity-55 hover:opacity-100 transition-opacity uppercase tracking-wider cursor-pointer"
            >
              Sign out
            </button>
          ) : (
            <Link
              href="/login"
              className="font-mono text-[0.6rem] opacity-55 hover:opacity-100 transition-opacity uppercase tracking-wider"
            >
              Sign in
            </Link>
          )}
          <button
            onClick={handleSubmitSalary}
            className="font-mono text-[0.6rem] border border-primary-foreground/25 px-3 py-1.5 hover:bg-primary-foreground hover:text-foreground transition-colors uppercase tracking-wider cursor-pointer"
          >
            Submit salary
          </button>
        </div>
      </div>
    </nav>
  );
}
