import "server-only";
import type { Prisma } from "@prisma/client";
import prisma from "@/lib/server/prisma";
import { uploadImageToStorage } from "@/lib/server/upload";
import { deriveArenaStatus } from "./status";
import { findSubmissionForActor } from "./submission-service";

/**
 * DEFENSE signal: a recorded oral defense of the entrant's own diff.
 *
 * This is the hardest of the three signals to fake, because it inverts the
 * usual direction of the test: the questions are generated FROM the artefact
 * rather than posed independently of it. "Why did commit 4f2a1c9 add 340 lines
 * to the auth middleware nine hours after you last touched it" has no answer
 * available to someone who did not make the decision - there is nothing to
 * look up, because the question is about a choice, not a fact.
 *
 * Which is exactly why the prompts must be derived from real `SubmissionCommit`
 * rows. A fixed question set ("explain your architecture", "what was hardest")
 * is memorisable, shareable and answerable from the code alone, and would make
 * this feature theatre.
 */

/* -------------------------------------------------------------------------- */
/* Upload validation                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Audio is accepted alongside video deliberately: the signal is the entrant
 * reasoning aloud about their own decisions, and requiring a face on camera
 * adds an accessibility and privacy cost that buys no additional evidence.
 */
export const ACCEPTED_DEFENSE_TYPES = [
  "video/webm",
  "video/mp4",
  "video/quicktime",
  "video/ogg",
  "audio/webm",
  "audio/mpeg",
  "audio/mp4",
  "audio/ogg",
  "audio/wav",
  "audio/x-m4a",
] as const;

/** A few minutes of talking-head video. Well above the 5MB image cap, well below a screen recording of a whole session. */
export const MAX_DEFENSE_UPLOAD_BYTES = 50 * 1024 * 1024;

const DEFENSE_EXTENSIONS: Record<string, string> = {
  "video/webm": "webm",
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/ogg": "ogv",
  "audio/webm": "weba",
  "audio/mpeg": "mp3",
  "audio/mp4": "m4a",
  "audio/ogg": "oga",
  "audio/wav": "wav",
  "audio/x-m4a": "m4a",
};

/**
 * MediaRecorder in the browser reports `video/webm;codecs=vp9,opus`, so the
 * parameters have to come off before the type is compared against the allow
 * list - otherwise every in-browser recording, the primary path, is rejected.
 */
export function normalizeMimeType(rawType: string): string {
  return rawType.split(";")[0].trim().toLowerCase();
}

export type ValidateDefenseResult = { ok: true; mimeType: string; extension: string } | { ok: false; error: string };

export function validateDefenseUpload(file: File): ValidateDefenseResult {
  const mimeType = normalizeMimeType(file.type || "");

  if (!ACCEPTED_DEFENSE_TYPES.includes(mimeType as (typeof ACCEPTED_DEFENSE_TYPES)[number])) {
    return { ok: false, error: "The defense recording must be an audio or video file (webm, mp4, mov, ogg, mp3, m4a or wav)." };
  }

  if (file.size === 0) {
    return { ok: false, error: "The uploaded recording is empty." };
  }

  if (file.size > MAX_DEFENSE_UPLOAD_BYTES) {
    return { ok: false, error: "The defense recording must be under 50MB." };
  }

  return { ok: true, mimeType, extension: DEFENSE_EXTENSIONS[mimeType] ?? "bin" };
}

/* -------------------------------------------------------------------------- */
/* Prompt derivation                                                          */
/* -------------------------------------------------------------------------- */

export type DefensePromptKind =
  | "LARGEST_DIFF"
  | "COMMIT_MESSAGE"
  | "LATE_CHANGE"
  | "PACE"
  | "ORIGIN";

export interface DefensePrompt {
  kind: DefensePromptKind;
  question: string;
  /** The commit the question is anchored to, so the answer can be checked against it. */
  commitSha: string;
  committedAt: string;
}

export interface DefensePromptSet {
  generatedAt: string;
  commitCount: number;
  firstCommitAt: string | null;
  lastCommitAt: string | null;
  prompts: DefensePrompt[];
}

interface CommitRow {
  sha: string;
  message: string | null;
  author: string | null;
  committedAt: Date;
  rawPayload: Prisma.JsonValue | null;
}

function asRecord(value: Prisma.JsonValue | null | undefined): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

/** `stats` is only present on commits the sync enriched via the single-commit endpoint. */
function readChangedLines(row: CommitRow): number | null {
  const stats = asRecord(asRecord(row.rawPayload)?.stats as Prisma.JsonValue | undefined);
  if (!stats) return null;
  const total = stats.total;
  if (typeof total === "number" && Number.isFinite(total)) return total;
  const additions = typeof stats.additions === "number" ? stats.additions : 0;
  const deletions = typeof stats.deletions === "number" ? stats.deletions : 0;
  const sum = additions + deletions;
  return sum > 0 ? sum : null;
}

