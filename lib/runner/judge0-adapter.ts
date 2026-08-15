import type {
  CodeRunner,
  RunRequest,
  RunResult,
  RunVerdict,
  RunnerEnv,
  RunnerLogger,
} from "./types";

/**
 * Judge0 adapter — a client for Judge0's documented HTTP API
 * (https://ce.judge0.com/), which is the sandbox REP's auto-judging is
 * expected to run on.
 *
 * UNVERIFIED. There is no Judge0 deployment attached to this project, so no
 * request in this file has ever been sent. It is written against the published
 * API shape and is typechecked and unit-tested only where it can be: the
 * status-id mapping and the language table. Treat the request/response wiring
 * as a first draft until it has talked to a real instance.
 */

export const JUDGE0_RUNNER_NAME = "judge0";

/** Thrown at construction when the adapter is selected but not configured. */
export class Judge0ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "Judge0ConfigError";
  }
}

/**
 * Judge0 `status.id` -> our verdict.
 *
 *   1  In Queue                  -> null (not finished; keep polling)
 *   2  Processing                -> null (not finished; keep polling)
 *   3  Accepted                  -> ACCEPTED
 *   4  Wrong Answer              -> WRONG_ANSWER
 *   5  Time Limit Exceeded       -> TIME_LIMIT_EXCEEDED
 *   6  Compilation Error         -> COMPILE_ERROR
 *   7  Runtime Error (SIGSEGV)   -> RUNTIME_ERROR
 *   8  Runtime Error (SIGXFSZ)   -> RUNTIME_ERROR
 *   9  Runtime Error (SIGFPE)    -> RUNTIME_ERROR
 *   10 Runtime Error (SIGABRT)   -> RUNTIME_ERROR
 *   11 Runtime Error (NZEC)      -> RUNTIME_ERROR
 *   12 Runtime Error (Other)     -> RUNTIME_ERROR
 *   13 Internal Error            -> INTERNAL_ERROR
 *   14 Exec Format Error         -> INTERNAL_ERROR
 *
 * NOTE — MEMORY_LIMIT_EXCEEDED is unreachable through this adapter. Judge0 has
 * no status id for it: a run that exceeds `memory_limit` is killed and surfaces
 * as SIGSEGV (7), SIGABRT (10) or NZEC (11), indistinguishable from an ordinary
 * crash. The verdict stays in `RunVerdict` because other sandboxes do report it
 * and the stub adapter can produce it, but anything that special-cases it must
 * not assume Judge0 will ever return it.
 */
export function mapJudge0StatusId(statusId: number): RunVerdict | null {
  switch (statusId) {
    case 1:
    case 2:
      return null;
    case 3:
      return "ACCEPTED";
    case 4:
      return "WRONG_ANSWER";
    case 5:
      return "TIME_LIMIT_EXCEEDED";
    case 6:
      return "COMPILE_ERROR";
    case 7:
    case 8:
    case 9:
    case 10:
    case 11:
    case 12:
      return "RUNTIME_ERROR";
    case 13:
    case 14:
      return "INTERNAL_ERROR";
    default:
      // An id Judge0 added after this was written. Refusing to guess is the
      // point: an unknown state must never be rounded down to ACCEPTED.
      return "INTERNAL_ERROR";
  }
}

/**
 * Judge0 CE language ids as published for the hosted CE instance. These are
 * per-deployment — a self-hosted or updated instance can renumber them, and
 * `GET /languages` is the authority. Exported so callers can validate a
 * submission's language before spending a network round trip on it.
 */
export const JUDGE0_LANGUAGE_IDS: Readonly<Record<string, number>> = {
  c: 50,
  cpp: 54,
  csharp: 51,
  go: 60,
  java: 62,
  javascript: 63,
  kotlin: 78,
  php: 68,
  python: 71,
  ruby: 72,
  rust: 73,
  swift: 83,
  typescript: 74,
};

export interface Judge0Options {
  /** Delay between polls, in ms. */
  pollIntervalMs: number;
  /** Hard cap on poll requests, independent of the clock. */
  maxPollAttempts: number;
  /** Hard cap on total wall-clock time spent waiting for a verdict, in ms. */
  totalTimeoutMs: number;
  /** Per-HTTP-request timeout, in ms. */
  requestTimeoutMs: number;
}

export const JUDGE0_DEFAULTS: Judge0Options = {
  pollIntervalMs: 400,
  maxPollAttempts: 50,
  totalTimeoutMs: 30_000,
  requestTimeoutMs: 10_000,
};

