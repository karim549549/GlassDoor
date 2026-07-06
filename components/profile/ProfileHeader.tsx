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
  const { setAuth } = useAuthStore();
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size and format
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
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

        // Sync local auth context store if updating own active profile
        if (isOwner) {
          setAuth(
            {
              id: profile.id,
              email: profile.email,
              fullName: profile.fullName,
              avatarUrl: cropType === "avatar" ? result.url : profile.avatarUrl,
              coverUrl: cropType === "cover" ? result.url : profile.coverUrl,
            },
            ["USER"]
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
    <div className="w-full bg-[#FAF8F5] border border-[#0E0E0D]">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Cover Image Block (3:1 aspect ratio) */}
      <div className="w-full aspect-[3/1] relative overflow-hidden bg-[#FAF8F5] border-b border-[#0E0E0D] group">
        {profile.coverUrl ? (
          <img
            src={profile.coverUrl}
            alt="Profile Cover"
            className="w-full h-full object-cover select-none pointer-events-none"
          />
        ) : (
          // Stark brutalist architectural layout grid paper background
          <div
            className="w-full h-full bg-[#E4E1D9] bg-[linear-gradient(to_right,#0e0e0d0b_1px,transparent_1px),linear-gradient(to_bottom,#0e0e0d0b_1px,transparent_1px)] bg-[size:16px_16px]"
          />
        )}

        {/* Edit Cover Pencil Button */}
        {isOwner && (
          <button
            onClick={() => handleEditClick("cover")}
            className="absolute top-4 right-4 p-2 bg-[#F1EFE9] text-[#0E0E0D] border border-[#0E0E0D] font-mono text-[0.55rem] uppercase tracking-wider font-bold hover:bg-[#0E0E0D] hover:text-[#F1EFE9] transition-colors cursor-pointer flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(14,14,13,0.15)] hover:shadow-none active:translate-x-0.5 active:translate-y-0.5"
          >
            <Camera className="h-3.5 w-3.5" />
            <span>Edit Banner</span>
          </button>
        )}
      </div>

      {/* Lower Profile Header Section */}
      <div className="px-6 pb-6 pt-16 sm:pt-20 relative flex flex-col sm:flex-row sm:items-end justify-between gap-5">
        {/* Avatar Frame (1:1 aspect ratio) */}
        <div className="absolute top-0 left-6 -translate-y-1/2 w-24 h-24 sm:w-28 sm:h-28 border border-[#0E0E0D] bg-[#F1EFE9] overflow-hidden select-none group/avatar shadow-[4px_4px_0px_0px_rgba(14,14,13,0.15)]">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-display text-[1.8rem] italic text-muted-foreground bg-[#E4E1D9]">
              {getInitials()}
            </div>
          )}

          {/* Edit Avatar Overlay Hover Button */}
          {isOwner && (
            <button
              onClick={() => handleEditClick("avatar")}
              className="absolute inset-0 bg-[#0E0E0D]/70 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex flex-col items-center justify-center text-[#F1EFE9] cursor-pointer"
            >
              <Camera className="h-5 w-5 mb-1" />
              <span className="font-mono text-[0.45rem] uppercase tracking-wider font-bold">
                Change
              </span>
            </button>
          )}
        </div>

        {/* Left Side: Name and Affiliation Details */}
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-2xl sm:text-3xl italic tracking-tight text-[#0E0E0D] truncate">
            {profile.fullName || "Developer Identity"}
          </h1>
          <p className="font-mono text-[0.6rem] text-muted-foreground uppercase mt-1 tracking-widest truncate">
            {profile.email}
          </p>
        </div>

        {/* Right Side: Simple verification status indicators */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="font-mono text-[0.55rem] uppercase tracking-widest border border-[#0E0E0D]/15 px-2 py-1 text-muted-foreground bg-[#E4E1D9]/40 select-none">
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