function readFilenames(row: CommitRow): string[] {
  const files = asRecord(row.rawPayload)?.files;
  if (!Array.isArray(files)) return [];
  return files
    .map((f) => asRecord(f as Prisma.JsonValue)?.filename)
    .filter((name): name is string => typeof name === "string" && name.length > 0);
}

function shortSha(sha: string): string {
  return sha.slice(0, 7);
}

/** First line only - a commit body would make the question unreadable when quoted back. */
function subjectLine(message: string | null): string {
  if (!message) return "";
  return message.split("\n")[0].trim();
}

function isMergeCommit(row: CommitRow): boolean {
  return subjectLine(row.message).toLowerCase().startsWith("merge ");
}

function formatHours(ms: number): string {
  const hours = ms / 3_600_000;
  if (hours < 1) return `${Math.max(1, Math.round(ms / 60_000))} minutes`;
  return `${hours.toFixed(1)} hours`;
}

/**
 * Builds the question set from the entrant's actual history.
 *
 * Every branch here anchors to a specific commit, and every generated question
 * quotes something only that commit contains: its sha, its subject line, its
 * diff size, a file it touched, or the gap around it. Nothing is drawn from a
 * static pool. Deterministic given the same rows, so re-running before a
 * recording exists produces the same set rather than a fresh interrogation.
 */
export function buildDefensePrompts(rows: CommitRow[]): DefensePrompt[] {
  if (rows.length === 0) return [];

  const chronological = [...rows].sort((a, b) => a.committedAt.getTime() - b.committedAt.getTime());
  const prompts: DefensePrompt[] = [];
  const usedKinds = new Set<DefensePromptKind>();
  const usedShas = new Set<string>();

  const push = (prompt: DefensePrompt) => {
    if (usedKinds.has(prompt.kind)) return;
    usedKinds.add(prompt.kind);
    usedShas.add(prompt.commitSha);
    prompts.push(prompt);
  };

  // 1. The biggest single change. Prefer a real diff size; fall back to the
  //    number of files touched when the commit was never enriched.
  const sized = chronological
    .map((row) => ({ row, lines: readChangedLines(row), files: readFilenames(row).length }))
    .filter((c) => (c.lines ?? 0) > 0 || c.files > 0);

  if (sized.length > 0) {
    const largest = sized.reduce((best, current) => {
      const bestScore = best.lines ?? best.files;
      const currentScore = current.lines ?? current.files;
      return currentScore > bestScore ? current : best;
    });
    const scale = largest.lines
      ? `${largest.lines} lines across ${largest.files || "several"} file(s)`
      : `${largest.files} file(s)`;
    push({
      kind: "LARGEST_DIFF",
      question: `Commit ${shortSha(largest.row.sha)}${
        subjectLine(largest.row.message) ? ` ("${subjectLine(largest.row.message)}")` : ""
      } is your largest change: ${scale}. Walk through what that commit does, why it had to be that big, and what you would have had to change if it had gone wrong.`,
      commitSha: largest.row.sha,
      committedAt: largest.row.committedAt.toISOString(),
    });
  }

  // 2. A specific commit message, quoted back. The most descriptive one is the
  //    one the entrant is most likely to have written about a real decision.
  const described = chronological
    .filter((row) => !isMergeCommit(row) && subjectLine(row.message).length >= 15)
    .sort((a, b) => subjectLine(b.message).length - subjectLine(a.message).length);

  if (described.length > 0) {
    // Prefer a commit no other prompt already anchors to, so the set probes
    // several different moments rather than circling one commit.
    const target = described.find((row) => !usedShas.has(row.sha)) ?? described[0];
    push({
      kind: "COMMIT_MESSAGE",
      question: `In commit ${shortSha(target.sha)} you wrote "${subjectLine(
        target.message
      )}". What was actually wrong before that commit, and what alternative approach did you consider and reject?`,
      commitSha: target.sha,
      committedAt: target.committedAt.toISOString(),
    });
  }

  // 3. Something touched late. Last-minute changes are where understanding
  //    shows: you only fix what you can locate.
  const last = chronological[chronological.length - 1];
  const lateFiles = readFilenames(last);
  push({
    kind: "LATE_CHANGE",
    question: lateFiles.length
      ? `Your final commit ${shortSha(last.sha)} was still changing ${lateFiles
          .slice(0, 3)
          .join(", ")}. What was wrong with that code, how did you find it, and what did you have to leave unfixed?`
      : `Your final commit ${shortSha(last.sha)}${
          subjectLine(last.message) ? ` ("${subjectLine(last.message)}")` : ""
        } was the last thing you changed. What made it the last thing, and what was next on your list?`,
    commitSha: last.sha,
    committedAt: last.committedAt.toISOString(),
  });

  // 4. The shape of the work over time.
  if (chronological.length > 1) {
    let gapIndex = 1;
    let gapMs = 0;
    for (let i = 1; i < chronological.length; i += 1) {
      const delta =
        chronological[i].committedAt.getTime() - chronological[i - 1].committedAt.getTime();
      if (delta > gapMs) {
        gapMs = delta;
        gapIndex = i;
      }
    }

    const spanMs = last.committedAt.getTime() - chronological[0].committedAt.getTime();
    if (gapMs >= 3_600_000) {
      push({
        kind: "PACE",
        question: `There is a ${formatHours(gapMs)} gap between ${shortSha(
          chronological[gapIndex - 1].sha
        )} and ${shortSha(
          chronological[gapIndex].sha
        )}. What were you working through in that time, and what did you change your mind about before committing again?`,
        commitSha: chronological[gapIndex].sha,
        committedAt: chronological[gapIndex].committedAt.toISOString(),
      });
    } else {
      push({
        kind: "PACE",
        question: `All ${chronological.length} of your commits landed within ${formatHours(
          spanMs
        )}. Describe the order you actually built this in and what you had working before you committed the first time.`,
        commitSha: chronological[0].sha,
        committedAt: chronological[0].committedAt.toISOString(),
      });
    }
  }

  // 5. Where it started - the decisions taken before there was any code to react to.
  const first = chronological[0];
  push({
    kind: "ORIGIN",
    question: `Your first commit ${shortSha(first.sha)}${
      subjectLine(first.message) ? ` ("${subjectLine(first.message)}")` : ""
    } is where this started. What did you set up before writing any feature code, and what did you deliberately leave out?`,
    commitSha: first.sha,
    committedAt: first.committedAt.toISOString(),
  });

  return prompts;
}