interface Judge0Submission {
  status?: { id?: number; description?: string };
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
  message?: string | null;
  /** Seconds, serialised as a string by Judge0. */
  time?: string | null;
  /** Kilobytes. */
  memory?: number | null;
  token?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asSubmission(value: unknown): Judge0Submission | null {
  return isRecord(value) ? (value as Judge0Submission) : null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** Judge0 splits failure text across three fields; none is reliably populated. */
function collectStderr(submission: Judge0Submission): string | undefined {
  const parts = [submission.compile_output, submission.stderr, submission.message]
    .filter((part): part is string => typeof part === "string" && part.length > 0);
  return parts.length > 0 ? parts.join("\n") : undefined;
}

function internalError(stderr: string): RunResult {
  return { verdict: "INTERNAL_ERROR", stderr };
}

/**
 * Builds a Judge0-backed runner.
 *
 * Throws `Judge0ConfigError` from *this function*, not from the first `run()`.
 * A misconfigured judge that only reveals itself once a contest is live and a
 * submission is being scored is far worse than one that refuses to boot: the
 * first failure mode loses a participant's entry, the second fails the deploy.
 */
export function createJudge0Runner(
  logger: RunnerLogger,
  env: RunnerEnv = process.env,
  options: Partial<Judge0Options> = {}
): CodeRunner {
  const url = env.JUDGE0_URL?.trim();
  const key = env.JUDGE0_KEY?.trim();

  if (!url) {
    throw new Judge0ConfigError(
      "JUDGE0_URL is not set. The Judge0 runner cannot be constructed without it."
    );
  }
  if (!key) {
    throw new Judge0ConfigError(
      "JUDGE0_KEY is not set. Refusing to construct an unauthenticated Judge0 runner."
    );
  }

  const baseUrl = url.replace(/\/+$/, "");
  const config: Judge0Options = { ...JUDGE0_DEFAULTS, ...options };

  // Judge0's own documented auth header. A RapidAPI-hosted instance expects
  // `X-RapidAPI-Key` plus `X-RapidAPI-Host` instead — if we end up on RapidAPI
  // this is the line that changes.
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Auth-Token": key,
  };

  async function createSubmission(req: RunRequest, languageId: number): Promise<string> {
    const response = await fetch(
      `${baseUrl}/submissions?base64_encoded=false&wait=false`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          language_id: languageId,
          source_code: req.source,
          stdin: req.stdin ?? "",
          expected_output: req.expectedStdout,
          cpu_time_limit: req.timeLimitSec,
          memory_limit: req.memoryLimitKb,
        }),
        signal: AbortSignal.timeout(config.requestTimeoutMs),
      }
    );

    if (!response.ok) {
      throw new Error(`Judge0 rejected the submission: ${response.status} ${response.statusText}`);
    }

    const token = asSubmission(await response.json())?.token;
    if (!token) throw new Error("Judge0 accepted the submission but returned no token.");
    return token;
  }

  async function fetchSubmission(token: string): Promise<Judge0Submission> {
    const response = await fetch(
      `${baseUrl}/submissions/${encodeURIComponent(token)}?base64_encoded=false&fields=*`,
      { headers, signal: AbortSignal.timeout(config.requestTimeoutMs) }
    );

    if (!response.ok) {
      throw new Error(`Judge0 poll failed: ${response.status} ${response.statusText}`);
    }

    const submission = asSubmission(await response.json());
    if (!submission) throw new Error("Judge0 returned a non-object submission body.");
    return submission;
  }

  function toResult(submission: Judge0Submission, verdict: RunVerdict): RunResult {
    // Judge0 serialises `time` as seconds in a string ("0.002"), and omits it
    // entirely for submissions that never ran.
    const seconds = Number(submission.time ?? Number.NaN);
    return {
      verdict,
      stdout: submission.stdout ?? undefined,
      stderr: collectStderr(submission),
      timeMs: Number.isFinite(seconds) ? Math.round(seconds * 1000) : undefined,
      memoryKb: submission.memory ?? undefined,
    };
  }

  return {
    name: JUDGE0_RUNNER_NAME,

    async run(req: RunRequest): Promise<RunResult> {
      const languageId = JUDGE0_LANGUAGE_IDS[req.language.toLowerCase()];
      if (languageId === undefined) {
        // Returned rather than thrown: one submission in an unsupported
        // language must not take down a batch of auto-judging.
        logger.error("Judge0 runner received an unsupported language", {
          language: req.language,
        });
        return internalError(`Unsupported language for Judge0: "${req.language}".`);
      }

      let token: string;
      try {
        token = await createSubmission(req, languageId);
      } catch (error) {
        logger.error("Judge0 submission creation failed", {
          language: req.language,
          error: errorMessage(error),
        });
        return internalError(`Could not submit to Judge0: ${errorMessage(error)}`);
      }

      // Bounded on both axes deliberately. An attempt cap alone still hangs if
      // each request sits near its own timeout; a deadline alone still spins if
      // the instance answers instantly and never finishes the job.
      const deadline = Date.now() + config.totalTimeoutMs;

      for (let attempt = 0; attempt < config.maxPollAttempts; attempt += 1) {
        if (Date.now() >= deadline) break;
        await sleep(config.pollIntervalMs);

        let submission: Judge0Submission;
        try {
          submission = await fetchSubmission(token);
        } catch (error) {
          logger.error("Judge0 poll failed", { token, error: errorMessage(error) });
          return internalError(`Could not read the Judge0 verdict: ${errorMessage(error)}`);
        }

        const statusId = submission.status?.id;
        if (typeof statusId !== "number") {
          logger.error("Judge0 returned a submission with no status id", { token });
          return internalError("Judge0 returned a submission with no status id.");
        }

        const verdict = mapJudge0StatusId(statusId);
        if (verdict !== null) return toResult(submission, verdict);
      }

      logger.error("Judge0 verdict did not arrive before the deadline", {
        token,
        maxPollAttempts: config.maxPollAttempts,
        totalTimeoutMs: config.totalTimeoutMs,
      });
      return internalError(
        `Judge0 did not return a verdict within ${config.totalTimeoutMs}ms (token ${token}).`
      );
    },
  };
}
