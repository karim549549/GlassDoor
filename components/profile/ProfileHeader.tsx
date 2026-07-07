"use client";

import React, { useState, useRef } from "react";
import { Camera, Edit2 } from "lucide-react";
import { CropperModal } from "./CropperModal";
import { useAuthStore } from "@/lib/client/useAuthStore";

interface ProfileHeaderProps {
  userProfile: {
    id: string;
    fullName: string | null;
    email: string;
    avatarUrl: string | null;
    coverUrl: string | null;
  };
  isOwner: boolean;
  onUpdateSuccess?: (type: "avatar" | "cover", newUrl: string) => void;
}

export function ProfileHeader({ userProfile, isOwner, onUpdateSuccess }: ProfileHeaderProps) {
  const { setAuth, roles } = useAuthStore();
  const [profile, setProfile] = useState(userProfile);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropType, setCropType] = useState<"avatar" | "cover">("avatar");
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get name initials for default avatar monogram
  const getInitials = () => {
    if (!profile.fullName) return profile.email.slice(0, 2).toUpperCase();
    return profile.fullName
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const handleEditClick = (type: "avatar" | "cover") => {
    if (!isOwner) return;
    setCropType(type);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear file choice
      fileInputRef.current.click();
    }
  };

  const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
  const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024; // 5MB, matches the "DevsArena" bucket limit

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
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
        // Preserve the real roles from the store instead of hardcoding one -
        // this store update only changes avatar/cover, not the user's role.
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

      {/* Cover Image Background (absolute layer) */}
      <div className="absolute inset-0 z-0">
        {profile.coverUrl ? (
          <img
            src={profile.coverUrl}
            alt="Profile Cover"
            className="w-full h-full object-cover opacity-80"
          />
        ) : (
          // Brutalist blueprints layout grid paper background
          <div
            className="w-full h-full bg-[#1A1A19] bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:20px_20px]"
          />
        )}
        {/* Dark contrast gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/10 z-10" />
      </div>

      {/* Edit Cover Pencil Button */}
      {isOwner && (
        <button
          onClick={() => handleEditClick("cover")}
          className="absolute top-20 right-6 p-2 bg-[#F1EFE9] text-[#0E0E0D] border border-[#0E0E0D] font-mono text-[0.55rem] uppercase tracking-wider font-bold hover:bg-[#0E0E0D] hover:text-[#F1EFE9] transition-colors cursor-pointer flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(14,14,13,0.15)] z-30 hover:shadow-none active:translate-x-0.5 active:translate-y-0.5"
        >
          <Camera className="h-3.5 w-3.5" />
          <span>Edit Banner</span>
        </button>
      )}

      {/* Overlay Content Container (stretches to page constraint) */}
      <div className="relative z-20 w-full max-w-4xl mx-auto px-6 pt-24 pb-8 sm:pt-32 sm:pb-12 flex flex-col sm:flex-row items-center sm:items-end gap-6 text-[#F1EFE9] text-center sm:text-left">
        
        {/* Circular Avatar overlap */}
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-2 border-[#F1EFE9] overflow-hidden bg-[#FAF8F5] relative group/avatar shadow-2xl shrink-0">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-display text-[2rem] font-bold text-[#0E0E0D] bg-[#FAF8F5]">
              {getInitials()}
            </div>
          )}

          {/* Edit Avatar Hover Button */}
          {isOwner && (
            <button
              onClick={() => handleEditClick("avatar")}
              className="absolute inset-0 bg-[#0E0E0D]/75 opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-150 flex flex-col items-center justify-center text-[#F1EFE9] cursor-pointer"
            >
              <Camera className="h-5 w-5 mb-1" />
              <span className="font-mono text-[0.45rem] uppercase tracking-wider font-bold">
                Change
              </span>
            </button>
          )}
        </div>

        {/* Identity Details */}
        <div className="flex-1 min-w-0 flex flex-col items-center sm:items-start">
          <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-[#F1EFE9] drop-shadow-md">
            {profile.fullName || "Developer Identity"}
          </h1>
          <p className="font-mono text-[0.65rem] sm:text-[0.75rem] text-[#F1EFE9]/70 uppercase tracking-widest mt-1.5 sm:mt-2 truncate max-w-full">
            {profile.email}
          </p>
          <span className="font-mono text-[0.52rem] uppercase tracking-widest border border-[#F1EFE9]/25 px-2 py-0.5 mt-3.5 inline-block bg-[#F1EFE9]/5 text-[#F1EFE9]/60 select-none">
            Member since {new Date().getFullYear()}
          </span>
        </div>
      </div>

      {/* Cropper Modal Overlay */}
      <CropperModal
        isOpen={cropperOpen}
        onClose={() => {
          setCropperOpen(false);
          setImageSrc(null);
        }}
        imageSrc={imageSrc}
        aspectRatio={cropType === "avatar" ? 1 : 3}
        onCropComplete={handleCropComplete}
        isLoading={isUploading}
      />
    </div>
  );
}

export default ProfileHeader;
