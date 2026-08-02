import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Tag as TagIcon } from "lucide-react";
import { ArenaTabs } from "@/components/arena/ArenaTabs";
import { GoldenTicketTag } from "@/components/ui/GoldenTicketTag";
import type { ArenaStatusFilter, ArenaAccessFilter, ArenaSortOption } from "@/lib/arena/schema";

interface TagFilterItem {
  id: string;
  name: string;
  slug: string;
  color: string;
  count: number;
}

interface ArenasFilterSidebarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  activeTab: "all" | "my";
  onTabChange: (tab: "all" | "my") => void;
  allCount: number;
  myCount: number;
  statusFilter: ArenaStatusFilter;
  onStatusChange: (status: ArenaStatusFilter) => void;
  accessFilter: ArenaAccessFilter;
  onAccessChange: (access: ArenaAccessFilter) => void;
  sortBy: ArenaSortOption;
  onSortChange: (sort: ArenaSortOption) => void;
  selectedTag?: string;
  onTagChange?: (tagSlug: string) => void;
}

/** Neo-brutalist search box, scope tabs, and filter/sort controls for the arena registry. */
export function ArenasFilterSidebar({
  searchQuery,
  onSearchChange,
  activeTab,
  onTabChange,
  allCount,
  myCount,
  statusFilter,
  onStatusChange,
  accessFilter,
  onAccessChange,
  sortBy,
  onSortChange,
  selectedTag = "",
  onTagChange,
}: ArenasFilterSidebarProps) {
  const [tags, setTags] = useState<TagFilterItem[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/arena/tags");
        if (res.ok) {
          const data = await res.json();
          setTags(data.tags || []);
        }
      } catch (err) {
        console.error("Failed to load sidebar tags:", err);
      }
    })();
  }, []);

  return (
    <div className="border-2 border-[#0E0E0D] bg-white p-5 shadow-[4px_4px_0px_0px_#0E0E0D] space-y-4">
      <span className="font-mono text-[0.48rem] text-orange uppercase tracking-[0.25em] font-bold block">
        [DIRECTORY SEARCH & FILTERS]
      </span>

      <div className="relative">
        <input
          type="text"
          placeholder="Search Arena..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-[#FAF8F5] border-2 border-[#0E0E0D] pl-9 pr-3 py-2 font-mono text-[0.62rem] placeholder-muted-foreground/60 uppercase focus:outline-none focus:border-orange transition-colors"
        />
        <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-[#0E0E0D]/60" />
      </div>

      <div className="flex flex-col gap-2 pt-2 border-t border-dashed border-[#0E0E0D]/10">
        <span className="font-mono text-[0.52rem] text-muted-foreground uppercase tracking-wider block">Scope</span>
        <ArenaTabs activeTab={activeTab} setActiveTab={onTabChange} allCount={allCount} myCount={myCount} />
      </div>

      {/* Golden Ticket Tag Filter Section */}
      {tags.length > 0 && (
        <div className="flex flex-col gap-2 pt-2 border-t border-dashed border-[#0E0E0D]/10">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[0.52rem] text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <TagIcon className="h-3 w-3 text-orange" /> Golden Ticket Tags
            </span>
            {selectedTag && onTagChange && (
              <button
                type="button"
                onClick={() => onTagChange("")}
                className="font-mono text-[0.48rem] text-orange uppercase font-bold hover:underline"
              >
                Clear Tag
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {tags.map((t) => {
              const isSelected = selectedTag.toLowerCase() === t.slug.toLowerCase();
              return (
                <GoldenTicketTag
                  key={t.id}
                  label={t.name}
                  count={t.count}
                  size="sm"
                  isSelected={isSelected}
                  onClick={() => onTagChange && onTagChange(isSelected ? "" : t.slug)}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Status Filter */}
      <div className="flex flex-col gap-1 pt-2 border-t border-dashed border-[#0E0E0D]/10">
        <label className="font-mono text-[0.52rem] text-muted-foreground uppercase tracking-wider block">Status</label>
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value as ArenaStatusFilter)}
          className="w-full bg-[#FAF8F5] border-2 border-[#0E0E0D] px-2 py-1.5 font-mono text-[0.6rem] uppercase focus:outline-none focus:border-orange cursor-pointer"
        >
          <option value="all">ALL STATUSES</option>
          <option value="open">REGISTRATION OPEN</option>
          <option value="active">ACTIVE STAGES</option>
          <option value="completed">COMPLETED</option>
        </select>
      </div>

      {/* Access Filter */}
      <div className="flex flex-col gap-1 pt-2 border-t border-dashed border-[#0E0E0D]/10">
        <label className="font-mono text-[0.52rem] text-muted-foreground uppercase tracking-wider block">Access</label>
        <select
          value={accessFilter}
          onChange={(e) => onAccessChange(e.target.value as ArenaAccessFilter)}
          className="w-full bg-[#FAF8F5] border-2 border-[#0E0E0D] px-2 py-1.5 font-mono text-[0.6rem] uppercase focus:outline-none focus:border-orange cursor-pointer"
        >
          <option value="all">ALL ACCESS</option>
          <option value="public">PUBLIC ONLY</option>
          <option value="private">INVITE ONLY</option>
        </select>
      </div>

      {/* Sorting Select Dropdown */}
      <div className="flex flex-col gap-1 pt-2 border-t border-dashed border-[#0E0E0D]/10">
        <label className="font-mono text-[0.52rem] text-muted-foreground uppercase tracking-wider block">Sort By</label>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as ArenaSortOption)}
          className="w-full bg-[#FAF8F5] border-2 border-[#0E0E0D] px-2 py-1.5 font-mono text-[0.6rem] uppercase focus:outline-none focus:border-orange cursor-pointer"
        >
          <option value="newest">NEWEST ADDED</option>
          <option value="oldest">OLDEST ADDED</option>
          <option value="title">ALPHABETICAL (A-Z)</option>
          <option value="teams">MOST TEAMS REGISTERED</option>
        </select>
      </div>

      <div className="pt-2 border-t border-dashed border-[#0E0E0D]/10">
        <Link
          href="/arena/create"
          className="w-full py-2.5 bg-orange text-white border-2 border-[#0E0E0D] font-mono text-[0.58rem] font-bold tracking-widest uppercase hover:bg-transparent hover:text-[#0E0E0D] transition-all duration-150 shadow-[2px_2px_0px_0px_#0E0E0D] hover:shadow-none active:translate-y-0.5 flex items-center justify-center gap-1.5"
        >
          <Plus className="h-3 w-3" /> Host Arena
        </Link>
      </div>
    </div>
  );
}

export default ArenasFilterSidebar;
