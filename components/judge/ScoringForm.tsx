"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { StarRating } from "@/components/ui/StarRating";
import { logger } from "@/lib/client/logger";

export interface ScoringCriterion {
  id: string;
  title: string;
  description: string;
  weight: number;
  maxScore: number;
}

export interface ExistingScore {
  criterionId: string;
  score: number;
  justification: string;
}

interface ScoringFormProps {
  assignmentId: string;
  arenaId: string;
  criteria: ScoringCriterion[];
  existingScores: ExistingScore[];
  existingFeedback: string | null;
}

interface CriterionDraft {
  score: string;
  justification: string;
}

/** Matches the server's `min(5)` on `justification` so the two cannot drift. */
const MIN_JUSTIFICATION_LENGTH = 5;

/**
 * A star picker only makes sense for a small whole-number scale. Anything else
 * (a weighted 7.5, a 100-point criterion) falls back to the numeric input,
 * which is always present anyway so that a score of 0 stays expressible.
 */
function supportsStars(maxScore: number): boolean {
  return Number.isInteger(maxScore) && maxScore >= 1 && maxScore <= 10;
}

export function ScoringForm({
  assignmentId,
  arenaId,
  criteria,
  existingScores,
  existingFeedback,
}: ScoringFormProps) {
  const router = useRouter();

  const initialDrafts = useMemo(() => {
    const byCriterion = new Map(existingScores.map((s) => [s.criterionId, s]));
    const drafts: Record<string, CriterionDraft> = {};
    for (const criterion of criteria) {
      const existing = byCriterion.get(criterion.id);
      drafts[criterion.id] = {
        score: existing ? String(existing.score) : "",
        justification: existing?.justification ?? "",
      };
    }
    return drafts;
  }, [criteria, existingScores]);

  const [drafts, setDrafts] = useState<Record<string, CriterionDraft>>(initialDrafts);
  const [feedbackText, setFeedbackText] = useState(existingFeedback ?? "");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateDraft = useCallback(
    (criterionId: string, patch: Partial<CriterionDraft>) => {
      setDrafts((prev) => ({ ...prev, [criterionId]: { ...prev[criterionId], ...patch } }));
    },
    []
  );

  const validate = useCallback((): Record<string, string> => {
    const errors: Record<string, string> = {};

    for (const criterion of criteria) {
      const draft = drafts[criterion.id];
      const trimmedScore = draft?.score.trim() ?? "";
      const numericScore = Number(trimmedScore);

      if (trimmedScore === "" || Number.isNaN(numericScore)) {
        errors[`score:${criterion.id}`] = "Enter a score for this criterion.";
      } else if (numericScore < 0) {
        errors[`score:${criterion.id}`] = "A score cannot be negative.";
      } else if (numericScore > criterion.maxScore) {
        errors[`score:${criterion.id}`] = `The maximum for this criterion is ${criterion.maxScore}.`;
      }

      // A score with no reasoning behind it is exactly what makes a credential
      // worthless, so this is a hard stop rather than a nudge.
      const justification = draft?.justification.trim() ?? "";
      if (justification.length < MIN_JUSTIFICATION_LENGTH) {
        errors[`justification:${criterion.id}`] =
          `Justification is required — explain this score in at least ${MIN_JUSTIFICATION_LENGTH} characters. An unjustified score cannot be published.`;
      }
    }

    return errors;
  }, [criteria, drafts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setFormError(null);

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setFormError("Fix the highlighted criteria before submitting your verdict.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/arena/${arenaId}/judge/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId,
          scores: criteria.map((criterion) => ({
            criterionId: criterion.id,
            score: Number(drafts[criterion.id].score.trim()),
            justification: drafts[criterion.id].justification.trim(),
          })),
          feedbackText: feedbackText.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setFormError(data.error || "Failed to submit your verdict.");
        return;
      }

      setSuccessMessage(
        `Verdict recorded. Weighted score for this submission: ${data.finalScore}.`
      );
      router.refresh();
    } catch (err) {
      logger.error("Failed to submit judge verdict", {
        error: err instanceof Error ? err.message : String(err),
      });
      setFormError("Network error. Your verdict was not submitted.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (criteria.length === 0) {
    return (
      <div className="border-2 border-dashed border-foreground/30 bg-card p-8 text-center">
        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          This arena has no locked rubric, so there is nothing to score yet. Ask
          the host to publish the rubric before judging opens.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {criteria.map((criterion) => {
        const draft = drafts[criterion.id];
        const scoreError = fieldErrors[`score:${criterion.id}`];
        const justificationError = fieldErrors[`justification:${criterion.id}`];
        const scoreInputId = `score-${criterion.id}`;
        const justificationInputId = `justification-${criterion.id}`;
        const numericScore = Number(draft?.score);

        return (
          <fieldset
            key={criterion.id}
            className="space-y-3 border-2 border-foreground bg-card p-5"
          >
            <legend className="px-1 font-mono text-[0.65rem] font-bold uppercase tracking-wider text-foreground">
              {criterion.title}
            </legend>

            <p className="font-sans text-xs leading-relaxed text-muted-foreground">
              {criterion.description}
            </p>
            <p className="font-mono text-[0.5rem] uppercase tracking-widest text-muted-foreground">
              Weight {criterion.weight} · Max score {criterion.maxScore}
            </p>

            {supportsStars(criterion.maxScore) && (
              <StarRating
                label="Quick score"
                max={criterion.maxScore}
                value={Number.isNaN(numericScore) ? 0 : numericScore}
                onChange={(v) => updateDraft(criterion.id, { score: String(v) })}
              />
            )}

            <div className="space-y-1">
              <label
                htmlFor={scoreInputId}
                className="block font-mono text-[0.55rem] font-bold uppercase tracking-wider text-muted-foreground"
              >
                Score (0 – {criterion.maxScore})
              </label>
              <input
                id={scoreInputId}
                type="number"
                inputMode="decimal"
                min={0}
                max={criterion.maxScore}
                step="0.5"
                value={draft?.score ?? ""}
                onChange={(e) => updateDraft(criterion.id, { score: e.target.value })}
                aria-invalid={Boolean(scoreError)}
                className="w-32 border border-border bg-transparent p-2 font-mono text-xs outline-none focus:border-foreground"
              />
              {scoreError && (
                <p role="alert" className="font-mono text-[0.55rem] uppercase text-destructive">
                  {scoreError}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label
                htmlFor={justificationInputId}
                className="block font-mono text-[0.55rem] font-bold uppercase tracking-wider text-muted-foreground"
              >
                Justification (required)
              </label>
              <textarea
                id={justificationInputId}
                rows={3}
                value={draft?.justification ?? ""}
                onChange={(e) => updateDraft(criterion.id, { justification: e.target.value })}
                placeholder="Point to what in the submission earned this score."
                aria-invalid={Boolean(justificationError)}
                className="w-full resize-none border border-border bg-transparent p-2 font-mono text-[0.65rem] outline-none focus:border-foreground"
              />
              {justificationError && (
                <p role="alert" className="font-mono text-[0.55rem] uppercase text-destructive">
                  {justificationError}
                </p>
              )}
            </div>
          </fieldset>
        );
      })}

      <div className="space-y-1 border-2 border-foreground bg-card p-5">
        <label
          htmlFor="verdict-feedback"
          className="block font-mono text-[0.55rem] font-bold uppercase tracking-wider text-muted-foreground"
        >
          Overall feedback to the entrant (optional)
        </label>
        <textarea
          id="verdict-feedback"
          rows={4}
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          className="w-full resize-none border border-border bg-transparent p-2 font-mono text-[0.65rem] outline-none focus:border-foreground"
        />
      </div>

      {formError && (
        <p
          role="alert"
          className="border border-destructive bg-destructive/10 p-3 font-mono text-[0.6rem] uppercase tracking-wider text-destructive"
        >
          {formError}
        </p>
      )}

      {successMessage && (
        <p
          role="status"
          className="border border-foreground bg-secondary p-3 font-mono text-[0.6rem] uppercase tracking-wider text-foreground"
        >
          {successMessage}
        </p>
      )}

      <Button type="submit" isLoading={isSubmitting}>
        Submit verdict
      </Button>
    </form>
  );
}

export default ScoringForm;
