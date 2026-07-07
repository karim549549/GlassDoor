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

  // Fetch target user profile along with decoupled skills, job specialties, and followers relations
  const dbUser = await prisma.user.findUnique({
    where: { id },
    include: {
      skills: {
        include: { skill: true },
      },
      jobTypes: {
        include: { jobType: true },
      },
      followers: true,
      following: true,
    },
  });

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
    githubUrl: dbUser.githubUrl,
    linkedinUrl: dbUser.linkedinUrl,
    portfolioUrl: dbUser.portfolioUrl,
    rating: dbUser.rating,
    createdAt: dbUser.createdAt.toISOString(),
    lastActiveAt: dbUser.lastActiveAt ? dbUser.lastActiveAt.toISOString() : null,
    skills: dbUser.skills,
    jobTypes: dbUser.jobTypes,
    followersCount: dbUser.followers.length,
    isFollowing: currentUser ? dbUser.followers.some((f) => f.followerId === currentUser.id) : false,
  };

  return (
    <main className="min-h-screen bg-[#F1EFE9] text-[#0E0E0D]">
      <ProfileView userProfile={profileData} isOwner={isOwner} />
    </main>
  );
}
