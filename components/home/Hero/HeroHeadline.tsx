export function HeroHeadline() {
  return (
    <div
      className="absolute"
      style={{ bottom: "clamp(1.25rem, 5%, 3.5rem)", left: "clamp(1rem, 3vw, 2.5rem)", maxWidth: "clamp(260px, 46%, 520px)" }}
    >
      <div className="font-display" style={{ fontSize: "clamp(1.75rem, 4.8vw, 4.25rem)", lineHeight: 0.95 }}>
        Stop asking <span className="text-orange">Facebook.</span>
      </div>

      <div
        className="font-display text-muted-foreground"
        style={{ fontStyle: "italic", fontSize: "clamp(0.8rem, 1.3vw, 1.1rem)", lineHeight: 1.35, marginTop: "clamp(0.35rem, 0.8vh, 0.625rem)" }}
      >
        Real salaries. Real reviews. Every Egyptian tech company, indexed.
      </div>
    </div>
  );
}
