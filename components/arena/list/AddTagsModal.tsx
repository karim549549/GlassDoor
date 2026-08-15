"use client";

import React, { useState } from "react";
import { Sparkles, Filter, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GoldenTicketTag } from "@/components/ui/GoldenTicketTag";
import { Button } from "@/components/ui/Button";

interface TagItem {
  id: string;
  name: string;
  slug: string;
  color: string;
  count: number;
}

interface AddTagsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tags: TagItem[];
  selectedTag: string;
  onSelectTag: (tagSlug: string) => void;
}

export function AddTagsModal({
  isOpen,
  onClose,
  tags,
  selectedTag,
  onSelectTag,
}: AddTagsModalProps) {
  const [draftTag, setDraftTag] = useState<string>(selectedTag);

  const handleApply = () => {
    onSelectTag(draftTag);
    onClose();
  };

  const handleClear = () => {
    setDraftTag("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton={false} className="max-w-md bg-card text-foreground border-2 border-foreground p-6 shadow-[6px_6px_0px_0px_var(--foreground)] rounded-none">
        <DialogHeader className="border-b-2 border-double border-foreground pb-3 flex flex-row items-center justify-between">
          <div>
            <span className="font-mono text-[0.45rem] text-orange uppercase tracking-[0.25em] font-bold block mb-0.5">
              [CATEGORY SELECTION DIALOG]
            </span>
            <DialogTitle className="font-display italic text-lg uppercase text-foreground flex items-center gap-1.5">
              <Filter className="h-4 w-4 text-orange" /> Filter Arenas By Tag
            </DialogTitle>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-foreground/10 transition-colors border border-foreground cursor-pointer"
          >
            <X className="h-4 w-4 text-foreground" />
          </button>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <p className="font-mono text-[0.58rem] text-muted-foreground uppercase tracking-wider leading-relaxed">
            Select a Golden Ticket tag to filter the challenge directory.
          </p>

          <div className="flex flex-wrap gap-2 py-2 max-h-[260px] overflow-y-auto pr-1">
            {tags.map((t) => {
              const isSelected = draftTag.toLowerCase() === t.slug.toLowerCase();
              return (
                <GoldenTicketTag
                  key={t.id}
                  label={t.name}
                  count={t.count}
                  size="md"
                  isSelected={isSelected}
                  onClick={() => setDraftTag(isSelected ? "" : t.slug)}
                />
              );
            })}
          </div>
        </div>

        <div className="pt-3 border-t border-dashed border-foreground/20 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleClear}
            className="font-mono text-[0.56rem] text-muted-foreground uppercase font-bold hover:text-foreground transition-colors"
          >
            Reset Selection
          </button>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="py-1.5 px-3 font-mono text-[0.58rem] font-bold tracking-wider uppercase border-2 border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-card transition-all"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleApply}
              className="py-1.5 px-4 font-mono text-[0.58rem] font-bold tracking-wider uppercase border-2 border-foreground bg-orange text-white hover:bg-transparent hover:text-foreground shadow-[2px_2px_0px_0px_var(--foreground)] hover:shadow-none transition-all"
            >
              Apply Filter <Sparkles className="h-3 w-3 ml-1 inline-block" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AddTagsModal;
