export function Billboard() {
  return (
    <div className="mt-11 bg-secondary border-b border-border">
      <div className="font-mono text-[0.6rem] px-6 py-1.5 text-muted-foreground flex flex-wrap items-center gap-4 sm:gap-6">
        <span>Last updated: Today, 14:32 EET</span>
        <span className="opacity-30">·</span>
        <span>Anyone can post a brief and start one</span>
        <span className="opacity-30">·</span>
        <span className="hidden sm:block">The clock runs. Then you show it.</span>
      </div>
    </div>
  );
}
