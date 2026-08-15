import { redirect } from "next/navigation";
import prisma from "@/lib/server/prisma";
import { requireRole } from "@/lib/server/auth/require-user";
import { ArenaContainer } from "@/components/arena/ArenaContainer";
import { ArenaHeader } from "@/components/arena/ArenaHeader";
import { BackgroundGrid } from "@/components/ui/BackgroundGrid";
import { Footer } from "@/components/home/Footer";
import { Shield, Users, Trophy, Award, Building2, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const auth = await requireRole(["ADMIN"]);
  if ("response" in auth) {
    redirect("/");
  }

  const [arenaCount, submissionCount, proofCount, userCount, companyCount, pendingAppeals] =
    await Promise.all([
      prisma.arena.count({ where: { isDeleted: false } }),
      prisma.arenaSubmission.count({ where: { withdrawnAt: null } }),
      prisma.proofPacket.count(),
      prisma.user.count(),
      prisma.company.count(),
      prisma.appeal.findMany({
        where: { status: "PENDING" },
        include: {
          submission: {
            include: { arena: true },
          },
        },
      }),
    ]);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-foreground font-sans relative">
      <main className="flex-1">
        <ArenaHeader
          breadcrumbs="[SYSTEM ADMINISTRATION]"
          title="Admin Operations"
          description="Platform supervision, dispute arbitration, and rating period controls."
        />

        <ArenaContainer className="py-10 md:py-16 relative z-10">
          <BackgroundGrid opacity={0.04} />
          
          <div className="max-w-6xl mx-auto space-y-10">
            {/* KPI Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white border-2 border-foreground p-5 shadow-[4px_4px_0px_0px_var(--foreground)] space-y-1">
                <div className="flex items-center gap-1.5 font-mono text-[0.55rem] text-muted-foreground uppercase">
                  <Trophy className="w-3.5 h-3.5 text-orange" />
                  <span>Arenas</span>
                </div>
                <div className="font-mono text-2xl font-bold">{arenaCount}</div>
              </div>

              <div className="bg-white border-2 border-foreground p-5 shadow-[4px_4px_0px_0px_var(--foreground)] space-y-1">
                <div className="flex items-center gap-1.5 font-mono text-[0.55rem] text-muted-foreground uppercase">
                  <Award className="w-3.5 h-3.5 text-orange" />
                  <span>Submissions</span>
                </div>
                <div className="font-mono text-2xl font-bold">{submissionCount}</div>
              </div>

              <div className="bg-white border-2 border-foreground p-5 shadow-[4px_4px_0px_0px_var(--foreground)] space-y-1">
                <div className="flex items-center gap-1.5 font-mono text-[0.55rem] text-muted-foreground uppercase">
                  <Shield className="w-3.5 h-3.5 text-orange" />
                  <span>Proof Packets</span>
                </div>
                <div className="font-mono text-2xl font-bold">{proofCount}</div>
              </div>

              <div className="bg-white border-2 border-foreground p-5 shadow-[4px_4px_0px_0px_var(--foreground)] space-y-1">
                <div className="flex items-center gap-1.5 font-mono text-[0.55rem] text-muted-foreground uppercase">
                  <Users className="w-3.5 h-3.5 text-orange" />
                  <span>Developers</span>
                </div>
                <div className="font-mono text-2xl font-bold">{userCount}</div>
              </div>

              <div className="bg-white border-2 border-foreground p-5 shadow-[4px_4px_0px_0px_var(--foreground)] space-y-1">
                <div className="flex items-center gap-1.5 font-mono text-[0.55rem] text-muted-foreground uppercase">
                  <Building2 className="w-3.5 h-3.5 text-orange" />
                  <span>Companies</span>
                </div>
                <div className="font-mono text-2xl font-bold">{companyCount}</div>
              </div>
            </div>

            {/* Pending Disputes & Appeals */}
            <div className="bg-white border-2 border-foreground shadow-[6px_6px_0px_0px_var(--foreground)] p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-foreground/10 pb-3">
                <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-orange font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>PENDING ARBITRATION &amp; APPEALS ({pendingAppeals.length})</span>
                </h2>
              </div>

              {pendingAppeals.length === 0 ? (
                <p className="font-mono text-xs text-muted-foreground py-6 text-center uppercase tracking-wider">
                  No pending appeals or dispute tickets in the queue.
                </p>
              ) : (
                <div className="divide-y divide-foreground/10">
                  {pendingAppeals.map((appeal) => (
                    <div key={appeal.id} className="py-4 space-y-2">
                      <div className="flex items-center justify-between font-mono text-xs">
                        <span className="font-bold">{appeal.submission.arena.title}</span>
                        <span className="text-orange">{new Date(appeal.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="font-sans text-xs bg-secondary/30 p-3 border border-foreground/10">
                        {appeal.reasonText}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ArenaContainer>
      </main>

      <Footer />
    </div>
  );
}
