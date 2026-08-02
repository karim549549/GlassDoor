import React from "react";

interface SalaryModalActionsProps {
  onCancel: () => void;
}

export function SalaryModalActions({ onCancel }: SalaryModalActionsProps) {
  return (
    <div className="flex justify-end gap-3 pt-1">
      <button
        type="button"
        onClick={onCancel}
        className="font-mono text-[0.6rem] uppercase tracking-wider px-5 py-3 border border-[#0E0E0D]/30 hover:border-[#0E0E0D] text-[#0E0E0D]/60 hover:text-[#0E0E0D] cursor-pointer transition-colors bg-transparent"
      >
        Cancel
      </button>
      <button
        type="submit"
        className="font-mono text-[0.6rem] uppercase tracking-wider px-6 py-3 bg-[#0E0E0D] text-[#F1EFE9] hover:bg-orange hover:text-[#0E0E0D] cursor-pointer transition-colors border border-[#0E0E0D] font-bold"
      >
        Submit Details
      </button>
    </div>
  );
}

export default SalaryModalActions;
