import { notFound } from "next/navigation";
import { fetchInternalApi } from "@/lib/server/api-client";
import { ProfileView } from "@/components/profile/ProfileView";
import type { UserProfileDto } from "@/lib/user/dto";

/** NextResponse.json() serializes Date fields to ISO strings before this ever reaches the client. */
type SerializedUserProfileDto = Omit<UserProfileDto, "createdAt" | "lastActiveAt"> & {
  createdAt: string;
  lastActiveAt: string | null;
};

interface UserPageProps {
  params: Promise<{ id: string }>;
}

export default async function UserPage({ params }: UserPageProps) {
  const { id } = await params;

  const res = await fetchInternalApi(`/api/user/${id}`, { cache: "no-store" });

  if (res.status === 404) {
    notFound();
  }
  if (!res.ok) {
    throw new Error("Failed to load user profile.");
  }

  const profile: SerializedUserProfileDto = await res.json();
  const { isOwner, ...profileData } = profile;

  return (
    <main className="min-h-screen bg-[#F1EFE9] text-[#0E0E0D]">
      <ProfileView userProfile={profileData} isOwner={isOwner} />
    </main>
  );
}
