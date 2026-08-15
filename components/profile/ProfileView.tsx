"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ProfileHeader } from "./ProfileHeader";
import { EditProfileModal } from "./EditProfileModal";
import { DeveloperProfileCard } from "./view/DeveloperProfileCard";
import { ArenaStatsCard } from "./view/ArenaStatsCard";
import { ArenaPerformanceRecord } from "./view/ArenaPerformanceRecord";
import { BackgroundGrid } from "../ui/BackgroundGrid";
import type { UserProfile } from "./types";

interface ProfileViewProps {
  userProfile: UserProfile;
  isOwner: boolean;
}

export function ProfileView({ userProfile, isOwner }: ProfileViewProps) {
  const [profile, setProfile] = useState(userProfile);
  const router = useRouter();
  const pathname = usePathname();

  const handleSaveSuccess = async () => {
    // Re-run the Server Component tree to pick up the saved changes,
    // without a full page reload.
    router.refresh();
  };

  const isDefined = (value: string | undefined): value is string => Boolean(value);
  // Pre-formatted skills
  const skillsList = profile.skills?.map((s) => s.name).filter(isDefined) || [];
  // Pre-formatted job types (specialties)
  const specialties = profile.jobTypes?.map((j) => j.name).filter(isDefined) || [];

  const isEditRoute = pathname === `/user/${profile.id}/edit`;

  return (
    <div className="min-h-screen bg-background text-foreground pb-16 relative overflow-hidden">
      {/* Blueprint Grid Backdrop */}
      <BackgroundGrid />

      {/* Cover and header ribbon banner */}
      <ProfileHeader
        userProfile={profile}
        isOwner={isOwner}
        onEditClick={() => router.push(`/user/${profile.id}/edit`)}
        onUpdateSuccess={(type, url) => {
          setProfile((prev) => ({ ...prev, [type === "avatar" ? "avatarUrl" : "coverUrl"]: url }));
        }}
      />

      {/* Main Stacked Feed Container (max-w-[1500px] matching header padding) */}
      <div className="max-w-[1500px] mx-auto mt-8 px-8 md:px-12 space-y-6 relative z-10">
        {/* Top Row: Left Profile Info (2/3) & Right Arena Stats (1/3) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          <DeveloperProfileCard
            bio={profile.bio}
            skillsList={skillsList}
            specialty={specialties[0]}
            seniority={profile.seniority}
            employmentStatus={profile.employmentStatus}
            currentEmployer={profile.currentEmployer}
            education={profile.education}
            location={profile.location}
            isOwner={isOwner}
            onEditClick={() => router.push(`/user/${profile.id}/edit`)}
          />

          <ArenaStatsCard rating={profile.rating} />
        </div>

        {/* Bottom Row: Full-width Arena Performance Record Card */}
        <ArenaPerformanceRecord />
      </div>

      {/* Edit Profile Modal Dialog */}
      <EditProfileModal
        isOpen={isEditRoute}
        onClose={() => router.push(`/user/${profile.id}`)}
        user={profile}
        onSaveSuccess={handleSaveSuccess}
      />
    </div>
  );
}
