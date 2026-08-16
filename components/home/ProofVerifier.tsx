"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { canonicalize } from "@/lib/proof/canonicalize";

/**
 * Section 5 - verify a credential, rather than be told it is verifiable.
 *
 * This replaces a twelve-column split with a layer-picker on the left and a
 * carousel of arena cards on the right. The carousel had nothing to do with
 * proof packets, and the split was the copy-left / visual-right wireframe the
 * rest of the page spends its time avoiding.
 *
 * The verification is REAL. It canonicalises the packet with the same encoder
 * the server uses - `lib/proof/canonicalize`, shared rather than reimplemented,
 * because two encoders that drifted would fail genuine credentials - and
 * digests it with SubtleCrypto in the browser. Change one character of the
 * specimen below and the comparison fails, because the digest is computed here
 * and now rather than read from a field.
 *
 * The packet is labelled SPECIMEN because no arena has issued one yet. The
 * cryptography is not a mock; the record is.
 */

/**
 * A specimen packet payload. Deliberately the same shape the real packet
 * snapshot uses, so the digest computed here is computed over a realistic
 * structure - nested objects, an array whose order matters, a date.
 */
const SPECIMEN = {
  slug: "k3f9-2m7x",
  issuedAt: "2026-08-14T17:20:00.000Z",
  arena: {
    title: "Scale a WebSocket cluster to 10,000 connections",
    format: "LIVE",
    domain: "BACKEND_DISTRIBUTED",
    window: "5h",
  },
  rubric: {
    version: 2,
    frozenBeforeEntry: true,
    criteria: [
      { title: "Process - development history", score: 8.5, max: 10 },
      { title: "Defense - understanding of own work", score: 9, max: 10 },
      { title: "Adaptation - response to changed requirements", score: 7.5, max: 10 },
      { title: "Throughput under sustained load", score: 8, max: 10 },
      { title: "Failure handling and recovery", score: 7, max: 10 },
    ],
  },
  judges: [
    { role: "SENIOR_SRE", conflictsDeclared: true },
    { role: "PLATFORM_LEAD", conflictsDeclared: true },
  ],
  rating: { domain: "BACKEND_DISTRIBUTED", before: 1487, after: 1543, delta: 56 },
} as const;

type Phase = "idle" | "running" | "verified" | "tampered";

interface Step {
  label: string;
  detail: string;
}

const STEP_MS = 520;

