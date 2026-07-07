import { notFound } from "next/navigation";
import { createClient } from "@/lib/server/supabase/server";
import { prisma } from "@/lib/server/prisma";
import { ProfileHeader } from "@/components/profile/ProfileHeader";

interface UserPageProps {
  params: Promise<{ id: string }>;
}

export default async function UserPage({ params }: UserPageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  // Fetch target user profile from database. A Supabase-authenticated user
  // without a matching row here means login/signup/OAuth sync failed - see
  // lib/server/auth/auth-service.ts, which is now the only place that syncs.
  const dbUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!dbUser) {
    notFound();
  }

  // Owner check
  const isOwner = currentUser?.id === id;

  const profileData = {
    id: dbUser.id,
    fullName: dbUser.fullName,
    email: dbUser.email,
    avatarUrl: dbUser.avatarUrl,
    coverUrl: dbUser.coverUrl,
  };

  return (
    <main className="min-h-screen bg-[#F1EFE9] text-[#0E0E0D]">
      {/* Profile Header Block - Full Width */}
      <ProfileHeader userProfile={profileData} isOwner={isOwner} />

      {/* Constrained Details Grid */}
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sidebar Info */}
          <div className="border border-[#0E0E0D] bg-[#FAF8F5] p-5 font-mono text-[0.65rem] uppercase tracking-wider space-y-4 shadow-[4px_4px_0px_0px_rgba(14,14,13,0.08)]">
            <div className="border-b border-[#0E0E0D]/10 pb-2">
              <h3 className="font-bold text-[#0E0E0D]">Developer Stats</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Global Rank</span>
                <span className="font-bold text-[#0E0E0D]">Unranked</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Arena Points</span>
                <span className="font-bold text-orange">0 pts</span>
              </div>
            </div>
          </div>

          {/* History Panel */}
          <div className="md:col-span-2 border border-[#0E0E0D] bg-[#FAF8F5] p-5 font-mono text-[0.65rem] uppercase tracking-wider space-y-4 shadow-[4px_4px_0px_0px_rgba(14,14,13,0.08)]">
            <div className="border-b border-[#0E0E0D]/10 pb-2">
              <h3 className="font-bold text-[#0E0E0D]">Context History</h3>
            </div>
            <div className="text-center py-10 text-muted-foreground lowercase first-letter:uppercase">
              No competitions joined yet. Join an upcoming Arena to build your record.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
