export function HeroMasthead() {
  return (
    <div
      className="absolute top-0 left-0 right-0 flex items-baseline justify-between z-20 text-[#0E0E0D]"
      style={{
        paddingLeft: "clamp(1.25rem, 3vw, 2.5rem)",
        paddingRight: "clamp(1.25rem, 3vw, 2.5rem)",
        paddingTop: "clamp(0.5rem, 1.5vh, 1.125rem)",
        paddingBottom: "clamp(0.4rem, 1.2vh, 0.875rem)"
      }}
    >
      <h1
        className="font-display select-none uppercase text-left font-normal"
        style={{ fontSize: "clamp(2.2rem, 7vw, 7rem)", lineHeight: 0.9, letterSpacing: "-0.02em" }}
      >
        Devs Arena
      </h1>

      <div className="flex gap-8 items-baseline shrink-0">
        <div
          className="font-mono uppercase tracking-widest text-muted-foreground leading-relaxed text-right hidden sm:block"
          style={{ fontSize: "clamp(0.5rem, 0.8vw, 0.65rem)" }}
        >
          Issue 001<br />Cairo
        </div>
        <div
          className="font-mono uppercase tracking-widest text-right leading-relaxed"
          style={{ fontSize: "clamp(0.5rem, 0.8vw, 0.65rem)" }}
        >
          <div className="text-orange">2026</div>
          <div className="text-muted-foreground mt-1">JUL</div>
        </div>
      </div>
    </div>
  );
}
export default HeroMasthead;
