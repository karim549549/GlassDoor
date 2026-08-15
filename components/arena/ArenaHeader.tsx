import React from "react";
import { BackgroundGrid } from "@/components/ui/BackgroundGrid";
import { ArenaContainer } from "@/components/arena/ArenaContainer";

interface ArenaHeaderAnimationHooks {
  /** Selector class attached to the breadcrumbs/subtitle line for an external animation (e.g. GSAP). */
  subtitle?: string;
  /** Selector class attached to the title for an external animation. */
  title?: string;
  /** Selector class attached to the description for an external animation. */
  description?: string;
}

interface ArenaHeaderProps {
  breadcrumbs?: string;
  subtitle?: string;
  title: string;
  description: string;
  children?: React.ReactNode;
  /** Selector hooks for an external animation library — not arbitrary style overrides. */
  animationHooks?: ArenaHeaderAnimationHooks;
}

export function ArenaHeader({
  breadcrumbs,
  subtitle,
  title,
  description,
  children,
  animationHooks = {},
}: ArenaHeaderProps) {
  return (
    <div className="w-full bg-foreground text-background border-b-4 border-double border-background/25 pt-24 pb-12 px-6 md:px-12 relative overflow-hidden">
      {/* Faint blueprint grid overlay specifically inside the dark masthead block */}
      <BackgroundGrid opacity={0.05} patternSize={30} />

      <ArenaContainer className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8 py-2">
        {/* Left Column: Title Info */}
        <div className="space-y-3 max-w-2xl">
          {breadcrumbs && (
            <span className={`font-mono text-[0.55rem] text-orange tracking-widest font-bold block uppercase ${animationHooks.subtitle ?? ""}`}>
              {breadcrumbs}
            </span>
          )}
          {subtitle && (
            <span className={`font-mono text-[0.6rem] uppercase tracking-[0.25em] text-orange font-bold block ${animationHooks.subtitle ?? ""}`}>
              {subtitle}
            </span>
          )}
          <div className="overflow-hidden py-1">
            <h1 className={`font-display italic text-4xl md:text-5xl lg:text-6xl uppercase tracking-tight text-background ${animationHooks.title ?? ""}`}>
              {title}
            </h1>
          </div>
          <p className={`font-mono text-[0.52rem] text-background/60 uppercase tracking-widest leading-relaxed max-w-2xl ${animationHooks.description ?? ""}`}>
            {description}
          </p>
        </div>

        {/* Right Column: Live Card Preview or slot */}
        {children && (
          <div className="w-full lg:w-[350px] shrink-0">
            {children}
          </div>
        )}
      </ArenaContainer>
    </div>
  );
}

export default ArenaHeader;
