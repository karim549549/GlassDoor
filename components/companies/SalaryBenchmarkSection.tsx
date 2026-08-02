"use client";

import React, { useState } from "react";
import type { Role } from "@/lib/companies/types";
import { RolePositionSelector } from "./RolePositionSelector";
import { SalaryTrendChart } from "./SalaryTrendChart";

const FALLBACK_ROLE: Role = {
  title: "General Staff",
  exp: "N/A",
  min: 10000,
  max: 20000,
  median: 15000,
  submissions: 10,
};

interface SalaryBenchmarkSectionProps {
  roles: Role[];
}

/**
 * "Salary Benchmarks" section: owns which role is active and composes the
 * position selector with the trend chart for that role.
 */
function SalaryBenchmarkSectionImpl({ roles }: SalaryBenchmarkSectionProps) {
  const [activeRoleIndex, setActiveRoleIndex] = useState(0);
  const activeRole = roles?.[activeRoleIndex] || FALLBACK_ROLE;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h2 className="font-display text-3xl mb-1 text-foreground">
        Salary Benchmarks
      </h2>
      <p className="font-mono text-[0.6rem] text-muted-foreground uppercase tracking-widest mb-8">
        Interactive submission analytics per position over time
      </p>

      {/* 2-Column Graph Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        <RolePositionSelector roles={roles} activeIndex={activeRoleIndex} onSelect={setActiveRoleIndex} />
        <SalaryTrendChart role={activeRole} />
      </div>
    </div>
  );
}

export const SalaryBenchmarkSection = React.memo(SalaryBenchmarkSectionImpl);
export default SalaryBenchmarkSection;