/* -------------------------------------------------------------------------- */
/* Orchestration                                                              */
/* -------------------------------------------------------------------------- */

export type DefenseFailure =
  | "NO_SUBMISSION"
  | "FORBIDDEN"
  | "WRONG_PHASE"
  | "NO_COMMITS"
  | "INVALID_FILE";

export interface DefenseFailureResult {
  ok: false;
  reason: DefenseFailure;
  status: number;
  error: string;
}

export interface DefenseState {
  ok: true;
  submissionId: string;
  role: "OWNER" | "JUDGE";
  prompts: DefensePromptSet | null;
  defenseVideoUrl: string | null;
  defenseRecordedAt: Date | null;
}

function failure(reason: DefenseFailure, status: number, error: string): DefenseFailureResult {
  return { ok: false, reason, status, error };
}

async function resolveOwnedSubmission(arenaId: string, userId: string) {
  const resolved = await findSubmissionForActor({ arenaId, userId, allow: ["OWNER"] });
  if (!resolved.ok) {
    return failure(
      resolved.status === 404 ? "NO_SUBMISSION" : "FORBIDDEN",
      resolved.status,
      resolved.error
    );
  }
  return resolved;
}

/**
 * The defense can only be recorded once the implementation phase is over.
 * Otherwise the question set - which names the exact commits a judge will care
 * about - becomes a work aid telling the entrant which parts of their own
 * repository to go and understand before the deadline.
 */
function requireJudgingPhase(
  arena: Parameters<typeof deriveArenaStatus>[0],
  now: Date
): DefenseFailureResult | null {
  const status = deriveArenaStatus(arena, now);
  if (status !== "UNDER_JUDGING") {
    return failure(
      "WRONG_PHASE",
      400,
      `The oral defense opens once the implementation phase closes and stays open until results are published (current: ${status}).`
    );
  }
  return null;
}

export interface GeneratePromptsResult {
  ok: true;
  submissionId: string;
  prompts: DefensePromptSet;
  alreadyGenerated: boolean;
}

/**
 * Generates - and snapshots - the entrant's question set.
 *
 * Persisting at generation time is the point: the proof packet has to be able
 * to show what was actually asked. Regenerating later would produce a
 * different set (more commits, different largest diff) and leave a recording
 * answering questions nobody can reproduce.
 */
