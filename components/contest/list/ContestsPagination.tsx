"use client";

interface ContestsPaginationProps {
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
}

/** Compact prev/next controls used in the registry toolbar header, next to the results count. */
export function ContestsToolbarPagination({ currentPage, totalPages, isLoading, onPageChange }: ContestsPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center gap-3 font-mono text-[0.55rem] uppercase tracking-wider text-[#0E0E0D]">
      <span>Page {currentPage} of {totalPages}</span>
      <div className="flex gap-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          className="px-2.5 py-1 border border-[#0E0E0D] bg-white text-[#0E0E0D] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#0E0E0D] hover:text-white transition-colors text-[0.52rem] font-mono font-bold"
        >
          PREV
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
          className="px-2.5 py-1 border border-[#0E0E0D] bg-white text-[#0E0E0D] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#0E0E0D] hover:text-white transition-colors text-[0.52rem] font-mono font-bold"
        >
          NEXT
        </button>
      </div>
    </div>
  );
}

/** Bracketed, heavier-styled prev/next controls used below the results grid. */
export function ContestsFooterPagination({ currentPage, totalPages, isLoading, onPageChange }: ContestsPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-between items-center pt-6 border-t border-dashed border-[#0E0E0D]/20 font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground mt-4">
      <span>Page {currentPage} of {totalPages} results</span>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          className="px-3 py-1.5 border-2 border-[#0E0E0D] bg-white text-[#0E0E0D] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#0E0E0D] hover:text-white transition-colors shadow-[2px_2px_0px_0px_#0E0E0D] active:translate-y-0.5 font-bold"
        >
          [PREV]
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
          className="px-3 py-1.5 border-2 border-[#0E0E0D] bg-white text-[#0E0E0D] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#0E0E0D] hover:text-white transition-colors shadow-[2px_2px_0px_0px_#0E0E0D] active:translate-y-0.5 font-bold"
        >
          [NEXT]
        </button>
      </div>
    </div>
  );
}
