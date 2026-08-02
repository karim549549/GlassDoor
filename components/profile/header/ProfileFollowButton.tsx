import React from "react";

interface ProfileFollowButtonProps {
  isFollowing: boolean;
  isFollowLoading: boolean;
  onToggle: () => void;
}

/** Memoized: only depends on follow state, not the header's cropper/upload state. */
export const ProfileFollowButton = React.memo(function ProfileFollowButton({
  isFollowing,
  isFollowLoading,
  onToggle,
}: ProfileFollowButtonProps) {
  return (
    <div className="shrink-0 mb-1 sm:mb-2">
      <button
        onClick={onToggle}
        disabled={isFollowLoading}
        className={`px-6 py-2.5 font-mono text-[0.65rem] font-bold border tracking-widest transition-all duration-150 cursor-pointer ${
          isFollowing
            ? "bg-[#F1EFE9] text-[#0E0E0D] border-[#F1EFE9] hover:bg-transparent hover:text-[#F1EFE9]"
            : "bg-transparent text-[#F1EFE9] border-[#F1EFE9]/40 hover:border-[#F1EFE9] hover:bg-[#F1EFE9]/10"
        }`}
      >
        {isFollowing ? "UNFOLLOW" : "FOLLOW"}
      </button>
    </div>
  );
});
