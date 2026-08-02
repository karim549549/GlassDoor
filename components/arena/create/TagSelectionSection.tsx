"use client";

import React, { useEffect, useState } from "react";
import { Tag as TagIcon, Sparkles } from "lucide-react";
import type { UseFormSetValue, UseFormWatch } from "react-hook-form";
import { GoldenTicketTag } from "@/components/ui/GoldenTicketTag";
import type { ArenaFormInput } from "@/lib/arena/schema";

interface TagItem {
  id: string;
  name: string;
  slug: string;
  color: string;
  category: string;
  count: number;
}

interface TagSelectionSectionProps {
  setValue: UseFormSetValue<ArenaFormInput>;
  watch: UseFormWatch<ArenaFormInput>;
}

export function TagSelectionSection({ setValue, watch }: TagSelectionSectionProps) {
  const [availableTags, setAvailableTags] = useState<TagItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const selectedTagIds = (watch("tags") as string[]) || [];

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/arena/tags");
        if (res.ok) {
          const data = await res.json();
          setAvailableTags(data.tags || []);
        }
      } catch (err) {
        console.error("Failed to load tags:", err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const toggleTag = (tagId: string) => {
    const current = [...selectedTagIds];
    const existsIndex = current.indexOf(tagId);

    if (existsIndex >= 0) {
      current.splice(existsIndex, 1);
    } else {
      current.push(tagId);
    }

    setValue("tags", current, { shouldValidate: true });
  };

  return (
    <div className="border-2 border-foreground bg-white p-6 md:p-8 shadow-[4px_4px_0px_0px_#0E0E0D]">
      <div className="flex items-center justify-between border-b border-border pb-3 mb-6">
        <h2 className="font-mono text-[0.7rem] uppercase tracking-wider flex items-center gap-2 font-bold text-foreground">
          <TagIcon className="h-4 w-4 text-orange" /> Golden Ticket Arena Categories & Tags
        </h2>
        <span className="font-mono text-[0.52rem] text-muted-foreground uppercase tracking-widest flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-orange" /> RAG AI Compatible
        </span>
      </div>

      <div className="space-y-4">
        <p className="font-mono text-[0.58rem] text-muted-foreground uppercase tracking-wider leading-relaxed">
          Select Golden Ticket tags to categorize your arena. Developers can filter and discover your challenge by tech domain.
        </p>

        {isLoading ? (
          <div className="py-6 font-mono text-[0.58rem] text-muted-foreground uppercase animate-pulse">
            Loading Golden Ticket tags...
          </div>
        ) : availableTags.length > 0 ? (
          <div className="flex flex-wrap gap-3 pt-2">
            {availableTags.map((t) => {
              const isSelected = selectedTagIds.includes(t.id);
              return (
                <GoldenTicketTag
                  key={t.id}
                  label={t.name}
                  variant={(t.color as "golden" | "emerald" | "cyan" | "purple" | "orange" | "ruby" | "outline") || "golden"}
                  size="md"
                  isSelected={isSelected}
                  onClick={() => toggleTag(t.id)}
                />
              );
            })}
          </div>
        ) : (
          <div className="py-4 font-mono text-[0.58rem] text-muted-foreground uppercase">
            No tags found in system catalog.
          </div>
        )}
      </div>
    </div>
  );
}

export default TagSelectionSection;
