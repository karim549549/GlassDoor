import { fmt } from "@/lib/companies/format";

interface SalaryBarProps {
  min: number;
  max: number;
  median: number;
}

export function SalaryBar({ min, max, median }: SalaryBarProps) {
  const LO = 8000, HI = 70000;
  const p = (v: number) => Math.max(0, Math.min(100, ((v - LO) / (HI - LO)) * 100));
  return (
    <div>
      <div className="relative h-1.5 bg-secondary rounded-full">
        <div
          className="absolute h-full rounded-full bg-foreground opacity-70"
          style={{ left: `${p(min)}%`, width: `${p(max) - p(min)}%` }}
        />
        <div
          className="absolute w-px h-4 -top-1.5 rounded-full bg-accent"
          style={{ left: `${p(median)}%` }}
        />
      </div>
      <div className="flex justify-between mt-1.5 font-mono text-[0.6rem]">
        <span className="text-muted-foreground">{fmt(min)}</span>
        <span className="text-accent">median: {fmt(median)}</span>
        <span className="text-muted-foreground">{fmt(max)} EGP/mo</span>
      </div>
    </div>
  );
}
