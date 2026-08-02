import React from "react";
import Image from "next/image";
import { Camera } from "lucide-react";

interface ProfileIdentityCardProps {
  fullName: string | null;
  handle: string | null;
  email: string;
  avatarUrl: string | null;
  isOwner: boolean;
  onEditClick: () => void;
}

function getInitials(fullName: string | null, email: string) {
  if (!fullName) return email.slice(0, 2).toUpperCase();
  return fullName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Memoized: avatar + name/handle/email block only depends on identity fields,
 * not the header's follow/upload/cropper state. */
export const ProfileIdentityCard = React.memo(function ProfileIdentityCard({
  fullName,
  handle,
  email,
  avatarUrl,
  isOwner,
  onEditClick,
}: ProfileIdentityCardProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 flex-1 min-w-0">
      {/* Circular Avatar overlap */}
      <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-2 border-[#F1EFE9] overflow-hidden bg-[#FAF8F5] relative group/avatar shadow-2xl shrink-0">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt="Avatar"
            fill
            sizes="(min-width: 640px) 8rem, 6rem"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-display text-[2rem] font-bold text-[#0E0E0D] bg-[#FAF8F5]">
            {getInitials(fullName, email)}
          </div>
        )}

        {/* Edit Avatar Hover Button */}
        {isOwner && (
          <button
            onClick={onEditClick}
            className="absolute inset-0 bg-[#0E0E0D]/75 opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-150 flex flex-col items-center justify-center text-[#F1EFE9] cursor-pointer"
          >
            <Camera className="h-5 w-5 mb-1" />
            <span className="font-mono text-[0.45rem] uppercase tracking-wider font-bold">Change</span>
          </button>
        )}
      </div>

      {/* Identity Details */}
      <div className="flex-1 min-w-0 flex flex-col items-center sm:items-start pb-1">
        <div className="flex flex-col sm:flex-row sm:items-baseline gap-2.5">
          <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-[#F1EFE9] drop-shadow-md">
            {fullName || "Developer Identity"}
          </h1>
          {handle && (
            <span className="font-mono text-[0.65rem] sm:text-[0.75rem] text-orange font-bold tracking-wider lowercase">
              @{handle}
            </span>
          )}
        </div>
        <p className="font-mono text-[0.65rem] sm:text-[0.75rem] text-[#F1EFE9]/70 uppercase tracking-widest mt-1.5 sm:mt-2 truncate max-w-full">
          {email}
        </p>
      </div>
    </div>
  );
});
