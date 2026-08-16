import { HeroJoinSeatCta } from "./HeroJoinSeatCta";

/**
 * Bottom-right block: the static platform-pillars list plus the animated
 * "Join an Open Seat" CTA link.
 */
export function HeroPlatformCta() {
  return (
    <div
      className="absolute text-right hidden sm:block z-20 text-foreground"
      style={{ bottom: "clamp(45px, 9vh, 75px)", right: "clamp(1rem, 3vw, 2.5rem)" }}
    >
      {/* Platform Pillars stacked list */}
      <div
        className="font-mono uppercase tracking-[0.2em] text-muted-foreground leading-[2.2] mb-6"
        style={{ fontSize: "clamp(0.45rem, 0.6vw, 0.55rem)" }}
      >
        {/* Was "Rubric-based judging / Domain Glicko-2 ratings / Proof
            credentials" - three pieces of internal machinery, in the corner of
            the first screen a visitor sees. All three still exist; none of them
            is a reason to spend a Saturday here. */}
        <div>30 min to plan, 4 to build</div>
        <div>Teams of 2 to 4</div>
        <div className="text-foreground font-bold">A human tells you why</div>
      </div>

      {/* JOIN AN OPEN SEAT Typography with GSAP animated orange background highlight */}
      <HeroJoinSeatCta />
    </div>
  );
}

export default HeroPlatformCta;
