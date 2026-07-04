"use client";

import { useState } from "react";
import type { Company } from "@/lib/companies/types";
import { ratingColorClass } from "@/lib/companies/format";
import { SalaryBar } from "./SalaryBar";

interface SelectedCompanyCardProps {
  company: Company;
}

export function SelectedCompanyCard({ company }: SelectedCompanyCardProps) {
  const [roleIdx, setRoleIdx] = useState(0);
  const role = company.roles[roleIdx];

  return (
    <div className="mt-2 bg-card border border-border">
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border">
        <div className="min-w-0">
          <div className="font-display truncate" style={{ fontSize: "clamp(1rem, 1.4vw, 1.25rem)", lineHeight: 1.1 }}>
            {company.name}
          </div>
          <div className="font-mono text-[0.56rem] text-muted-foreground uppercase tracking-wider mt-0.5">
            {company.sector}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div
            className={`font-mono text-[1.625rem] ${ratingColorClass(company.rating)}`}
            style={{ fontWeight: 500, lineHeight: 1 }}
          >
            {company.rating}
          </div>
          <div className="font-mono text-[0.56rem] text-muted-foreground">
            {company.reviews.toLocaleString()} reviews
          </div>
        </div>
      </div>

      <div className="px-4 pt-3 pb-3">
        <div className="flex gap-1.5 mb-2.5 flex-wrap">
          {company.roles.map((r, i) => (
            <button
              key={i}
              onClick={() => setRoleIdx(i)}
              className={
                i === roleIdx
                  ? "px-2 py-0.5 border transition-all bg-foreground text-primary-foreground border-foreground text-[0.7rem]"
                  : "px-2 py-0.5 border transition-all border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground text-[0.7rem]"
              }
            >
              {r.title}
            </button>
          ))}
        </div>

        {role && (
          <div className="bg-secondary/50 px-3 py-2.5">
            <div className="flex justify-between items-baseline mb-2">
              <span className="font-medium text-[0.8125rem]">
                {role.title}
              </span>
              <span className="font-mono text-[0.58rem] text-muted-foreground">
                {role.exp} - {role.submissions} submissions
              </span>
            </div>
            <SalaryBar min={role.min} max={role.max} median={role.median} />
          </div>
        )}
      </div>
    </div>
  );
}
