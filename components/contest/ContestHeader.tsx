import React from "react";
import { BackgroundGrid } from "@/components/ui/BackgroundGrid";
import { ContestContainer } from "@/components/contest/ContestContainer";

interface ContestHeaderAnimationHooks {
  /** Selector class attached to the breadcrumbs/subtitle line for an external animation (e.g. GSAP). */
  subtitle?: string;
  /** Selector class attached to the title for an external animation. */
  title?: string;
  /** Selector class attached to the description for an external animation. */
  description?: string;
}

interface ContestHeaderProps {
  breadcrumbs?: string;
  subtitle?: string;
  title: string;
  description: string;
  children?: React.ReactNode;
  /** Selector hooks for an external animation library — not arbitrary style overrides. */
  animationHooks?: ContestHeaderAnimationHooks;
}

export function ContestHeader({
  breadcrumbs,
  subtitle,
  title,
  description,
  children,
  animationHooks = {},
}: ContestHeaderProps) {
  return (
    <div className="w-full bg-[#0E0E0D] text-[#F1EFE9] border-b-4 border-double border-[#F1EFE9]/25 pt-24 pb-12 px-6 md:px-12 relative overflow-hidden">
      {/* Faint blueprint grid overlay specifically inside the dark masthead block */}
      <BackgroundGrid opacity={0.05} patternSize={30} />

      <ContestContainer className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8 py-2">
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
            <h1 className={`font-display italic text-4xl md:text-5xl lg:text-6xl uppercase tracking-tight text-[#F1EFE9] ${animationHooks.title ?? ""}`}>
              {title}
            </h1>
          </div>
          <p className={`font-mono text-[0.52rem] text-[#F1EFE9]/60 uppercase tracking-widest leading-relaxed max-w-2xl ${animationHooks.description ?? ""}`}>
            {description}
          </p>
        </div>

        {/* Right Column: Live Card Preview or slot */}
        {children && (
          <div className="w-full lg:w-[350px] shrink-0">
            {children}
          </div>
        )}
      </ContestContainer>
    </div>
  );
}

export default ContestHeader;
