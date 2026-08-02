import React from "react";

interface ArenaContainerProps {
  className?: string;
  children: React.ReactNode;
}

/** Shared centered content rail used across all arena surfaces (list, detail, create, masthead). */
export function ArenaContainer({ className = "", children }: ArenaContainerProps) {
  return (
    <div className={`w-[92%] xl:w-[80%] max-w-[1700px] mx-auto ${className}`}>
      {children}
    </div>
  );
}

export default ArenaContainer;
