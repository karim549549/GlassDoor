export function HeroHeadline() {
  return (
    <div
      className="absolute z-20 text-left text-[#0E0E0D]"
      style={{
        bottom: "clamp(45px, 9vh, 75px)",
        left: "clamp(1rem, 3vw, 2.5rem)",
        width: "max-content",
        maxWidth: "calc(100% - 2.5rem)"
      }}
    >
      <div className="font-display font-black uppercase tracking-tight" style={{ fontSize: "clamp(1.5rem, 3.8vw, 3.25rem)", lineHeight: 0.95 }}>
        Developer <span className="text-orange">network.</span>
      </div>

      <div
        className="font-display text-muted-foreground mt-2"
        style={{ fontStyle: "italic", fontSize: "clamp(0.75rem, 1.1vw, 1rem)", lineHeight: 1.35 }}
      >
        Salaries. Arenas. Profiles. One platform.
      </div>

      <div className="font-mono text-[0.52rem] text-muted-foreground uppercase tracking-[0.2em] mt-4 border-t border-border/30 pt-3.5">
        No registration fees // Compete live
      </div>
    </div>
  );
}
export default HeroHeadline;
