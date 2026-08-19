"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Search, ArrowRight, Award, Lock, GitCommit } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ProofLookupClient() {
  const router = useRouter();
  const [slugInput, setSlugInput] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = slugInput.trim();
    if (!clean) {
      setError("Please enter a Proof Packet slug or URL.");
      return;
    }

    // Support entering full URL or just the slug
    if (clean.includes("/proof/")) {
      const parts = clean.split("/proof/");
      const extracted = parts[1]?.split(/[?#]/)[0];
      if (extracted) {
        router.push(`/proof/${extracted}`);
        return;
      }
    }

    router.push(`/proof/${clean}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Lookup Form Card */}
      <div className="border-2 border-foreground bg-white shadow-[6px_6px_0px_0px_var(--foreground)] p-6 md:p-10 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 font-mono text-xs text-orange font-bold uppercase tracking-[0.25em]">
            <ShieldCheck className="w-4 h-4 text-orange" />
            <span>CREDENTIAL VERIFICATION PORTAL</span>
          </div>
          <h2 className="font-display italic text-2xl md:text-4xl uppercase tracking-tight text-foreground">
            Verify a Developer Proof Packet
          </h2>
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest max-w-xl">
            Enter a 12-character Proof ID or URL to inspect the tamper-evident cryptographic record.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={slugInput}
                onChange={(e) => {
                  setSlugInput(e.target.value);
                  setError("");
                }}
                placeholder="e.g. 7k9m2x8p4w1z or full credential URL"
                className="w-full pl-10 pr-4 py-3 bg-secondary/30 border-2 border-foreground font-mono text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:bg-white transition-colors"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              className="py-3 px-6 shrink-0 flex items-center justify-center gap-2 font-mono text-xs font-bold uppercase"
            >
              <span>VERIFY RECORD</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          {error && <p className="font-mono text-xs text-red-600 font-bold">{error}</p>}
        </form>
      </div>

      {/* Feature Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border-2 border-foreground bg-white shadow-[4px_4px_0px_0px_var(--foreground)] p-6 space-y-3">
          <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center text-orange border border-foreground/20">
            <Lock className="w-4 h-4" />
          </div>
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
            Cryptographically Sealed
          </h3>
          <p className="font-sans text-xs text-muted-foreground leading-relaxed">
            Every submission outcome is serialized into a canonical JSON snapshot with a SHA-256 content hash that cannot be manipulated.
          </p>
        </div>

        <div className="border-2 border-foreground bg-white shadow-[4px_4px_0px_0px_var(--foreground)] p-6 space-y-3">
          <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center text-orange border border-foreground/20">
            <GitCommit className="w-4 h-4" />
          </div>
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
            Auditable Git Evidence
          </h3>
          <p className="font-sans text-xs text-muted-foreground leading-relaxed">
            Directly links all repository commits, architecture writeups, and defense video recordings timestamped during the sprint.
          </p>
        </div>

        <div className="border-2 border-foreground bg-white shadow-[4px_4px_0px_0px_var(--foreground)] p-6 space-y-3">
          <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center text-orange border border-foreground/20">
            <Award className="w-4 h-4" />
          </div>
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
            Rubric-Based Scorecards
          </h3>
          <p className="font-sans text-xs text-muted-foreground leading-relaxed">
            Includes itemized evaluations from vetted engineering judges with written justifications for every criterion.
          </p>
        </div>
      </div>
    </div>
  );
}