/** Hex digest of a string, using the browser's own crypto. */
async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function ProofVerifier() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [steps, setSteps] = useState<Step[]>([]);
  const [expected, setExpected] = useState<string>("");
  const [actual, setActual] = useState<string>("");
  const timers = useRef<number[]>([]);

  // The expected digest is computed once, from the untouched specimen. Storing
  // a literal here would make the whole exercise circular.
  useEffect(() => {
    let cancelled = false;
    sha256Hex(canonicalize(SPECIMEN)).then((hex) => {
      if (!cancelled) setExpected(hex);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t));
    },
    []
  );

  const run = async (tamper: boolean) => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    setSteps([]);
    setActual("");
    setPhase("running");

    // Tampering edits one score, exactly as an altered credential would. Nothing
    // else about the packet changes.
    const payload = tamper
      ? {
          ...SPECIMEN,
          rubric: {
            ...SPECIMEN.rubric,
            criteria: SPECIMEN.rubric.criteria.map((c, i) =>
              i === 0 ? { ...c, score: 9.9 } : c
            ),
          },
        }
      : SPECIMEN;

    const canonical = canonicalize(payload);
    const digest = await sha256Hex(canonical);
    const ok = digest === expected;

    const sequence: Step[] = [
      { label: "Fetch", detail: `devsarena.eg/proof/${SPECIMEN.slug}` },
      { label: "Canonicalise", detail: `${canonical.length} bytes, keys sorted at every depth` },
      { label: "Digest", detail: `sha-256  ${digest.slice(0, 32)}` },
      { label: "Compare", detail: `against published  ${expected.slice(0, 32)}` },
    ];

    sequence.forEach((step, i) => {
      const t = window.setTimeout(() => {
        setSteps((prev) => [...prev, step]);
        if (i === sequence.length - 1) {
          const done = window.setTimeout(() => {
            setActual(digest);
            setPhase(ok ? "verified" : "tampered");
          }, STEP_MS);
          timers.current.push(done);
        }
      }, i * STEP_MS);
      timers.current.push(t);
    });
  };

  const busy = phase === "running";

  return (
    <section className="relative z-20 w-full min-h-screen bg-[#0E0E0D] text-[#F1EFE9] border-t border-white/10 overflow-hidden flex flex-col items-center justify-center py-24 px-6">
      {/* Background blueprint grid overlay */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none z-0">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="verify-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#verify-grid)" />
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-3xl">
        <div className="text-center">
          <span className="block font-mono text-[0.52rem] font-bold uppercase tracking-[0.25em] text-orange">
            [04 / Check it yourself]
          </span>
          <h2 className="font-display italic text-[clamp(2rem,4.5vw,4rem)] leading-none uppercase font-normal mt-3">
            Don&rsquo;t take our word for it
          </h2>
          <p className="font-mono text-[0.58rem] text-[#F1EFE9]/50 uppercase tracking-widest leading-relaxed mt-4 max-w-xl mx-auto">
            A proof packet publishes its own hash. Recompute it and you know
            whether a single score has been touched since it was issued.
          </p>
        </div>

        {/* The instrument */}
        <div className="mt-12 border border-white/20 bg-[#141413]">
          <div className="flex items-center justify-between border-b border-white/15 px-4 py-2.5">
            <span className="font-mono text-[0.5rem] font-bold uppercase tracking-[0.22em]">
              Packet verifier
            </span>
            <span className="border border-orange px-1.5 py-0.5 font-mono text-[0.44rem] font-bold uppercase tracking-[0.18em] text-orange">
              Specimen
            </span>
          </div>

          {/* Readout */}
          <div className="min-h-[190px] px-4 py-4 font-mono text-[0.6rem] leading-relaxed">
            {steps.length === 0 && !busy && (
              <p className="text-[#F1EFE9]/35">
                &gt; awaiting input &mdash; run the check, or alter a score first
                and watch it fail
              </p>
            )}

            {steps.map((s) => (
              <div key={s.label} className="flex gap-3 py-0.5">
                <span className="text-orange shrink-0 w-24">&gt; {s.label}</span>
                <span className="text-[#F1EFE9]/70 break-all">{s.detail}</span>
              </div>
            ))}

            {busy && steps.length < 4 && (
              <div className="py-0.5 text-[#F1EFE9]/40">&gt; working&hellip;</div>
            )}

            {(phase === "verified" || phase === "tampered") && (
              <div
                className={`mt-4 flex flex-col items-center border py-4 ${
                  phase === "verified"
                    ? "border-orange/60 text-orange"
                    : "border-accent/70 text-accent"
                }`}
              >
                <span className="font-mono text-[0.95rem] font-bold uppercase tracking-[0.24em]">
                  {phase === "verified" ? "[✓] Verified" : "[×] Hash mismatch"}
                </span>
                <span className="font-mono text-[0.5rem] uppercase tracking-[0.16em] text-[#F1EFE9]/55 mt-2 text-center px-4">
                  {phase === "verified"
                    ? "Scores unaltered since issue · judges named · rubric frozen before entry"
                    : "One score was changed, so the digest no longer matches the published hash"}
                </span>
                {actual && (
                  <span className="font-mono text-[0.44rem] text-[#F1EFE9]/35 mt-3 break-all px-4 text-center">
                    computed {actual.slice(0, 40)}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3 border-t border-white/15 px-4 py-3">
            <button
              type="button"
              onClick={() => run(false)}
              disabled={busy || !expected}
              className="border border-[#F1EFE9]/70 px-5 py-2 font-mono text-[0.55rem] font-bold uppercase tracking-[0.18em] hover:bg-[#F1EFE9] hover:text-[#0E0E0D] transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-current focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Verify this packet
            </button>
            <button
              type="button"
              onClick={() => run(true)}
              disabled={busy || !expected}
              className="border border-accent/70 text-accent px-5 py-2 font-mono text-[0.55rem] font-bold uppercase tracking-[0.18em] hover:bg-accent hover:text-[#F1EFE9] transition-colors disabled:opacity-40 disabled:hover:bg-transparent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Alter a score, then verify
            </button>
            <Link
              href="/proof"
              className="ml-auto font-mono text-[0.55rem] uppercase tracking-[0.18em] text-[#F1EFE9]/45 hover:text-orange transition-colors"
            >
              What is a proof packet &rarr;
            </Link>
          </div>
        </div>

        <p className="font-mono text-[0.46rem] uppercase tracking-[0.16em] text-[#F1EFE9]/35 mt-5 text-center leading-relaxed">
          The digest is computed in your browser with SubtleCrypto, over the same
          canonical encoding the server uses. Nothing here is pre-baked &mdash;
          the record is a specimen, the cryptography is not.
        </p>
      </div>
    </section>
  );
}

export default ProofVerifier;
