import type { CodeRunner, RunRequest, RunResult, RunnerLogger } from "./types";

/**
 * Development/test stub. IT DOES NOT EXECUTE ANYTHING.
 *
 * `req.source` is never parsed, compiled, interpreted or looked at. The stub
 * exists so the auto-judging pipeline above the port can be built and tested
 * without a sandbox account, and its single most important property is that a
 * verdict it produced can never be mistaken for a real one:
 *
 *   1. `name` is `STUB_RUNNER_NAME`. Persist it with the verdict and any stored
 *      result carries its own provenance.
 *   2. Every result's `stderr` opens with `STUB_BANNER`.
 *   3. Every call emits `logger.warn`. Not `error` — running the stub in dev is
 *      correct and expected — but loud enough that seeing it in production logs
 *      is unmistakable.
 *
 * SEMANTICS IT PRETENDS TO HAVE
 *
 * The stub behaves as if every submission were `cat`: it echoes `stdin` to
 * `stdout`, unchanged. That choice is arbitrary but it is *documented and
 * deterministic*, which is what a test double needs to be. So:
 *
 *   - no `expectedStdout`   -> ACCEPTED (nothing was asserted)
 *   - `expectedStdout` equals the echoed stdin, after normalisation -> ACCEPTED
 *   - otherwise             -> WRONG_ANSWER
 *
 * Normalisation before comparison: trailing whitespace stripped from each line,
 * CRLF folded to LF, trailing blank lines dropped. This mirrors how real judges
 * compare output and stops a stray newline reading as a wrong answer.
 *
 * There is no timing or randomness anywhere: `timeMs` and `memoryKb` are fixed
 * zeroes, so the same request always yields a deeply-equal result.
 */

export const STUB_RUNNER_NAME = "stub";

export const STUB_BANNER =
  "[STUB RUNNER] NO CODE WAS EXECUTED. This verdict was produced by " +
  "lib/runner/stub-adapter.ts, which echoes stdin and never runs the submission. " +
  "It is not evidence of anything.";

function normalizeOutput(value: string): string {
  return value
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.replace(/\s+$/, ""))
    .join("\n")
    .replace(/\n+$/, "");
}

export interface StubRunnerOptions {
  /**
   * Required. The stub must always have somewhere to announce itself — an
   * optional logger would eventually be constructed without one, and a silent
   * stub is the exact failure this adapter is designed to make impossible.
   */
  logger: RunnerLogger;
}

export function createStubCodeRunner({ logger }: StubRunnerOptions): CodeRunner {
  return {
    name: STUB_RUNNER_NAME,

    async run(req: RunRequest): Promise<RunResult> {
      logger.warn("Stub code runner used - no code was executed", {
        runner: STUB_RUNNER_NAME,
        language: req.language,
        sourceLength: req.source.length,
        asserted: req.expectedStdout !== undefined,
      });

      const stdout = req.stdin ?? "";

      const verdict =
        req.expectedStdout === undefined ||
        normalizeOutput(stdout) === normalizeOutput(req.expectedStdout)
          ? "ACCEPTED"
          : "WRONG_ANSWER";

      return {
        verdict,
        stdout,
        stderr: STUB_BANNER,
        timeMs: 0,
        memoryKb: 0,
      };
    },
  };
}
