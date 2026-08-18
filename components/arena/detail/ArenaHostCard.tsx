"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Share2, Copy, Check } from "lucide-react";

interface ArenaHostCardProps {
  creator: {
    id: string;
    fullName: string | null;
    handle: string;
    avatarUrl: string | null;
  };
  isPrivate: boolean;
  /**
   * Only ever supplied to the host. The page drops it for everyone else, and
   * `isHost` below is the second lock on the same door: this card is rendered
   * in a column every visitor sees, so a future caller that forgets the first
   * gate should not be able to publish the code by accident.
   */
  inviteCode?: string | null;
  isHost: boolean;
}

export function ArenaHostCard({ creator, isPrivate, inviteCode, isHost }: ArenaHostCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Host Profile Card */}
      <div className="bg-white border-2 border-foreground shadow-[4px_4px_0px_0px_var(--foreground)] p-5 space-y-3">
        <div className="flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-orange font-bold border-b border-foreground/10 pb-2.5">
          <ShieldCheck className="w-4 h-4" />
          <span>ARENA ORGANIZER</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-full border-2 border-foreground overflow-hidden bg-foreground">
            {creator.avatarUrl ? (
              <Image src={creator.avatarUrl} alt={creator.handle} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-mono text-sm font-bold text-orange">
                {creator.handle.substring(0, 2).toUpperCase()}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-1">
              <span className="font-mono text-sm font-bold text-foreground">
                {creator.fullName || `@${creator.handle}`}
              </span>
            </div>
            <span className="font-mono text-[0.55rem] uppercase tracking-wider text-foreground/60 block">
              @{creator.handle} • Verified Host
            </span>
          </div>
        </div>

        <p className="font-mono text-[0.55rem] text-foreground/70 uppercase tracking-wide leading-relaxed">
          Organizer of tech competitions, algorithm battles, and open source hackathons on Devs Arena.
        </p>

        <div className="pt-2 border-t border-foreground/10">
          <Link
            href={`/profile/${creator.handle}`}
            className="w-full py-2 bg-foreground hover:bg-[#1f1f1d] text-background font-mono text-[0.58rem] uppercase tracking-widest font-bold border border-foreground flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>VIEW ORGANIZER PROFILE</span>
          </Link>
        </div>
      </div>

      {/* Share & Invite Link Card */}
      <div className="bg-white border-2 border-foreground shadow-[4px_4px_0px_0px_var(--foreground)] p-5 space-y-3">
        <div className="flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-orange font-bold border-b border-foreground/10 pb-2.5">
          <Share2 className="w-4 h-4" />
          <span>SHARE & INVITE</span>
        </div>

        <p className="font-mono text-[0.55rem] text-foreground/70 uppercase tracking-wide">
          {isPrivate
            ? "Private Arena: Share the invitation code below with candidates or team members."
            : "Public Arena: Share this event link on Twitter, LinkedIn, or Discord."}
        </p>

        {isHost && isPrivate && inviteCode && (
          <div className="p-2.5 bg-amber-50 border border-amber-300 space-y-1">
            <span className="font-mono text-[0.5rem] text-amber-800 uppercase tracking-widest block font-bold">
              PRIVATE INVITE CODE:
            </span>
            <code className="font-mono text-xs font-bold text-amber-900 tracking-wider block uppercase select-all">
              {inviteCode}
            </code>
          </div>
        )}

        <button
          onClick={handleCopyLink}
          className="w-full py-2 bg-white hover:bg-gray-50 text-foreground font-mono text-[0.58rem] uppercase tracking-widest font-bold border-2 border-foreground flex items-center justify-center gap-1.5 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? "LINK COPIED TO CLIPBOARD!" : "COPY ARENA LINK"}</span>
        </button>
      </div>
    </div>
  );
}

export default ArenaHostCard;
