import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

export function HeroCoverNotes() {
  return (
    <>
      <div
        className="absolute border border-border px-2 py-1.5 hidden sm:block"
        style={{ top: "clamp(130px, 24%, 220px)", left: "clamp(1rem, 3vw, 2.5rem)" }}
      >
        <div
          className="font-mono uppercase tracking-[0.22em] text-muted-foreground leading-relaxed"
          style={{ fontSize: "clamp(0.45rem, 0.6vw, 0.55rem)" }}
        >
          No. 1 salary<br />database in Egypt
        </div>
      </div>

      <div
        className="absolute text-right hidden sm:block"
        style={{ top: "clamp(116px, 21%, 200px)", right: "clamp(1rem, 3vw, 2.5rem)" }}
      >
        <div className="font-mono" style={{ fontSize: "clamp(2rem, 3.8vw, 3.5rem)", fontWeight: 500, lineHeight: 1 }}>
          <AnimatedCounter value="312" />
        </div>
        <div
          className="font-mono uppercase tracking-[0.18em] text-muted-foreground mt-1"
          style={{ fontSize: "clamp(0.45rem, 0.6vw, 0.55rem)" }}
        >
          Companies<br />Indexed
        </div>
      </div>

      <div
        className="absolute hidden lg:block"
        style={{ top: "38%", left: "clamp(1rem, 2.5vw, 2rem)", maxWidth: "clamp(120px, 13vw, 170px)" }}
      >
        <div className="font-mono text-[0.52rem] text-orange uppercase mb-1" style={{ letterSpacing: "0.18em" }}>
          Exclusive
        </div>
        <div className="font-display" style={{ fontSize: "clamp(0.85rem, 1.1vw, 1.05rem)", lineHeight: 1.25, fontStyle: "italic" }}>
          Vodafone Egypt: The full salary picture
        </div>
      </div>

      <div
        className="absolute border-2 border-foreground text-center hidden md:block"
        style={{ top: "34%", right: "clamp(1rem, 2.5vw, 2rem)", padding: "clamp(0.5rem, 1vw, 0.875rem) clamp(0.75rem, 1.5vw, 1.25rem)" }}
      >
        <div className="font-mono text-[0.48rem] uppercase tracking-[0.22em] text-muted-foreground">
          Verified by
        </div>
        <div className="font-mono text-orange" style={{ fontSize: "clamp(1.5rem, 2.2vw, 2rem)", fontWeight: 500, lineHeight: 1.1 }}>
          <AnimatedCounter value="4,200+" />
        </div>
        <div className="font-mono text-[0.48rem] uppercase tracking-[0.18em] text-muted-foreground">
          Egyptian<br />engineers
        </div>
      </div>

      <div
        className="absolute hidden lg:block"
        style={{ bottom: "clamp(110px, 23%, 205px)", left: "clamp(1rem, 3vw, 2.5rem)" }}
      >
        <div className="font-mono text-[0.5rem] text-orange uppercase mb-0.5" style={{ letterSpacing: "0.2em" }}>
          Featured
        </div>
        <div className="font-display" style={{ fontStyle: "italic", fontSize: "clamp(0.75rem, 0.95vw, 0.9rem)", lineHeight: 1.3, maxWidth: 155 }}>
          Backend salaries up 12% since Q1 2024
        </div>
      </div>

      <div
        className="absolute text-right hidden md:block"
        style={{ bottom: "clamp(60px, 12%, 115px)", right: "clamp(1rem, 3vw, 2.5rem)" }}
      >
        <div
          className="font-mono uppercase tracking-[0.2em] text-muted-foreground leading-[2.2]"
          style={{ fontSize: "clamp(0.45rem, 0.6vw, 0.55rem)" }}
        >
          <div>Anonymous submissions</div>
          <div>No account needed</div>
          <div>Free forever</div>
        </div>
      </div>
    </>
  );
}
