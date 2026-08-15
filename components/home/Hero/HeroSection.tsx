import { HeroMasthead } from "./HeroMasthead";
import { HeroCoverNotes } from "./HeroCoverNotes";
import { HeroHeadline } from "./HeroHeadline";
import { BackgroundGrid } from "../../ui/BackgroundGrid";

export function HeroSection({ openCount = 0 }: { openCount?: number }) {
  return (
    <section
      className="hero-section-container relative bg-background text-foreground border-b border-border overflow-visible h-screen min-h-screen"
    >
      {/* Darker Blueprint Grid Backdrop Overlay */}
      <BackgroundGrid />

      {/* Slicing Horizontal Line (Placed above text to create overlapping texture) */}
      <div
        className="absolute left-0 right-0 h-px bg-border z-30 pointer-events-none"
        style={{ top: "clamp(126px, 23.5%, 205px)" }}
      />

      {/* Scattered Magazine Typographic Layers */}
      <HeroMasthead />
      <HeroCoverNotes openCount={openCount} />
      <HeroHeadline />
    </section>
  );
}
export default HeroSection;
