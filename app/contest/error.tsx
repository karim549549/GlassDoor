"use client";

import React, { useEffect } from "react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ContestError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Contest directory boundary error:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-[#F1EFE9] text-[#0E0E0D] px-6 py-24 sm:py-28 max-w-4xl mx-auto flex flex-col items-center justify-center space-y-4">
      <div className="border border-[#0E0E0D] bg-[#FAF8F5] p-8 max-w-md w-full text-center font-mono text-[0.65rem] uppercase tracking-wider space-y-4 shadow-[4px_4px_0px_0px_rgba(14,14,13,0.15)]">
        <h3 className="font-display text-[1.2rem] italic lowercase first-letter:uppercase font-bold tracking-tight text-accent">
          Arena directory unavailable
        </h3>
        <p className="font-sans text-[0.68rem] text-muted-foreground leading-normal lowercase first-letter:uppercase">
          We couldn&apos;t load the contest directory. Please reload the page or return to the homepage.
        </p>
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="py-2 border border-[#0E0E0D] bg-[#0E0E0D] text-[#F1EFE9] font-bold hover:bg-[#F1EFE9] hover:text-[#0E0E0D] transition-colors cursor-pointer text-center font-mono text-[0.65rem] uppercase tracking-wider"
          >
            Reload page
          </button>
          <Link
            href="/"
            className="py-2 border border-[#0E0E0D] bg-transparent text-[#0E0E0D] font-bold hover:bg-[#0E0E0D] hover:text-[#F1EFE9] transition-colors cursor-pointer text-center font-mono text-[0.65rem] uppercase tracking-wider"
          >
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
