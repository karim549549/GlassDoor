import React from "react";
import Image from "next/image";
import { Camera } from "lucide-react";

interface ProfileCoverImageProps {
  coverUrl: string | null;
  isOwner: boolean;
  onEditClick: () => void;
}

/** Memoized: re-renders only when the cover image or owner-editability changes,
 * not on unrelated header state (follow loading, cropper open, upload progress). */
export const ProfileCoverImage = React.memo(function ProfileCoverImage({
  coverUrl,
  isOwner,
  onEditClick,
}: ProfileCoverImageProps) {
  return (
    <>
      {/* Cover Image Background (absolute layer) */}
      <div className="absolute inset-0 z-0">
        {coverUrl ? (
          <Image src={coverUrl} alt="Profile Cover" fill sizes="100vw" priority className="object-cover opacity-80" />
        ) : (
          <div className="w-full h-full bg-[#1A1A19] bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:20px_20px]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/10 z-10" />
      </div>

      {/* Edit Cover Pencil Button */}
      {isOwner && (
        <button
          onClick={onEditClick}
          className="absolute top-20 right-6 p-2 bg-[#F1EFE9] text-[#0E0E0D] border border-[#0E0E0D] font-mono text-[0.55rem] uppercase tracking-wider font-bold hover:bg-[#0E0E0D] hover:text-[#F1EFE9] transition-colors cursor-pointer flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(14,14,13,0.15)] z-30 hover:shadow-none active:translate-x-0.5 active:translate-y-0.5"
        >
          <Camera className="h-3.5 w-3.5" />
          <span>Edit Banner</span>
        </button>
      )}
    </>
  );
});
