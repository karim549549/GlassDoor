import { createJudge0Runner } from "./judge0-adapter";
import { createStubCodeRunner, STUB_RUNNER_NAME } from "./stub-adapter";
import type { CodeRunner, RunnerEnv, RunnerLogger } from "./types";

export type {
  CodeRunner,
  RunRequest,
  RunResult,
  RunVerdict,
  RunnerEnv,
  RunnerLogger,
} from "./types";
export {
  createJudge0Runner,
  mapJudge0StatusId,
  Judge0ConfigError,
  JUDGE0_LANGUAGE_IDS,
  JUDGE0_RUNNER_NAME,
} from "./judge0-adapter";
export { createStubCodeRunner, STUB_RUNNER_NAME, STUB_BANNER } from "./stub-adapter";

/**
 * Selects the code runner for the current environment.
 *
 * `JUDGE0_URL` present -> Judge0. Absent -> the stub.
 *
 * THE STUB MUST NEVER BE SELECTED IN PRODUCTION. It does not execute code; a
 * REP contest judged by it would hand out ratings for output nobody ran. Three
 * things guard against that, in the order they fire:
 *
 *   1. Fail closed on half-configuration. If `JUDGE0_URL` is set but
 *      `JUDGE0_KEY` is not, `createJudge0Runner` throws rather than falling
 *      back. A misconfigured env must break loudly, not quietly downgrade to
 *      a fake judge — that silent fallback is the single most dangerous thing
 *      this function could do.
 *   2. Detect it at boot. Call `assertRealCodeRunner(getCodeRunner(logger))`
 *      wherever auto-judging is wired up. It is a one-line check and it turns
 *      "we shipped the stub" from a data-corruption incident into a failed
 *      deploy.
 *   3. Detect it after the fact. Every stub result carries
 *      `name === STUB_RUNNER_NAME` and a `STUB_BANNER` stderr, and every stub
 *      call logs a warning. Store the runner name with the verdict and a
 *      stub-scored submission stays identifiable forever.
 *
 * `logger` is a parameter rather than an import of `lib/server/logger.ts`
 * because that module is `server-only` and throws when imported outside a
 * React Server Component — including under `node --test`. Pass the server
 * logger from any API route; it satisfies `RunnerLogger` structurally.
 *
 * `env` is a parameter for the same reason: so tests select an adapter without
 * mutating `process.env`.
 */
export function getCodeRunner(
  logger: RunnerLogger,
  env: RunnerEnv = process.env
): CodeRunner {
  if (env.JUDGE0_URL?.trim()) {
    return createJudge0Runner(logger, env);
  }
  return createStubCodeRunner({ logger });
}

/**
 * Throws if `runner` is the non-executing stub. Call this at the point
 * auto-judging is initialised in any environment whose verdicts are kept.
 */
export function assertRealCodeRunner(runner: CodeRunner): CodeRunner {
  if (runner.name === STUB_RUNNER_NAME) {
    throw new Error(
      "The stub code runner is active: it does not execute code and its verdicts are meaningless. " +
        "Set JUDGE0_URL and JUDGE0_KEY."
    );
  }
  return runner;
}
