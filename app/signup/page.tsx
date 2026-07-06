import React from "react";
import Link from "next/link";
import SignupForm from "@/components/signup/SignupForm";

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col justify-between p-6">
      {/* Editorial Header */}
      <header className="flex items-center justify-between border-b border-border pb-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="font-display text-[1.1rem]">Sherh</span>
          <span className="font-mono text-[0.6rem] text-orange tracking-[0.2em]">
            شرح
          </span>
        </Link>
        <Link
          href="/"
          className="font-mono text-[0.6rem] opacity-55 hover:opacity-100 transition-opacity uppercase tracking-wider"
        >
          ← Back to home
        </Link>
      </header>

      {/* Main Form Area */}
      <div className="flex-grow flex items-center justify-center py-12">
        <SignupForm />
      </div>

      {/* Editorial Footer */}
      <footer className="border-t border-border pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[0.6rem] text-muted-foreground uppercase">
        <span>© {new Date().getFullYear()} Sherh. All rights reserved.</span>
        <span>Egypt tech · salary transparency</span>
      </footer>
    </main>
  );
}
