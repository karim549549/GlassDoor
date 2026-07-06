import { HeroMasthead } from "./HeroMasthead";
import { HeroCoverNotes } from "./HeroCoverNotes";
import { HeroHeadline } from "./HeroHeadline";

export function HeroSection() {
  return (
    <section
      className="relative bg-[#F1EFE9] text-[#0E0E0D] border-b border-border overflow-visible"
      style={{ height: "calc(100svh - 88px)", minHeight: 680, maxHeight: 960 }}
    >
      {/* Darker Blueprint Grid Backdrop Overlay */}
      <div className="absolute inset-0 opacity-[0.18] pointer-events-none z-0">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hero-grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#0E0E0D" strokeWidth="0.55" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>
      </div>

      {/* Slicing Horizontal Line (Placed above text to create overlapping texture) */}
      <div
        className="absolute left-0 right-0 h-px bg-border z-30 pointer-events-none"
        style={{ top: "clamp(126px, 23.5%, 205px)" }}
      />

      {/* Scattered Magazine Typographic Layers */}
      <HeroMasthead />
      <HeroCoverNotes />
      <HeroHeadline />
    </section>
  );
}
export default HeroSection;
