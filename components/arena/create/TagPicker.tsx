"use client";

import { useEffect, useState } from "react";
import type { UseFormSetValue, UseFormWatch } from "react-hook-form";
import type { ArenaFormInput } from "@/lib/arena/schema";
import { logger } from "@/lib/client/logger";

interface TagItem {
  id: string;
  name: string;
  slug: string;
}

/**
 * Replaces TagSelectionSection's boxed card and its GoldenTicketTag chips.
 *
 * The chips carried a per-tag "metallic colorway" read from a `color` column
 * on the tags table - presentation stored in the database, so changing the
 * palette meant a migration. Here every tag looks the same and selection is
 * the only state, which is also the only state that means anything.
 */
export function TagPicker({
  watch,
  setValue,
}: {
  watch: UseFormWatch<ArenaFormInput>;
  setValue: UseFormSetValue<ArenaFormInput>;
}) {
  const [tags, setTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(true);

  const selected = (watch("tags") as string[] | undefined) ?? [];

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/arena/tags");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setTags(data.tags ?? []);
      } catch (err) {
        logger.error("Failed to load arena tags", {
          error: err instanceof Error ? err.message : String(err),
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const toggle = (id: string) => {
    const next = selected.includes(id)
      ? selected.filter((t) => t !== id)
      : [...selected, id];
    setValue("tags", next, { shouldValidate: true });
  };

  if (loading) {
    return (
      <p className="font-mono text-[0.55rem] uppercase tracking-wider text-muted-foreground">
        Loading tags…
      </p>
    );
  }

  if (tags.length === 0) {
    return (
      <p className="font-mono text-[0.55rem] uppercase tracking-wider text-muted-foreground">
        No tags yet
      </p>
    );
  }

  return (
    <ul className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        const isOn = selected.includes(tag.id);
        return (
          <li key={tag.id}>
            <button
              type="button"
              onClick={() => toggle(tag.id)}
              aria-pressed={isOn}
              className={[
                "border px-3 py-1.5 font-mono text-[0.58rem] uppercase tracking-[0.12em] transition-colors",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange",
                isOn
                  ? "border-orange bg-orange text-[#0E0E0D]"
                  : "border-foreground/25 bg-transparent text-foreground hover:border-foreground/60",
              ].join(" ")}
            >
              {tag.name}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export default TagPicker;
