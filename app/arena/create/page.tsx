"use client";

import { useRouter } from "next/navigation";
import type { ArenaFormOutput } from "@/lib/arena/schema";
import { useToast } from "@/components/providers/ToastProvider";
import { logger } from "@/lib/client/logger";
import { ArenaForm } from "@/components/arena/create/ArenaForm";
import { BackgroundGrid } from "@/components/ui/BackgroundGrid";
import { PageMasthead } from "@/components/site/PageMasthead";

/**
 * Write a brief.
 *
 * The page this replaces opened with a near-black masthead - `pt-24 pb-12` of
 * `bg-foreground` carrying a shrunken preview of the arena card in a second
 * column - which together took roughly the top half of the viewport before a
 * single field. Beside the form sat a "[PROGRESS REGISTER HUD]" listing the
 * same sections again with strikethrough: two panels showing state, neither
 * taking input.
 *
 * The band stays, because it is what makes this page look like the rest of the
 * site - at a third of the height, with nothing beside the title. The preview
 * is gone (it previewed a card design that no longer exists, arenas having
 * lost their cover image) and so is the HUD, because progress now lives in the
 * step rail where it is also the navigation.
 *
 * The six steps themselves moved to `components/arena/create/ArenaForm.tsx`
 * when `/arena/[id]/edit` arrived, so a host edits a brief in the screen they
 * wrote it in.
 */
export default function CreateArenaPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (payload: ArenaFormOutput): Promise<string | null> => {
    try {
      const res = await fetch("/api/arena", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok || result.error) {
        return result.error || "Could not post the brief.";
      }

      toast("Brief posted.", "success");
      // To the arena itself, not back to the board. The host has just written
      // something and wants to see it; finding it again in a list of fifty is
      // not a reward for finishing the form.
      router.push(`/arena/${result.id}`);
      return null;
    } catch (err) {
      logger.error("Arena creation failed", {
        error: err instanceof Error ? err.message : String(err),
      });
      return "Network error. The brief was not posted.";
    }
  };

  return (
    <main id="main-content" className="relative min-h-screen bg-background text-foreground">
      <BackgroundGrid opacity={0.055} />
      {/* The same band as the board, from the same component.

          It was written twice and the copies had already drifted: this one ran
          `py-8 md:py-10` against the board's `py-14 md:py-20`, with a different
          headline clamp and a different grid opacity. `short` here because the
          form below is the point and the band is orientation. */}
      <PageMasthead
        eyebrow="New brief"
        title="Write something you would want to build on a Saturday"
        standfirst="Pick the challenge you wanted to find, set the clock, and see who turns up. Free to run, online or in a room."
        size="short"
      />

      <ArenaForm mode="create" onSubmit={handleSubmit} />
    </main>
  );
}
