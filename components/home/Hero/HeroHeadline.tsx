export function HeroHeadline() {
  return (
    <div
      className="absolute z-20 text-left text-foreground"
      style={{
        bottom: "clamp(45px, 9vh, 75px)",
        left: "clamp(1rem, 3vw, 2.5rem)",
        width: "max-content",
        maxWidth: "calc(100% - 2.5rem)"
      }}
    >
      {/* The page's real <h1>, moved here from the masthead wordmark. It leads
          with the word people actually search - "hackathons" - and earns its
          distinctiveness from the qualifier rather than from jargon. The old
          line, "Developer network. Competitions. Credentials. Profiles.",
          named four things and promised none of them. */}
      <h1 className="font-display font-normal uppercase tracking-tight" style={{ fontSize: "clamp(1.5rem, 3.8vw, 3.25rem)", lineHeight: 0.95 }}>
        {/* Stays the bright accent: at 52px this is large text, which needs
            3:1, and --orange now clears it. The small mono labels around it use
            --orange-ink because they need 4.5:1. */}
        Hackathons, <span className="text-orange">but weirder.</span>
      </h1>

      <div
        className="font-display text-muted-foreground mt-2"
        style={{ fontStyle: "italic", fontSize: "clamp(0.75rem, 1.1vw, 1rem)", lineHeight: 1.35 }}
      >
        Four-hour team coding challenges. Cairo and online.
      </div>

      <div className="font-mono text-[0.52rem] text-muted-foreground uppercase tracking-[0.2em] mt-4 border-t border-border/30 pt-3.5">
        Free to enter // Anyone can start one
      </div>
    </div>
  );
}
export default HeroHeadline;
