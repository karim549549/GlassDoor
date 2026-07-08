import React from "react";

interface ContestContainerProps {
  className?: string;
  children: React.ReactNode;
}

/** Shared centered content rail used across all contest surfaces (list, detail, create, masthead). */
export function ContestContainer({ className = "", children }: ContestContainerProps) {
  return (
    <div className={`w-[92%] xl:w-[80%] max-w-[1700px] mx-auto ${className}`}>
      {children}
    </div>
  );
}

export default ContestContainer;
