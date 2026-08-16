import React from "react";

interface HUDCornerReticleProps {
  label?: string;
  coordinate?: string;
  className?: string;
  children?: React.ReactNode;
}

export function HUDCornerReticle({
  label,
  coordinate,
  className = "",
  children,
}: HUDCornerReticleProps) {
  return (
    <div className={`relative border border-foreground/20 bg-card p-6 font-mono text-[0.65rem] uppercase tracking-wider ${className}`}>
      {/* Corner Brackets */}
      <span className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-orange pointer-events-none" />
      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-orange pointer-events-none" />
      <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-orange pointer-events-none" />
      <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-orange pointer-events-none" />

      {/* Header Telemetry Tags */}
      {(label || coordinate) && (
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-foreground/10 text-[0.55rem] text-muted-foreground font-bold">
          {label && <span className="text-orange-ink tracking-widest">{label}</span>}
          {coordinate && <span className="tracking-widest font-mono text-muted-foreground/70">{coordinate}</span>}
        </div>
      )}

      {children}
    </div>
  );
}
