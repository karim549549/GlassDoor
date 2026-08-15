import React from "react";
import { RATING_DOMAIN_LABELS, RATING_DOMAIN_VALUES } from "@/lib/recruiter/schema";
import type { PipelineMembership } from "@/lib/recruiter/pipeline-service";

interface PipelineFiltersProps {
  memberships: PipelineMembership[];
  selectedCompanyId?: string;
  selectedDomain?: string;
  minRating?: number;
}

/**
 * A plain GET form, not a client component: submitting it navigates with the
 * filters in the query string, which the server page already reads. No
 * JavaScript, no state, no hydration cost.
 *
 * The company <select> only narrows an already-authorized set — the server
 * re-resolves the caller's memberships on every request and intersects, so a
 * hand-edited company id in the URL gets a 403 rather than another company's
 * pipeline.
 */
export function PipelineFilters({
  memberships,
  selectedCompanyId,
  selectedDomain,
  minRating,
}: PipelineFiltersProps) {
  const selectClass =
    "w-full border-2 border-foreground bg-background px-3 py-2 font-mono text-xs uppercase tracking-wider text-foreground focus:outline-none focus:ring-2 focus:ring-ring";
  const labelClass =
    "block font-mono text-[0.55rem] uppercase tracking-[0.2em] text-muted-foreground";

  return (
    <form
      method="get"
      className="grid grid-cols-1 gap-4 border-2 border-foreground bg-card p-5 sm:grid-cols-2 lg:grid-cols-4"
    >
      {memberships.length > 1 && (
        <div className="space-y-1.5">
          <label htmlFor="pipeline-company" className={labelClass}>
            Company
          </label>
          <select
            id="pipeline-company"
            name="companyId"
            defaultValue={selectedCompanyId ?? ""}
            className={selectClass}
          >
            <option value="">All my companies</option>
            {memberships.map((membership) => (
              <option key={membership.companyId} value={membership.companyId}>
                {membership.companyName}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="pipeline-domain" className={labelClass}>
          Rating domain
        </label>
        <select
          id="pipeline-domain"
          name="domain"
          defaultValue={selectedDomain ?? ""}
          className={selectClass}
        >
          <option value="">All domains</option>
          {RATING_DOMAIN_VALUES.map((domain) => (
            <option key={domain} value={domain}>
              {RATING_DOMAIN_LABELS[domain]}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="pipeline-min-rating" className={labelClass}>
          Minimum rating
        </label>
        <input
          id="pipeline-min-rating"
          name="minRating"
          type="number"
          min={0}
          max={4000}
          step={10}
          inputMode="numeric"
          placeholder="e.g. 1600"
          defaultValue={minRating ?? ""}
          className={selectClass}
        />
      </div>

      <div className="flex items-end">
        <button
          type="submit"
          className="w-full border-2 border-foreground bg-foreground px-4 py-2 font-mono text-[0.7rem] uppercase tracking-wider text-background transition-colors hover:bg-background hover:text-foreground"
        >
          [ Apply filters ]
        </button>
      </div>
    </form>
  );
}

export default PipelineFilters;
