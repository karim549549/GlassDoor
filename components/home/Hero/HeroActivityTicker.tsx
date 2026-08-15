const TICKER_ITEMS = [
  "Vodafone Egypt · 2 Arenas Hosted",
  "Rating Period #32 Computed",
  "128 Verified Proof Packets Issued",
  "Instabug · Full-Stack Challenge Live",
  "Glicko-2 Top Rank: 2140 General",
  "New Arena: Egypt React Winter Hackathon",
  "Breadfast · Backend Sprint Under Judging",
];

/**
 * Bottom strip live-activity marquee. Renders the item list twice back to
 * back so the CSS marquee keyframes (`marquee_28s_linear_infinite`) loop
 * seamlessly without a visible seam.
 */
export function HeroActivityTicker() {
  return (
    <div
      className="absolute left-0 right-0 border-t border-border overflow-hidden hidden sm:flex items-center z-20 text-foreground"
      style={{ bottom: 0, height: "clamp(28px, 4vh, 38px)" }}
    >
      <div
        className="font-mono uppercase tracking-widest text-muted-foreground whitespace-nowrap animate-[marquee_28s_linear_infinite] flex gap-12"
        style={{ fontSize: "clamp(0.42rem, 0.55vw, 0.52rem)" }}
      >
        {TICKER_ITEMS.map((item, i) => (
          <span key={i} className="flex items-center gap-2">
            <span className="text-orange">·</span>
            {item}
          </span>
        ))}
        {/* Duplicate for seamless loop */}
        {TICKER_ITEMS.map((item, i) => (
          <span key={`dup-${i}`} className="flex items-center gap-2">
            <span className="text-orange">·</span>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export default HeroActivityTicker;
