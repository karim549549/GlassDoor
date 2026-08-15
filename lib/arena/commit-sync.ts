/**
 * PROCESS signal: the entrant's commit history, pulled from GitHub's public API
 * and persisted as `SubmissionCommit` rows.
 *
 * A pasted blob of generated code and a repository built over three days are
 * indistinguishable once they are both a `githubUrl` in a form field. The
 * commit graph is the difference, and it is the one artefact the entrant
 * cannot retroactively author without leaving traces (forced timestamps,
 * single-author bursts, zero-gap history).
 *
 * NOTE: this module deliberately has no `import "server-only"` and no
 * top-level `@/lib/server/prisma` import, for the same reason
 * `lib/server/prisma.ts` documents: `server-only` throws unconditionally
 * outside Next's bundler, and `lib/server/prisma.ts` constructs a PrismaClient
 * (and throws on a missing DATABASE_URL) at module load. `commit-sync.test.ts`
 * runs under plain `tsx --test`, so either one would make the pure URL parser
 * untestable. The database and the server-only auth resolver are pulled in via
 * dynamic import inside the functions that actually need them.
 */
import type { Prisma } from "@prisma/client";
import { deriveArenaStatus, type ArenaStatus } from "./status";

/* -------------------------------------------------------------------------- */
/* Pure: repository URL parsing                                               */
/* -------------------------------------------------------------------------- */

export interface GithubRepoRef {
  owner: string;
  repo: string;
}

const GITHUB_HOSTNAMES = new Set(["github.com", "www.github.com"]);

/** GitHub logins: alphanumeric or hyphen, cannot start with a hyphen, max 39. */
const OWNER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9-]{0,38}$/;
/** Repository names: alphanumeric, hyphen, underscore, dot. */
const REPO_PATTERN = /^[A-Za-z0-9._-]{1,100}$/;

/**
 * First path segments that are GitHub product routes rather than user logins.
 * Without this, `https://github.com/orgs/acme` parses as owner "orgs" and
 * repo "acme" and burns an outbound request on a guaranteed 404.
 */
const RESERVED_OWNERS = new Set([
  "about", "apps", "collections", "contact", "customer-stories", "enterprise",
  "explore", "features", "issues", "join", "login", "logout", "marketplace",
  "new", "notifications", "orgs", "pricing", "pulls", "search", "security",
  "settings", "sponsors", "topics", "trending",
]);

/**
 * Extracts `owner/repo` from the shapes a real entrant actually pastes.
 *
 * Returns null - never throws, never falls back to a "probably fine" guess -
 * for anything that is not a github.com repository URL. That null is a hard
 * SSRF boundary: the value reaching `fetch()` below is built from this
 * function's output and a hardcoded `api.github.com` origin, so a submission
 * pointing at `http://169.254.169.254/` or an internal host can never become
 * an outbound request.
 */
