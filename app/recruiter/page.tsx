import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/server/auth/require-user";
import {
  CONTACT_WITHHELD_REASON,
  getPipelineMemberships,
  getRecruiterPipeline,
  resolveAuthorizedCompanyIds,
} from "@/lib/recruiter/pipeline-service";
import { toPipelineResponseDto } from "@/lib/recruiter/dto";
import { pipelineQuerySchema } from "@/lib/recruiter/schema";
import { PipelineFilters } from "@/components/recruiter/PipelineFilters";
import { PipelineTable } from "@/components/recruiter/PipelineTable";
import { ExportPipelineButton } from "@/components/recruiter/ExportPipelineButton";
import { BackgroundGrid } from "@/components/ui/BackgroundGrid";
import { Footer } from "@/components/home/Footer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Candidate Pipeline | Devs Arena",
  robots: { index: false, follow: false },
};

interface RecruiterPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * The employer surface: developers ranked by signal this platform actually
 * verified — a published final score, a per-domain Glicko rating, and a
 * tamper-evident Proof Packet where one was issued.
 *
 * Calls the domain service directly (see .agents/rules/architecture.md) and
 * repeats the exact authorization the API route does: memberships are resolved
 * from the session user id, and any companyId in the URL is only intersected
 * with them.
 */
export default async function RecruiterPipelinePage({ searchParams }: RecruiterPageProps) {
  const auth = await requireUser();
  if ("response" in auth) {
    redirect("/login?redirectTo=/recruiter");
  }

  const params = await searchParams;
  const parsed = pipelineQuerySchema.safeParse(params);
  const query = parsed.success ? parsed.data : pipelineQuerySchema.parse({});

  const memberships = await getPipelineMemberships(auth.user.id);
  const companyIds = resolveAuthorizedCompanyIds(memberships, query.companyId);

  const pipeline = companyIds
    ? toPipelineResponseDto(
        await getRecruiterPipeline(companyIds, {
          domain: query.domain,
          minRating: query.minRating,
          page: query.page,
          pageSize: query.pageSize,
        }),
        query.page
      )
    : null;

  function pageHref(page: number): string {
    const next = new URLSearchParams();
    if (query.companyId) next.set("companyId", query.companyId);
    if (query.domain) next.set("domain", query.domain);
    if (query.minRating !== undefined) next.set("minRating", String(query.minRating));
    next.set("page", String(page));
    return `/recruiter?${next.toString()}`;
  }

  return (
    <div className="relative flex min-h-screen flex-col justify-between bg-background font-sans text-foreground">
      <main className="relative z-10 flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-8 md:py-16">
          <BackgroundGrid opacity={0.04} />

          <header className="mb-8 space-y-2">
            <p className="font-mono text-[0.55rem] uppercase tracking-[0.3em] text-orange">
              [ Employer Console ]
            </p>
            <h1 className="font-display text-3xl uppercase md:text-4xl">Candidate Pipeline</h1>
            <p className="max-w-2xl font-mono text-xs leading-relaxed text-muted-foreground">
              Developers who competed in arenas your company ran or sponsored,
              ranked by verified rating and published score.
            </p>
          </header>

          {!pipeline ? (
            <div className="border-2 border-dashed border-foreground/30 bg-card p-8 text-center">
              <p className="font-mono text-xs uppercase leading-relaxed tracking-wider text-muted-foreground">
                {query.companyId
                  ? "You are not a recruiter, admin or owner of that company."
                  : "No company access. Ask a company owner to add you as a RECRUITER, ADMIN or OWNER — and to approve the invite — before the pipeline appears here."}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <PipelineFilters
                memberships={memberships}
                selectedCompanyId={query.companyId}
                selectedDomain={query.domain}
                minRating={query.minRating}
              />

              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <p className="font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground">
                  {pipeline.total} candidate{pipeline.total === 1 ? "" : "s"} · page{" "}
                  {pipeline.currentPage} of {pipeline.totalPages}
                </p>
                <ExportPipelineButton
                  companyId={query.companyId}
                  domain={query.domain}
                  minRating={query.minRating}
                />
              </div>

              <div className="border-2 border-orange bg-card p-4">
                <p className="font-mono text-[0.6rem] uppercase leading-relaxed tracking-wider text-foreground">
                  [!] {CONTACT_WITHHELD_REASON}
                </p>
              </div>

              <PipelineTable candidates={pipeline.candidates} domain={query.domain} />

              {pipeline.scannedSubmissionCap && (
                <p className="font-mono text-[0.55rem] uppercase tracking-wider text-muted-foreground">
                  [!] Result set truncated at the submission scan cap — narrow the
                  filters for a complete ranking.
                </p>
              )}

              {pipeline.totalPages > 1 && (
                <nav aria-label="Pipeline pagination" className="flex items-center gap-3">
                  {pipeline.currentPage > 1 && (
                    <Link
                      href={pageHref(pipeline.currentPage - 1)}
                      className="border-2 border-foreground px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-wider transition-colors hover:bg-foreground hover:text-background"
                    >
                      [ Previous ]
                    </Link>
                  )}
                  {pipeline.currentPage < pipeline.totalPages && (
                    <Link
                      href={pageHref(pipeline.currentPage + 1)}
                      className="border-2 border-foreground px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-wider transition-colors hover:bg-foreground hover:text-background"
                    >
                      [ Next ]
                    </Link>
                  )}
                </nav>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
