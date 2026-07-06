import { HeroMasthead } from "./HeroMasthead";
import { HeroCoverNotes } from "./HeroCoverNotes";
import { HeroHeadline } from "./HeroHeadline";

export function HeroSection() {
  return (
    <section
      className="relative overflow-hidden border-b border-border bg-[#0E0E0D] text-[#F1EFE9]"
      style={{ height: "calc(100svh - 88px)", minHeight: 680, maxHeight: 960 }}
    >
      {/* Blueprint Grid Backdrop Overlay */}
      <div className="absolute inset-0 opacity-[0.085] pointer-events-none z-0">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hero-grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#F1EFE9" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>
      </div>

      {/* Scattered Magazine Typographic Layers */}
      <HeroMasthead />
      <HeroCoverNotes />
      <HeroHeadline />
    </section>
  );
}
export default HeroSection;
