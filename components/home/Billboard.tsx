export function Billboard() {
  return (
    <div className="mt-11 bg-secondary border-b border-border">
      <div className="font-mono text-[0.6rem] px-6 py-1.5 text-muted-foreground flex flex-wrap items-center gap-4 sm:gap-6">
        <span>Last updated: Today, 14:32 EET</span>
        <span className="opacity-30">·</span>
        <span>4,200+ salary records indexed</span>
        <span className="opacity-30">·</span>
        <span className="hidden sm:block">No HR filters. No PR review.</span>
      </div>
    </div>
  );
}
