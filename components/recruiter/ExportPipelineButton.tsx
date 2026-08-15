"use client";

import React, { useState } from "react";
import { Download } from "lucide-react";
import { logger } from "@/lib/client/logger";

interface ExportPipelineButtonProps {
  companyId?: string;
  domain?: string;
  minRating?: number;
}

/**
 * POSTs to /api/recruiter/pipeline, which writes an audit row before it returns
 * a single byte of CSV. The user-visible copy says so on purpose: the export
 * being attributable is a property the exporter should know about, not a
 * silent one.
 */
export function ExportPipelineButton({ companyId, domain, minRating }: ExportPipelineButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    setIsExporting(true);
    setError(null);

    try {
      const res = await fetch("/api/recruiter/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format: "csv",
          ...(companyId ? { companyId } : {}),
          ...(domain ? { domain } : {}),
          ...(minRating !== undefined ? { minRating } : {}),
        }),
      });

      if (!res.ok) {
        const detail = await res.json().catch(() => null);
        setError(detail?.error ?? "Export failed.");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `devs-arena-pipeline-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      logger.error("Pipeline export failed", {
        error: err instanceof Error ? err.message : String(err),
      });
      setError("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleExport}
        disabled={isExporting}
        aria-label="Export the candidate pipeline as CSV"
        className="inline-flex items-center gap-2 border-2 border-foreground bg-background px-4 py-2 font-mono text-[0.7rem] uppercase tracking-wider text-foreground transition-colors hover:bg-foreground hover:text-background disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Download className="h-3.5 w-3.5" aria-hidden="true" />
        {isExporting ? "[ Exporting… ]" : "[ Export CSV ]"}
      </button>
      <p className="font-mono text-[0.55rem] uppercase tracking-wider text-muted-foreground">
        Every export is recorded in the audit log against your account.
      </p>
      {error && (
        <p role="alert" className="font-mono text-[0.6rem] uppercase tracking-wider text-destructive">
          [!] {error}
        </p>
      )}
    </div>
  );
}

export default ExportPipelineButton;
