"use client";

import React, { useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { CropperModal } from "./CropperModal";
import { ProfileCoverImage } from "./header/ProfileCoverImage";
import { ProfileIdentityCard } from "./header/ProfileIdentityCard";
import { ProfileFollowButton } from "./header/ProfileFollowButton";
import { ProfileLinksBar } from "./header/ProfileLinksBar";
import { useAuthStore } from "@/lib/client/useAuthStore";
import { useToast } from "@/components/providers/ToastProvider";
import { ACCEPTED_IMAGE_TYPES, MAX_UPLOAD_SIZE_BYTES } from "@/lib/upload-constants";
import type { UserProfile } from "./types";

interface ProfileHeaderProps {
  userProfile: UserProfile;
  isOwner: boolean;
  onEditClick?: () => void;
  onUpdateSuccess?: (type: "avatar" | "cover", newUrl: string) => void;
}

export function ProfileHeader({ userProfile, isOwner, onEditClick, onUpdateSuccess }: ProfileHeaderProps) {
  const { setAuth, roles, user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [profile, setProfile] = useState(userProfile);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropType, setCropType] = useState<"avatar" | "cover">("avatar");
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Social followers state
  const [followersCount, setFollowersCount] = useState(userProfile.followersCount);
  const [isFollowing, setIsFollowing] = useState(userProfile.isFollowing);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Resync local state whenever the userProfile prop identity changes (e.g.
  // after the edit modal saves and the parent's router.refresh() lands new
  // server data). Adjusted during render rather than in an effect, per
  // React's guidance for resetting state in response to a prop change -
  // avoids an extra render pass.
  const [syncedUserProfile, setSyncedUserProfile] = useState(userProfile);
  if (userProfile !== syncedUserProfile) {
    setSyncedUserProfile(userProfile);
    setProfile(userProfile);
    setFollowersCount(userProfile.followersCount);
    setIsFollowing(userProfile.isFollowing);
  }

  const handleEditClick = (type: "avatar" | "cover") => {
    if (!isOwner) return;
    setCropType(type);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear file choice
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
      alert("Please select a JPEG, PNG, or WebP image.");
      return;
    }

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      alert("Image must be under 5MB.");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setImageSrc(objectUrl);
    setCropperOpen(true);
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", croppedBlob, "cropped.jpg");
    formData.append("type", cropType);

    try {
      const response = await fetch("/api/profile/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Update local states
        const updated = {
          ...profile,
          [cropType === "avatar" ? "avatarUrl" : "coverUrl"]: result.url,
        };
        setProfile(updated);

        // Sync local auth context store if updating own active profile.
        if (isOwner) {
          setAuth(
            {
              id: profile.id,
              email: profile.email,
              fullName: profile.fullName,
              avatarUrl: cropType === "avatar" ? result.url : profile.avatarUrl,
              coverUrl: cropType === "cover" ? result.url : profile.coverUrl,
            },
            roles
          );
        }

        if (onUpdateSuccess) {
          onUpdateSuccess(cropType, result.url);
        }

        setCropperOpen(false);
      } else {
        alert(result.error || "Failed to upload image.");
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred during image upload.");
    } finally {
      setIsUploading(false);
      setImageSrc(null);
    }
  };

  const handleFollowToggle = async () => {
    if (!user) {
      toast("Please sign in to follow developers!", "info");
      router.push(`/login?redirectTo=${encodeURIComponent(pathname)}`);
      return;
    }

    if (isFollowLoading) return;

    const previousIsFollowing = isFollowing;
    const previousFollowersCount = followersCount;

    // Optimistically update local states
    const nextIsFollowing = !previousIsFollowing;
    setIsFollowing(nextIsFollowing);
    setFollowersCount(nextIsFollowing ? previousFollowersCount + 1 : previousFollowersCount - 1);
    setIsFollowLoading(true);

    try {
      const res = await fetch("/api/user/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: profile.id }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Sync state with exact server values
        setIsFollowing(data.following);
        setFollowersCount(data.followersCount);

        const action = data.following ? "followed" : "unfollowed";
        const name = profile.fullName || "developer";
        toast(`Successfully ${action} ${name}!`, "success");
      } else {
        // Rollback states
        setIsFollowing(previousIsFollowing);
        setFollowersCount(previousFollowersCount);
        toast(data.error || "Failed to update follow status.", "error");
      }
    } catch (err) {
      console.error("Failed to toggle follow status:", err);
      // Rollback states
      setIsFollowing(previousIsFollowing);
      setFollowersCount(previousFollowersCount);
      toast("Network error. Failed to update follow status.", "error");
    } finally {
      setIsFollowLoading(false);
    }
  };

  return (
    <div className="w-full relative bg-[#0E0E0D] border-b border-[#0E0E0D] overflow-hidden pt-14 select-none">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />

      <ProfileCoverImage coverUrl={profile.coverUrl} isOwner={isOwner} onEditClick={() => handleEditClick("cover")} />

      {/* Overlay Content Container (full-width left aligned) */}
      <div className="relative z-20 w-full px-8 md:px-12 pt-24 pb-8 sm:pt-32 sm:pb-10 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6 text-[#F1EFE9] text-center sm:text-left">
        <ProfileIdentityCard
          fullName={profile.fullName}
          handle={profile.handle}
          email={profile.email}
          avatarUrl={profile.avatarUrl}
          isOwner={isOwner}
          onEditClick={() => handleEditClick("avatar")}
        />

        {!isOwner && (
          <ProfileFollowButton isFollowing={isFollowing} isFollowLoading={isFollowLoading} onToggle={handleFollowToggle} />
        )}
      </div>

      <ProfileLinksBar
        githubUrl={profile.githubUrl}
        linkedinUrl={profile.linkedinUrl}
        portfolioUrl={profile.portfolioUrl}
        isOwner={isOwner}
        onEditClick={onEditClick}
        rating={profile.rating}
        followersCount={followersCount}
        createdAt={profile.createdAt}
        lastActiveAt={profile.lastActiveAt}
      />

      {/* Cropper Modal Overlay */}
      <CropperModal
        isOpen={cropperOpen}
        onClose={() => {
          setCropperOpen(false);
          setImageSrc(null);
        }}
        imageSrc={imageSrc}
        aspectRatio={cropType === "avatar" ? 1 : 4}
        onCropComplete={handleCropComplete}
        isLoading={isUploading}
      />
    </div>
  );
}

export default ProfileHeader;
