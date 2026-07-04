export function HeroMasthead() {
  return (
    <div
      className="absolute top-0 left-0 right-0 border-b border-border flex items-center justify-between"
      style={{ paddingLeft: "clamp(1.25rem, 3vw, 2.5rem)", paddingRight: "clamp(1.25rem, 3vw, 2.5rem)", paddingTop: "clamp(0.5rem, 1.5vh, 1.125rem)", paddingBottom: "clamp(0.4rem, 1.2vh, 0.875rem)" }}
    >
      <div
        className="font-mono uppercase tracking-widest text-muted-foreground leading-relaxed"
        style={{ fontSize: "clamp(0.5rem, 0.8vw, 0.65rem)" }}
      >
        Issue<br className="hidden sm:block" /> 001<br className="hidden sm:block" />Cairo
      </div>

      <h1
        className="font-display select-none"
        style={{ fontSize: "clamp(4rem, 13.5vw, 11.5rem)", lineHeight: 0.88, letterSpacing: "-0.015em" }}
      >
        Sherh
      </h1>

      <div
        className="font-mono uppercase tracking-widest text-right leading-relaxed"
        style={{ fontSize: "clamp(0.5rem, 0.8vw, 0.65rem)" }}
      >
        <div className="text-orange">شرح</div>
        <div className="text-muted-foreground mt-1">2024</div>
      </div>
    </div>
  );
}
