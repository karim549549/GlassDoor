/**
 * Brief prompts, not activity.
 *
 * This strip previously read as a live feed and every line of it was invented:
 * "128 Verified Proof Packets Issued" when zero exist, "Rating Period #32
 * Computed" when none have run, and Vodafone, Instabug and Breadfast named as
 * hosts of arenas they have never heard of. Naming real companies as customers
 * is the version of that with legal consequences attached.
 *
 * These are prompts instead - the kind of brief an arena is built around. They
 * set the tone the platform actually wants (playful, specific, faintly absurd)
 * and they assert nothing, so nothing here can go stale or be untrue. The
 * leading label is what stops the strip reading as a feed.
 */
const TICKER_ITEMS = [
  "Build a game that needs two phones to play",
  "Ship a site with no business value whatsoever",
  "The most inconvenient possible login flow",
  "An app that only works before 9am",
  "Something useful for exactly one person",
  "A tool that argues back",
  "Make a spreadsheet do something it should not",
  "Four hours. No framework you have used before",
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
      {/* Fixed label. Without it a scrolling strip reads as a live feed, which
          is what let the previous invented contents pass as real. */}
      <span
        className="shrink-0 border-r border-border bg-orange px-3 py-1 font-mono uppercase tracking-[0.2em] font-bold text-[#0E0E0D]"
        style={{ fontSize: "clamp(0.42rem, 0.55vw, 0.52rem)" }}
      >
        Brief ideas
      </span>

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
