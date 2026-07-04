const STATS = [
  { value: "4,200+", label: "salary submissions" },
  { value: "312", label: "companies indexed" },
  { value: "18", label: "sectors covered" },
  { value: "Daily", label: "data updates" },
];

export function StatsStrip() {
  return (
    <div className="bg-foreground text-primary-foreground border-b border-foreground">
      <div className="px-6 py-5 grid grid-cols-2 sm:grid-cols-4 gap-6">
        {STATS.map((s) => (
          <div key={s.label}>
            <div className="font-mono" style={{ fontSize: "clamp(1.25rem, 2vw, 1.75rem)", fontWeight: 500, lineHeight: 1 }}>
              {s.value}
            </div>
            <div className="font-mono text-[0.55rem] opacity-45 uppercase tracking-wider mt-1.5">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
