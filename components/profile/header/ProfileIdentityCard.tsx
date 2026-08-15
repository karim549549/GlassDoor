import React from "react";
import Image from "next/image";
import { Camera } from "lucide-react";

interface ProfileIdentityCardProps {
  fullName: string | null;
  handle: string | null;
  avatarUrl: string | null;
  isOwner: boolean;
  onEditClick: () => void;
}

/**
 * Initials fall back to the handle rather than the email. This card renders on
 * a public profile, and the email address it used to display (and derive
 * initials from) is no longer fetched at all - see USER_PROFILE_SELECT in
 * lib/user/service.ts.
 */
function getInitials(fullName: string | null, handle: string | null) {
  const source = fullName?.trim() || handle?.trim();
  if (!source) return "??";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return parts
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Memoized: avatar + name/handle block only depends on identity fields,
 * not the header's follow/upload/cropper state. */
export const ProfileIdentityCard = React.memo(function ProfileIdentityCard({
  fullName,
  handle,
  avatarUrl,
  isOwner,
  onEditClick,
}: ProfileIdentityCardProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 flex-1 min-w-0">
      {/* Circular Avatar overlap */}
      <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-2 border-background overflow-hidden bg-card relative group/avatar shadow-2xl shrink-0">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt="Avatar"
            fill
            sizes="(min-width: 640px) 8rem, 6rem"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-display text-[2rem] font-bold text-foreground bg-card">
            {getInitials(fullName, handle)}
          </div>
        )}

        {/* Edit Avatar Hover Button */}
        {isOwner && (
          <button
            onClick={onEditClick}
            className="absolute inset-0 bg-foreground/75 opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-150 flex flex-col items-center justify-center text-background cursor-pointer"
          >
            <Camera className="h-5 w-5 mb-1" />
            <span className="font-mono text-[0.45rem] uppercase tracking-wider font-bold">Change</span>
          </button>
        )}
      </div>

      {/* Identity Details */}
      <div className="flex-1 min-w-0 flex flex-col items-center sm:items-start pb-1">
        <div className="flex flex-col sm:flex-row sm:items-baseline gap-2.5">
          <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-background drop-shadow-md">
            {fullName || "Developer Identity"}
          </h1>
          {handle && (
            <span className="font-mono text-[0.65rem] sm:text-[0.75rem] text-orange font-bold tracking-wider lowercase">
              @{handle}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});
