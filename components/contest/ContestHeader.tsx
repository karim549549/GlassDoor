import React from "react";

interface ContestHeaderProps {
  breadcrumbs?: string;
  subtitle?: string;
  title: string;
  description: string;
  children?: React.ReactNode;
  titleClassName?: string;
  subtitleClassName?: string;
  descClassName?: string;
}

export function ContestHeader({
  breadcrumbs,
  subtitle,
  title,
  description,
  children,
  titleClassName = "",
  subtitleClassName = "",
  descClassName = ""
}: ContestHeaderProps) {
  return (
    <div className="w-full bg-[#0E0E0D] text-[#F1EFE9] border-b-4 border-double border-[#F1EFE9]/25 pt-24 pb-12 px-6 md:px-12 relative overflow-hidden">
      {/* Faint blueprint grid overlay specifically inside the dark masthead block */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="masthead-grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#masthead-grid)" />
        </svg>
      </div>
      
      <div className="w-[92%] xl:w-[80%] max-w-[1700px] mx-auto relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8 py-2">
        {/* Left Column: Title Info */}
        <div className="space-y-3 max-w-2xl">
          {breadcrumbs && (
            <span className={`font-mono text-[0.55rem] text-orange tracking-widest font-bold block uppercase ${subtitleClassName}`}>
              {breadcrumbs}
            </span>
          )}
          {subtitle && (
            <span className={`font-mono text-[0.6rem] uppercase tracking-[0.25em] text-orange font-bold block ${subtitleClassName}`}>
              {subtitle}
            </span>
          )}
          <div className="overflow-hidden py-1">
            <h1 className={`font-display italic text-4xl md:text-5xl lg:text-6xl uppercase tracking-tight text-[#F1EFE9] ${titleClassName}`}>
              {title}
            </h1>
          </div>
          <p className={`font-mono text-[0.52rem] text-[#F1EFE9]/60 uppercase tracking-widest leading-relaxed max-w-2xl ${descClassName}`}>
            {description}
          </p>
        </div>

        {/* Right Column: Live Card Preview or slot */}
        {children && (
          <div className="w-full lg:w-[350px] shrink-0">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

export default ContestHeader;
