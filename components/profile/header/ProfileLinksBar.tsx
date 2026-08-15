import React from "react";

interface ProfileLinksBarProps {
  githubUrl: string | null;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  isOwner: boolean;
  onEditClick?: () => void;
  rating: number;
  followersCount: number;
  createdAt: string | Date;
  lastActiveAt: string | Date | null;
}

function formatLastActive(dateInput: string | Date | null) {
  if (!dateInput) return "OFFLINE";
  const date = new Date(dateInput);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 5) return "JUST NOW";
  if (diffMins < 60) return `${diffMins}M AGO`;
  if (diffHours < 24) return `${diffHours}H AGO`;
  return `${diffDays}D AGO`;
}

/** Memoized: this CV-style link/stats band only depends on its own display
 * fields, not the header's cropper/upload/follow-loading state. */
export const ProfileLinksBar = React.memo(function ProfileLinksBar({
  githubUrl,
  linkedinUrl,
  portfolioUrl,
  isOwner,
  onEditClick,
  rating,
  followersCount,
  createdAt,
  lastActiveAt,
}: ProfileLinksBarProps) {
  return (
    <div className="w-full border-t border-background/15 bg-card/5 backdrop-blur-sm select-text z-20 relative">
      <div className="w-full px-8 md:px-12 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 font-mono text-[0.55rem] uppercase tracking-wider text-background/85">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {githubUrl ? (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-orange transition-colors flex items-center gap-1 border-b border-dashed border-background/30 hover:border-orange pb-0.5"
            >
              GITHUB
            </a>
          ) : (
            isOwner && (
              <button
                type="button"
                onClick={onEditClick}
                className="text-background/40 hover:text-orange transition-colors flex items-center gap-1 border-b border-dashed border-background/20 hover:border-orange pb-0.5 cursor-pointer bg-transparent border-none p-0 font-mono text-[0.55rem] font-bold"
              >
                + ADD GITHUB
              </button>
            )
          )}
          {linkedinUrl ? (
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-orange transition-colors flex items-center gap-1 border-b border-dashed border-background/30 hover:border-orange pb-0.5"
            >
              LINKEDIN
            </a>
          ) : (
            isOwner && (
              <button
                type="button"
                onClick={onEditClick}
                className="text-background/40 hover:text-orange transition-colors flex items-center gap-1 border-b border-dashed border-background/20 hover:border-orange pb-0.5 cursor-pointer bg-transparent border-none p-0 font-mono text-[0.55rem] font-bold"
              >
                + ADD LINKEDIN
              </button>
            )
          )}
          {portfolioUrl ? (
            <a
              href={portfolioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-orange transition-colors flex items-center gap-1 border-b border-dashed border-background/30 hover:border-orange pb-0.5"
            >
              WEBSITE
            </a>
          ) : (
            isOwner && (
              <button
                type="button"
                onClick={onEditClick}
                className="text-background/40 hover:text-orange transition-colors flex items-center gap-1 border-b border-dashed border-background/20 hover:border-orange pb-0.5 cursor-pointer bg-transparent border-none p-0 font-mono text-[0.55rem] font-bold"
              >
                + ADD WEBSITE
              </button>
            )
          )}

          <div className="h-3.5 w-px bg-background/25 hidden sm:block" />

          <span className="font-bold text-background">
            RATING: <span className="text-orange">{rating || 0}</span>
          </span>
          <span className="font-bold text-background">
            FOLLOWERS: <span className="text-orange">{followersCount}</span>
          </span>
          <span>REGISTERED: {new Date(createdAt).toLocaleDateString()}</span>
          <span>ACTIVE: {formatLastActive(lastActiveAt)}</span>
        </div>
      </div>
    </div>
  );
});
