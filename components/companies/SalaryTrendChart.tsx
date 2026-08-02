import React from "react";
import type { Role } from "@/lib/companies/types";
import { buildSalaryChartGeometry } from "@/lib/companies/salaryChart";

interface SalaryTrendChartProps {
  role: Role;
}

/** Right-column panel: active role summary + the interactive SVG salary trend line. */
function SalaryTrendChartImpl({ role }: SalaryTrendChartProps) {
  const { width, height, padding, dataPoints, pathD, getX, getY } = buildSalaryChartGeometry(role);
  const minSal = role.min;
  const medianSal = role.median;
  const maxSal = role.max;

  return (
    <div className="col-span-1 md:col-span-3 border-2 border-foreground bg-card p-6 relative flex flex-col">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
        <div className="flex flex-col text-left">
          <span className="font-mono text-[0.75rem] font-bold text-foreground">
            {role.title}
          </span>
          <span className="font-mono text-[0.55rem] text-muted-foreground uppercase tracking-wider mt-0.5">
            Experience benchmark: {role.exp}
          </span>
        </div>

        <div className="flex gap-6 font-mono text-[0.65rem] uppercase">
          <div className="flex flex-col text-right">
            <span className="text-muted-foreground text-[0.5rem] tracking-wider uppercase">Median Salary</span>
            <span className="font-bold text-[#0E0E0D]">{role.median.toLocaleString()} EGP</span>
          </div>
          <div className="flex flex-col text-right border-l border-border pl-6">
            <span className="text-muted-foreground text-[0.5rem] tracking-wider uppercase">Records</span>
            <span className="font-bold text-orange">{role.submissions} Verified</span>
          </div>
        </div>
      </div>

      {/* Responsive SVG Grid Canvas */}
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[500px]">
          {/* Grid Lines */}
          <line x1={padding} y1={getY(minSal)} x2={width - padding} y2={getY(minSal)} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3,3" />
          <line x1={padding} y1={getY(medianSal)} x2={width - padding} y2={getY(medianSal)} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3,3" />
          <line x1={padding} y1={getY(maxSal)} x2={width - padding} y2={getY(maxSal)} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3,3" />

          {/* Grid Labels */}
          <text x={padding - 10} y={getY(minSal) + 4} textAnchor="end" className="fill-muted-foreground font-mono text-[8px]">
            {Math.round(minSal / 1000)}K
          </text>
          <text x={padding - 10} y={getY(medianSal) + 4} textAnchor="end" className="fill-muted-foreground font-mono text-[8px] font-bold">
            {Math.round(medianSal / 1000)}K
          </text>
          <text x={padding - 10} y={getY(maxSal) + 4} textAnchor="end" className="fill-muted-foreground font-mono text-[8px]">
            {Math.round(maxSal / 1000)}K
          </text>

          {/* Salary Trend Path */}
          <path
            d={pathD}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="text-foreground transition-all duration-300"
          />

          {/* Timeline Dots */}
          {dataPoints.map((pt, idx) => {
            const x = getX(idx);
            const y = getY(pt.value);
            const isMax = idx === dataPoints.length - 1;
            const isMin = idx === 0;

            return (
              <g key={pt.label} className="group cursor-pointer">
                <circle
                  cx={x}
                  cy={y}
                  r={isMax ? "5" : isMin ? "5" : "4"}
                  className={`fill-card stroke-2 transition-all duration-150 ${
                    isMax ? "stroke-orange" : "stroke-foreground"
                  } group-hover:r-6`}
                />
                <text
                  x={x}
                  y={y - 12}
                  textAnchor="middle"
                  className="fill-foreground font-mono text-[9px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity bg-background px-1"
                >
                  {Math.round(pt.value).toLocaleString()} EGP
                </text>
                <text
                  x={x}
                  y={height - padding + 15}
                  textAnchor="middle"
                  className="fill-muted-foreground font-mono text-[8px] uppercase tracking-wider"
                >
                  {pt.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export const SalaryTrendChart = React.memo(SalaryTrendChartImpl);
export default SalaryTrendChart;
