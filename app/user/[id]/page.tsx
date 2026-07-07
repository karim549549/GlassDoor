import { notFound } from "next/navigation";
import { createClient } from "@/lib/server/supabase/server";
import { prisma } from "@/lib/server/prisma";
import { ProfileView } from "@/components/profile/ProfileView";

interface UserPageProps {
  params: Promise<{ id: string }>;
}

export default async function UserPage({ params }: UserPageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  // Fetch target user profile, follower count, and follow status in parallel -
  // scoped queries instead of loading every follower row just to compute a
  // count and a membership check.
  const [dbUser, followersCount, followRow] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      include: {
        skills: { include: { skill: true } },
        jobTypes: { include: { jobType: true } },
      },
    }),
    prisma.follows.count({ where: { followingId: id } }),
    currentUser
      ? prisma.follows.findUnique({
          where: { followerId_followingId: { followerId: currentUser.id, followingId: id } },
        })
      : Promise.resolve(null),
  ]);

  if (!dbUser) {
    notFound();
  }

  const isOwner = currentUser?.id === id;

  // Compile unified layout payload structure matching ProfileHeader and ProfileView types
  const profileData = {
    id: dbUser.id,
    fullName: dbUser.fullName,
    firstName: dbUser.firstName,
    lastName: dbUser.lastName,
    handle: dbUser.handle,
    email: dbUser.email,
    avatarUrl: dbUser.avatarUrl,
    coverUrl: dbUser.coverUrl,
    bio: dbUser.bio,
    employmentStatus: dbUser.employmentStatus,
    currentEmployer: dbUser.currentEmployer,
    seniority: dbUser.seniority,
    education: dbUser.education,
    location: dbUser.location,
    githubUrl: dbUser.githubUrl,
    linkedinUrl: dbUser.linkedinUrl,
    portfolioUrl: dbUser.portfolioUrl,
    rating: dbUser.rating,
    createdAt: dbUser.createdAt.toISOString(),
    lastActiveAt: dbUser.lastActiveAt ? dbUser.lastActiveAt.toISOString() : null,
    skills: dbUser.skills,
    jobTypes: dbUser.jobTypes,
    followersCount,
    isFollowing: !!followRow,
  };

  return (
    <main className="min-h-screen bg-[#F1EFE9] text-[#0E0E0D]">
      <ProfileView userProfile={profileData} isOwner={isOwner} />
    </main>
  );
}
