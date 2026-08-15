/**
 * The code-execution port.
 *
 * REP is auto-judged, which means running source code somebody else wrote
 * against test cases we wrote. That is untrusted execution, and it does not
 * belong in this process — it belongs behind a sandbox (Judge0, Piston, a
 * container-per-run service). This module defines the seam so everything above
 * it can be written, typechecked and tested now, against whichever sandbox we
 * end up paying for.
 *
 * Nothing here imports Prisma, Supabase, or a logger implementation. Adapters
 * receive a `RunnerLogger` rather than importing `lib/server/logger.ts`,
 * because that module is marked `server-only` and throws on import outside a
 * React Server Component — including under `node --test`. Injecting it keeps
 * the port testable and lets tests assert what was logged.
 */

export interface RunRequest {
  /** Language key, e.g. "python", "javascript". Adapters map it to their own ids. */
  language: string;
  source: string;
  stdin?: string;
  /** When present, the adapter compares the program's stdout against it. */
  expectedStdout?: string;
  timeLimitSec?: number;
  memoryLimitKb?: number;
}

export type RunVerdict =
  | "ACCEPTED"
  | "WRONG_ANSWER"
  | "TIME_LIMIT_EXCEEDED"
  | "MEMORY_LIMIT_EXCEEDED"
  | "RUNTIME_ERROR"
  | "COMPILE_ERROR"
  | "INTERNAL_ERROR";

export interface RunResult {
  verdict: RunVerdict;
  stdout?: string;
  stderr?: string;
  timeMs?: number;
  memoryKb?: number;
}

export interface CodeRunner {
  run(req: RunRequest): Promise<RunResult>;
  /**
   * Identifies the adapter that produced a verdict. Persist this alongside any
   * stored verdict: a result is only as trustworthy as the thing that produced
   * it, and `STUB_RUNNER_NAME` results are worth nothing.
   */
  readonly name: string;
}

/**
 * Structurally identical to the `Logger` interface in both `lib/server/logger.ts`
 * and `lib/client/logger.ts`, so either satisfies it without an adapter. Same
 * policy applies: `error` for something that broke, `warn` for something
 * security- or reliability-relevant, nothing on the success path.
 */
export interface RunnerLogger {
  error(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
}

/** The slice of the environment the runner reads. Injected so it can be faked. */
export type RunnerEnv = Record<string, string | undefined>;
