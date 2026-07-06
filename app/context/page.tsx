import React from "react";

export default function ContextPage() {
  return (
    <main className="min-h-screen bg-[#F1EFE9] text-[#0E0E0D] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-4 border-2 border-[#0E0E0D] p-8 md:p-12 shadow-[4px_4px_0px_0px_rgba(14,14,13,1)] bg-[#FAF8F5]">
        <span className="font-mono text-[0.55rem] text-orange uppercase tracking-[0.25em] font-bold">
          [PAGE // CONTEXT]
        </span>
        <h1 className="font-display italic text-4xl uppercase leading-none">
          Context
        </h1>
        <p className="font-mono text-[0.52rem] text-muted-foreground uppercase tracking-widest leading-relaxed">
          Lobby settings, rule profiles, and salary dataset specifications will render here.
        </p>
        <div className="pt-4">
          <a
            href="/"
            className="px-6 py-2.5 bg-[#0E0E0D] text-[#FAF8F5] font-mono text-[0.6rem] font-bold tracking-wider uppercase hover:bg-orange hover:text-[#FAF8F5] transition-colors inline-block"
          >
            [Return Home]
          </a>
        </div>
      </div>
    </main>
  );
}
