"use client";

import { useRouter } from "next/navigation";
import type { ArenaFormInput, ArenaFormOutput } from "@/lib/arena/schema";
import { toDateTimeLocal } from "@/lib/arena/schedule-presets";
import { useToast } from "@/components/providers/ToastProvider";
import { logger } from "@/lib/client/logger";
import { ArenaForm } from "@/components/arena/create/ArenaForm";

/**
 * The stored arena, as the form's fields want it.
 *
 * Dates arrive as ISO strings and are converted here rather than on the
 * server, and that is the reason this component is loaded with `ssr: false`
 * one level up. `datetime-local` inputs speak local time with no zone, so the
 * conversion depends on the reading machine's clock - the server's is UTC and
 * the host's is not, so rendering it in both places would hydrate a Cairo
 * evening onto a UTC afternoon and warn about it.
 */
export interface EditableArena {
  id: string;
  slug: string;
  title: string;
  description: string;
  rules: string[];
  difficulty: string;
  locationType: string;
  locationName: string | null;
  googleMapsUrl: string | null;
  isPrivate: boolean;
  inviteCode: string | null;
  isTeam: boolean;
  minTeamSize: number;
  maxTeamSize: number;
  maxParticipants: number | null;
  allowLeaderAccessControl: boolean | null;
  hasPrizePool: boolean;
  totalPrizePool: number | null;
  prizeCurrency: string;
  firstPlacePrize: number | null;
  secondPlacePrize: number | null;
  thirdPlacePrize: number | null;
  prizeDisbursementTerms: string | null;
  requireHiringConsent: boolean;
  companyId: string | null;
  requireGithubUrl: boolean;
  requireFigmaUrl: boolean;
  requireVideoUrl: boolean;
  requireWriteup: boolean;
  registrationStart: string;
  registrationEnd: string;
  ideaPhaseStart: string;
  ideaPhaseEnd: string;
  implPhaseStart: string;
  implPhaseEnd: string;
}

function toFormValues(arena: EditableArena): Partial<ArenaFormInput> {
  const local = (iso: string) => toDateTimeLocal(new Date(iso));

  return {
    title: arena.title,
    description: arena.description,
    rules: arena.rules,
    difficulty: arena.difficulty as ArenaFormInput["difficulty"],
    locationType: arena.locationType as ArenaFormInput["locationType"],
    locationName: arena.locationName,
    googleMapsUrl: arena.googleMapsUrl,
    isPrivate: arena.isPrivate,
    inviteCode: arena.inviteCode,
    isTeam: arena.isTeam,
    minTeamSize: arena.minTeamSize,
    maxTeamSize: arena.maxTeamSize,
    maxParticipants: arena.maxParticipants,
    allowLeaderAccessControl: arena.allowLeaderAccessControl ?? true,
    hasPrizePool: arena.hasPrizePool,
    totalPrizePool: arena.totalPrizePool,
    prizeCurrency: arena.prizeCurrency as ArenaFormInput["prizeCurrency"],
    firstPlacePrize: arena.firstPlacePrize,
    secondPlacePrize: arena.secondPlacePrize,
    thirdPlacePrize: arena.thirdPlacePrize,
    prizeDisbursementTerms: arena.prizeDisbursementTerms,
    requireHiringConsent: arena.requireHiringConsent,
    companyId: arena.companyId,
    requireGithubUrl: arena.requireGithubUrl,
    requireFigmaUrl: arena.requireFigmaUrl,
    requireVideoUrl: arena.requireVideoUrl,
    requireWriteup: arena.requireWriteup,
    registrationStart: local(arena.registrationStart),
    registrationEnd: local(arena.registrationEnd),
    ideaPhaseStart: local(arena.ideaPhaseStart),
    ideaPhaseEnd: local(arena.ideaPhaseEnd),
    implPhaseStart: local(arena.implPhaseStart),
    implPhaseEnd: local(arena.implPhaseEnd),
  };
}

export function EditArenaClient({ arena }: { arena: EditableArena }) {
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (payload: ArenaFormOutput): Promise<string | null> => {
    try {
      const res = await fetch(`/api/arena/${arena.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok || result.error) {
        return result.error || "Could not save the changes.";
      }

      toast("Changes saved.", "success");
      // The saved slug, not the one this page loaded with: renaming an arena
      // nobody has entered moves its URL, and pushing the old one would land
      // on a redirect at best.
      router.push(`/arena/${result.slug ?? arena.slug}`);
      // The arena page is server-rendered, so without this the host lands on
      // the cached version of what they just edited and concludes it failed.
      router.refresh();
      return null;
    } catch (err) {
      logger.error("Arena update failed", {
        arenaId: arena.id,
        error: err instanceof Error ? err.message : String(err),
      });
      return "Network error. Nothing was saved.";
    }
  };

  return (
    <ArenaForm mode="edit" initialValues={toFormValues(arena)} onSubmit={handleSubmit} />
  );
}

export default EditArenaClient;
