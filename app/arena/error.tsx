"use client";

import React, { useEffect } from "react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ArenaError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Arena directory boundary error:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-background text-foreground px-6 py-24 sm:py-28 max-w-4xl mx-auto flex flex-col items-center justify-center space-y-4">
      <div className="border border-foreground bg-card p-8 max-w-md w-full text-center font-mono text-[0.65rem] uppercase tracking-wider space-y-4 shadow-[4px_4px_0px_0px_rgba(14,14,13,0.15)]">
        <h3 className="font-display text-[1.2rem] italic lowercase first-letter:uppercase font-bold tracking-tight text-accent">
          Arena directory unavailable
        </h3>
        <p className="font-sans text-[0.68rem] text-muted-foreground leading-normal lowercase first-letter:uppercase">
          We couldn&apos;t load the arena directory. Please reload the page or return to the homepage.
        </p>
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="py-2 border border-foreground bg-foreground text-background font-bold hover:bg-background hover:text-foreground transition-colors cursor-pointer text-center font-mono text-[0.65rem] uppercase tracking-wider"
          >
            Reload page
          </button>
          <Link
            href="/"
            className="py-2 border border-foreground bg-transparent text-foreground font-bold hover:bg-foreground hover:text-background transition-colors cursor-pointer text-center font-mono text-[0.65rem] uppercase tracking-wider"
          >
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