export async function generateDefensePrompts(params: {
  arenaId: string;
  userId: string;
  now?: Date;
}): Promise<GeneratePromptsResult | DefenseFailureResult> {
  const now = params.now ?? new Date();
  const resolved = await resolveOwnedSubmission(params.arenaId, params.userId);
  if ("reason" in resolved) return resolved;

  const phaseError = requireJudgingPhase(resolved.submission.arena, now);
  if (phaseError) return phaseError;

  const existing = resolved.submission.defensePrompts;
  if (existing) {
    return {
      ok: true,
      submissionId: resolved.submission.id,
      prompts: existing as unknown as DefensePromptSet,
      alreadyGenerated: true,
    };
  }

  const commits = await prisma.submissionCommit.findMany({
    where: { submissionId: resolved.submission.id },
    select: { sha: true, message: true, author: true, committedAt: true, rawPayload: true },
    orderBy: { committedAt: "asc" },
  });

  if (commits.length === 0) {
    return failure(
      "NO_COMMITS",
      409,
      "No commit history has been synced for this submission yet. Sync it from POST /api/arena/{id}/commits first - the defense questions are generated from your actual commits."
    );
  }

  const promptSet: DefensePromptSet = {
    generatedAt: now.toISOString(),
    commitCount: commits.length,
    firstCommitAt: commits[0].committedAt.toISOString(),
    lastCommitAt: commits[commits.length - 1].committedAt.toISOString(),
    prompts: buildDefensePrompts(commits),
  };

  await prisma.arenaSubmission.update({
    where: { id: resolved.submission.id },
    data: { defensePrompts: promptSet as unknown as Prisma.InputJsonValue },
  });

  return { ok: true, submissionId: resolved.submission.id, prompts: promptSet, alreadyGenerated: false };
}

export interface RecordDefenseResult {
  ok: true;
  submissionId: string;
  defenseVideoUrl: string;
  defenseRecordedAt: Date;
  prompts: DefensePromptSet;
  replaced: boolean;
}

/**
 * Stores the recording against the submission.
 *
 * One recording per submission, and re-recording replaces it. That is
 * deliberate, not a gap: a rehearsed retake is still the entrant explaining
 * their own code, and the failure mode this guards against is someone who
 * cannot explain it at all. Forcing a single unrepeatable take would punish
 * nerves and bad microphones, not fabrication. The storage path is derived
 * from the submission id so the replacement overwrites in place rather than
 * accumulating orphaned objects.
 */
export async function recordDefense(params: {
  arenaId: string;
  userId: string;
  file: File;
  now?: Date;
}): Promise<RecordDefenseResult | DefenseFailureResult> {
  const now = params.now ?? new Date();
  const resolved = await resolveOwnedSubmission(params.arenaId, params.userId);
  if ("reason" in resolved) return resolved;

  const phaseError = requireJudgingPhase(resolved.submission.arena, now);
  if (phaseError) return phaseError;

  const validation = validateDefenseUpload(params.file);
  if (!validation.ok) return failure("INVALID_FILE", 400, validation.error);

  // A recording with no snapshotted question set is unreviewable, so generation
  // is guaranteed here rather than left to the client having called it first.
  const generated = await generateDefensePrompts({
    arenaId: params.arenaId,
    userId: params.userId,
    now,
  });
  if ("reason" in generated) return generated;

  const { publicUrl } = await uploadImageToStorage({
    file: params.file,
    path: `arenas/defense/${resolved.submission.id}.${validation.extension}`,
    contentType: validation.mimeType,
  });

  // The path is stable across retakes, so the CDN would otherwise keep serving
  // the previous recording. The version marker is what makes a replacement
  // actually visible.
  const versionedUrl = `${publicUrl}?v=${now.getTime()}`;

  const updated = await prisma.arenaSubmission.update({
    where: { id: resolved.submission.id },
    data: { defenseVideoUrl: versionedUrl, defenseRecordedAt: now },
    select: { id: true, defenseVideoUrl: true, defenseRecordedAt: true },
  });

  return {
    ok: true,
    submissionId: updated.id,
    defenseVideoUrl: updated.defenseVideoUrl as string,
    defenseRecordedAt: updated.defenseRecordedAt as Date,
    prompts: generated.prompts,
    replaced: Boolean(resolved.submission.defenseRecordedAt),
  };
}

/**
 * Read-only view of the defense. Visible to the entrant and to a judge holding
 * an assignment for this submission - the judge needs both the recording and
 * the exact questions it answers.
 */
export async function getDefenseState(params: {
  arenaId: string;
  userId: string;
  submissionId?: string | null;
}): Promise<DefenseState | DefenseFailureResult> {
  const resolved = await findSubmissionForActor({
    arenaId: params.arenaId,
    userId: params.userId,
    submissionId: params.submissionId,
    allow: ["OWNER", "JUDGE"],
  });

  if (!resolved.ok) {
    return failure(
      resolved.status === 404 ? "NO_SUBMISSION" : "FORBIDDEN",
      resolved.status,
      resolved.error
    );
  }

  return {
    ok: true,
    submissionId: resolved.submission.id,
    role: resolved.role as "OWNER" | "JUDGE",
    prompts: (resolved.submission.defensePrompts as unknown as DefensePromptSet) ?? null,
    defenseVideoUrl: resolved.submission.defenseVideoUrl,
    defenseRecordedAt: resolved.submission.defenseRecordedAt,
  };
}