export function parseGithubRepoUrl(raw: string | null | undefined): GithubRepoRef | null {
  if (!raw || typeof raw !== "string") return null;

  let value = raw.trim();
  if (!value) return null;

  // `git@github.com:owner/repo.git` is not a URL; normalise it into one.
  const scpMatch = /^git@github\.com:(.+)$/i.exec(value);
  if (scpMatch) {
    value = `https://github.com/${scpMatch[1]}`;
  } else if (!/^[a-z][a-z0-9+.-]*:/i.test(value)) {
    // Scheme-less "github.com/owner/repo". Anchored so that
    // "evil.com/github.com/o/r" is not rewritten into a github.com URL.
    if (!/^(www\.)?github\.com\//i.test(value)) return null;
    value = `https://${value}`;
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  // `url.hostname` excludes any userinfo, so "https://github.com@evil.com/o/r"
  // correctly reports evil.com and is rejected.
  if (!GITHUB_HOSTNAMES.has(url.hostname.toLowerCase())) return null;

  const segments = url.pathname.split("/").filter(Boolean);
  if (segments.length < 2) return null;

  const owner = decodeURIComponent(segments[0]);
  let repo = decodeURIComponent(segments[1]);
  if (repo.toLowerCase().endsWith(".git")) repo = repo.slice(0, -4);

  if (RESERVED_OWNERS.has(owner.toLowerCase())) return null;
  if (!OWNER_PATTERN.test(owner)) return null;
  if (!REPO_PATTERN.test(repo)) return null;
  if (repo === "." || repo === "..") return null;

  return { owner, repo };
}

/* -------------------------------------------------------------------------- */
/* Pure: history summarisation                                                */
/* -------------------------------------------------------------------------- */

export interface CommitHistorySummary {
  commitCount: number;
  firstCommitAt: string | null;
  lastCommitAt: string | null;
  /** Wall-clock hours between the first and last commit. */
  spanHours: number | null;
  distinctAuthors: number;
  /** Largest quiet period between two consecutive commits, in hours. */
  largestGapHours: number | null;
}

/**
 * The shape a scoring pass reads. Kept pure and separate from the fetch so the
 * same numbers can be recomputed from stored rows without touching GitHub.
 */
export function summariseCommitHistory(
  rows: { committedAt: Date; author: string | null }[]
): CommitHistorySummary {
  if (rows.length === 0) {
    return {
      commitCount: 0,
      firstCommitAt: null,
      lastCommitAt: null,
      spanHours: null,
      distinctAuthors: 0,
      largestGapHours: null,
    };
  }

  const sorted = [...rows].sort((a, b) => a.committedAt.getTime() - b.committedAt.getTime());
  const first = sorted[0].committedAt;
  const last = sorted[sorted.length - 1].committedAt;

  let largestGapMs = 0;
  for (let i = 1; i < sorted.length; i += 1) {
    const gap = sorted[i].committedAt.getTime() - sorted[i - 1].committedAt.getTime();
    if (gap > largestGapMs) largestGapMs = gap;
  }

  const authors = new Set(sorted.map((r) => r.author).filter((a): a is string => Boolean(a)));

  return {
    commitCount: sorted.length,
    firstCommitAt: first.toISOString(),
    lastCommitAt: last.toISOString(),
    spanHours: Number(((last.getTime() - first.getTime()) / 3_600_000).toFixed(2)),
    distinctAuthors: authors.size,
    largestGapHours: sorted.length > 1 ? Number((largestGapMs / 3_600_000).toFixed(2)) : null,
  };
}

/* -------------------------------------------------------------------------- */
/* GitHub fetching                                                            */
/* -------------------------------------------------------------------------- */

const GITHUB_API_ORIGIN = "https://api.github.com";
const PER_PAGE = 100;
/** 5 pages x 100 = 500 commits. Beyond that a submission is not credibly reviewable anyway. */
const MAX_PAGES = 5;
const REQUEST_TIMEOUT_MS = 10_000;
/**
 * The list endpoint does NOT return `stats` or `files` - only the single-commit
 * endpoint does. Defense prompts need real diff sizes, so the N most recent
 * commits are enriched with a follow-up request each. Unauthenticated callers
 * get 60 requests/hour total, so this stays small and degrades silently.
 */
const ENRICH_LIMIT = 10;

export interface GithubCommitListItem {
  sha: string;
  commit?: {
    message?: string;
    author?: { name?: string; email?: string; date?: string } | null;
    committer?: { name?: string; email?: string; date?: string } | null;
  };
  author?: { login?: string } | null;
  stats?: { additions?: number; deletions?: number; total?: number };
  files?: { filename?: string; additions?: number; deletions?: number; status?: string }[];
}

export type CommitSyncFailure =
  | "NO_SUBMISSION"
  | "FORBIDDEN"
  | "WRONG_PHASE"
  | "INVALID_GITHUB_URL"
  | "REPO_NOT_FOUND"
  | "RATE_LIMITED"
  | "UPSTREAM_ERROR"
  | "NO_COMMITS";

export interface CommitSyncFailureResult {
  ok: false;
  reason: CommitSyncFailure;
  error: string;
  retryAfterSeconds?: number;
}

export interface CommitSyncSuccess {
  ok: true;
  submissionId: string;
  repo: string;
  /** Rows written or refreshed by this run. */
  commitsSynced: number;
  /** True when the repository has more history than MAX_PAGES could reach. */
  truncated: boolean;
  summary: CommitHistorySummary;
}

export type CommitSyncResult = CommitSyncSuccess | CommitSyncFailureResult;

function githubHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "devs-arena-commit-sync",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

/**
 * GitHub answers an exhausted quota with 403 (classic) or 429 (secondary
 * limit). Both are a "come back later", not a bug, so they surface as a typed
 * result the route turns into a 429 - never as a thrown exception that
 * `withApiErrorHandling` would log as a 500.
 */
function rateLimitedResult(response: Response): CommitSyncFailureResult {
  const resetHeader = response.headers.get("x-ratelimit-reset");
  const retryAfterHeader = response.headers.get("retry-after");

  let retryAfterSeconds = 60;
  if (retryAfterHeader && Number.isFinite(Number(retryAfterHeader))) {
    retryAfterSeconds = Number(retryAfterHeader);
  } else if (resetHeader && Number.isFinite(Number(resetHeader))) {
    // `x-ratelimit-reset` is an absolute unix epoch in seconds, not a duration.
    retryAfterSeconds = Number(resetHeader) - Date.now() / 1000;
  }

  return {
    ok: false,
    reason: "RATE_LIMITED",
    error: process.env.GITHUB_TOKEN
      ? "GitHub's API rate limit was reached. Try the sync again shortly."
      : "GitHub's unauthenticated API rate limit (60 requests/hour) was reached. Try again shortly.",
    retryAfterSeconds: Math.max(1, Math.ceil(retryAfterSeconds)),
  };
}

function isRateLimited(response: Response): boolean {
  if (response.status === 429) return true;
  return response.status === 403 && response.headers.get("x-ratelimit-remaining") === "0";
}

async function fetchCommitPage(
  owner: string,
  repo: string,
  page: number
): Promise<{ ok: true; items: GithubCommitListItem[] } | CommitSyncFailureResult> {
  const url = `${GITHUB_API_ORIGIN}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(
    repo
  )}/commits?per_page=${PER_PAGE}&page=${page}`;

  let response: Response;
  try {
    response = await fetch(url, {
      headers: githubHeaders(),
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    return {
      ok: false,
      reason: "UPSTREAM_ERROR",
      error: "Could not reach GitHub. Try the sync again in a moment.",
    };
  }

  if (isRateLimited(response)) return rateLimitedResult(response);

  if (response.status === 404) {
    return {
      ok: false,
      reason: "REPO_NOT_FOUND",
      error: `github.com/${owner}/${repo} is private or does not exist. Commit history can only be verified on a public repository.`,
    };
  }

  // 409 is GitHub's answer for a repository with no commits at all.
  if (response.status === 409) {
    return { ok: false, reason: "NO_COMMITS", error: "That repository has no commits." };
  }

  if (!response.ok) {
    return {
      ok: false,
      reason: "UPSTREAM_ERROR",
      error: `GitHub returned an unexpected response (${response.status}).`,
    };
  }

  const body: unknown = await response.json();
  if (!Array.isArray(body)) {
    return { ok: false, reason: "UPSTREAM_ERROR", error: "GitHub returned an unexpected payload." };
  }

  return { ok: true, items: body as GithubCommitListItem[] };
}

/**
 * Pulls `stats` and `files` for a single commit. Any failure here is swallowed:
 * enrichment makes the defense prompts sharper but its absence must never fail
 * a sync, because the commit timeline itself is the primary signal.
 */
async function fetchCommitDetail(
  owner: string,
  repo: string,
  sha: string
): Promise<GithubCommitListItem | null> {
  try {
    const response = await fetch(
      `${GITHUB_API_ORIGIN}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(
        repo
      )}/commits/${encodeURIComponent(sha)}`,
      {
        headers: githubHeaders(),
        cache: "no-store",
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      }
    );
    if (!response.ok) return null;
    const body: unknown = await response.json();
    if (!body || typeof body !== "object") return null;
    return body as GithubCommitListItem;
  } catch {
    return null;
  }
}

/** Keeps stored payloads bounded - a single commit can touch thousands of files. */
function trimFiles(item: GithubCommitListItem): GithubCommitListItem["files"] {
  if (!Array.isArray(item.files)) return undefined;
  return item.files.slice(0, 100).map((f) => ({
    filename: f.filename,
    additions: f.additions,
    deletions: f.deletions,
    status: f.status,
  }));
}

function commitTimestamp(item: GithubCommitListItem): Date | null {
  const raw = item.commit?.committer?.date ?? item.commit?.author?.date;
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

function commitAuthor(item: GithubCommitListItem): string | null {
  return item.author?.login ?? item.commit?.author?.name ?? null;
}

/* -------------------------------------------------------------------------- */
/* Orchestration                                                              */
/* -------------------------------------------------------------------------- */

/** Syncing is pointless before work exists and still useful while results are pending. */
const SYNCABLE_STATUSES: ArenaStatus[] = ["IMPLEMENTATION_PHASE", "UNDER_JUDGING", "COMPLETED"];

export interface SyncSubmissionCommitsParams {
  arenaId: string;
  /** Always the session user - never a client-supplied identifier. */
  userId: string;
  /** Required for a judge syncing someone else's entry; omitted resolves to the caller's own entry. */
  submissionId?: string | null;
}

/**
 * Fetches and persists a submission's commit history.
 *
 * Authorisation is resolved against the database from the session user: the
 * solo entrant, a member of the entry's team, or a judge holding a
 * `JudgeAssignment` for this exact submission. Everyone else gets FORBIDDEN.
 */
export async function syncSubmissionCommits(
  params: SyncSubmissionCommitsParams
): Promise<CommitSyncResult> {
  const [{ default: prisma }, { findSubmissionForActor }] = await Promise.all([
    import("@/lib/server/prisma"),
    import("./submission-service"),
  ]);

  const resolved = await findSubmissionForActor({
    arenaId: params.arenaId,
    userId: params.userId,
    submissionId: params.submissionId,
    allow: ["OWNER", "JUDGE"],
  });

  if (!resolved.ok) {
    return {
      ok: false,
      reason: resolved.status === 404 ? "NO_SUBMISSION" : "FORBIDDEN",
      error: resolved.error,
    };
  }

  const { submission } = resolved;
  const status = deriveArenaStatus(submission.arena, new Date());
  if (!SYNCABLE_STATUSES.includes(status)) {
    return {
      ok: false,
      reason: "WRONG_PHASE",
      error: `Commit history can only be synced from the implementation phase onwards (current: ${status}).`,
    };
  }

  const ref = parseGithubRepoUrl(submission.githubUrl);
  if (!ref) {
    return {
      ok: false,
      reason: "INVALID_GITHUB_URL",
      error: "The submission's repository URL is not a github.com repository, so its history cannot be verified.",
    };
  }

  const collected: GithubCommitListItem[] = [];
  let truncated = false;

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const result = await fetchCommitPage(ref.owner, ref.repo, page);
    if (!result.ok) {
      // A rate limit or outage partway through still leaves earlier pages
      // usable, but reporting a partial history as complete would understate
      // the entrant's work - so the whole run fails cleanly instead.
      return result;
    }
    collected.push(...result.items);
    if (result.items.length < PER_PAGE) break;
    if (page === MAX_PAGES) truncated = true;
  }

  if (collected.length === 0) {
    return { ok: false, reason: "NO_COMMITS", error: "That repository has no commits." };
  }

  // Enrich the most recent commits with real diff sizes and file lists. These
  // are what the defense prompts quote back at the entrant.
  const toEnrich = collected.slice(0, ENRICH_LIMIT);
  const details = await Promise.all(
    toEnrich.map((item) => fetchCommitDetail(ref.owner, ref.repo, item.sha))
  );
  details.forEach((detail, index) => {
    if (!detail) return;
    toEnrich[index].stats = detail.stats;
    toEnrich[index].files = detail.files;
  });

  const rows = collected
    .map((item) => {
      const committedAt = commitTimestamp(item);
      if (!committedAt) return null;
      return {
        sha: item.sha,
        message: item.commit?.message?.slice(0, 2000) ?? null,
        author: commitAuthor(item),
        committedAt,
        payload: { ...item, files: trimFiles(item) } as unknown as Prisma.InputJsonValue,
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  if (rows.length === 0) {
    return { ok: false, reason: "NO_COMMITS", error: "GitHub returned no dateable commits for that repository." };
  }

  // Upsert on @@unique([submissionId, sha]) so a re-sync is idempotent and a
  // later enrichment pass can refresh `rawPayload` in place. Chunked rather
  // than one transaction: 500 upserts in a single transaction holds a
  // connection far longer than a request should.
  const CHUNK_SIZE = 20;
  for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
    const chunk = rows.slice(i, i + CHUNK_SIZE);
    await Promise.all(
      chunk.map((row) =>
        prisma.submissionCommit.upsert({
          where: { submissionId_sha: { submissionId: submission.id, sha: row.sha } },
          create: {
            submissionId: submission.id,
            sha: row.sha,
            message: row.message,
            author: row.author,
            committedAt: row.committedAt,
            rawPayload: row.payload,
          },
          update: {
            message: row.message,
            author: row.author,
            committedAt: row.committedAt,
            rawPayload: row.payload,
          },
        })
      )
    );
  }

  const persisted = await prisma.submissionCommit.findMany({
    where: { submissionId: submission.id },
    select: { committedAt: true, author: true },
  });

  return {
    ok: true,
    submissionId: submission.id,
    repo: `${ref.owner}/${ref.repo}`,
    commitsSynced: rows.length,
    truncated,
    summary: summariseCommitHistory(persisted),
  };
}

export interface SubmissionCommitsView {
  ok: true;
  submissionId: string;
  role: "OWNER" | "JUDGE" | "HOST";
  summary: CommitHistorySummary;
  commits: {
    sha: string;
    message: string | null;
    author: string | null;
    committedAt: Date;
  }[];
}

/**
 * Reads the persisted history. Never touches GitHub, so it carries no rate
 * limit of its own beyond the route's.
 */
export async function getSubmissionCommits(params: {
  arenaId: string;
  userId: string;
  submissionId?: string | null;
}): Promise<SubmissionCommitsView | CommitSyncFailureResult> {
  const [{ default: prisma }, { findSubmissionForActor }] = await Promise.all([
    import("@/lib/server/prisma"),
    import("./submission-service"),
  ]);

  const resolved = await findSubmissionForActor({
    arenaId: params.arenaId,
    userId: params.userId,
    submissionId: params.submissionId,
    allow: ["OWNER", "JUDGE", "HOST"],
  });

  if (!resolved.ok) {
    return {
      ok: false,
      reason: resolved.status === 404 ? "NO_SUBMISSION" : "FORBIDDEN",
      error: resolved.error,
    };
  }

  const commits = await prisma.submissionCommit.findMany({
    where: { submissionId: resolved.submission.id },
    select: { sha: true, message: true, author: true, committedAt: true },
    orderBy: { committedAt: "desc" },
  });

  return {
    ok: true,
    submissionId: resolved.submission.id,
    role: resolved.role,
    summary: summariseCommitHistory(commits),
    commits,
  };
}
