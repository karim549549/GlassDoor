"use client";

import React from "react";
import { Folder, Heart } from "lucide-react";

interface ArenaTabsProps {
  activeTab: "all" | "my";
  setActiveTab: (tab: "all" | "my") => void;
  allCount: number;
  myCount: number;
}

export function ArenaTabs({ activeTab, setActiveTab, allCount, myCount }: ArenaTabsProps) {
  return (
    <div className="flex border-b border-foreground/20 gap-3 pb-0.5">
      <button
        onClick={() => setActiveTab("all")}
        className={`px-4 py-2 border-2 border-b-0 border-foreground font-mono text-[0.62rem] font-bold uppercase tracking-widest transition-all duration-150 flex items-center gap-2 -mb-[2px] relative z-10 ${
          activeTab === "all"
            ? "bg-card text-foreground shadow-[2px_-2px_0px_0px_var(--foreground)]"
            : "bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground"
        }`}
      >
        <Folder className="h-3.5 w-3.5" />
        <span>All Arenas</span>
        <span className={`text-[0.55rem] px-1 py-0.25 border border-current ${activeTab === "all" ? "bg-accent text-white" : "bg-secondary text-muted-foreground"}`}>
          {allCount}
        </span>
      </button>

      <button
        onClick={() => setActiveTab("my")}
        className={`px-4 py-2 border-2 border-b-0 border-foreground font-mono text-[0.62rem] font-bold uppercase tracking-widest transition-all duration-150 flex items-center gap-2 -mb-[2px] relative z-10 ${
          activeTab === "my"
            ? "bg-card text-foreground shadow-[2px_-2px_0px_0px_var(--foreground)]"
            : "bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground"
        }`}
      >
        <Heart className="h-3.5 w-3.5" />
        <span>My Arenas</span>
        <span className={`text-[0.55rem] px-1 py-0.25 border border-current ${activeTab === "my" ? "bg-accent text-white" : "bg-secondary text-muted-foreground"}`}>
          {myCount}
        </span>
      </button>
    </div>
  );
}

export default ArenaTabs;
