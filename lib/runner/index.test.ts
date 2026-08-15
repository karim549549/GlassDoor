import { test } from "node:test";
import assert from "node:assert/strict";
import {
  assertRealCodeRunner,
  createStubCodeRunner,
  getCodeRunner,
  Judge0ConfigError,
  JUDGE0_LANGUAGE_IDS,
  JUDGE0_RUNNER_NAME,
  mapJudge0StatusId,
  STUB_BANNER,
  STUB_RUNNER_NAME,
  type RunnerEnv,
  type RunnerLogger,
  type RunVerdict,
} from "./index";

interface LogEntry {
  level: "error" | "warn";
  message: string;
  context?: Record<string, unknown>;
}

/** Recording logger, so tests can assert what the runner announced. */
function recordingLogger(): RunnerLogger & { entries: LogEntry[] } {
  const entries: LogEntry[] = [];
  return {
    entries,
    error: (message, context) => entries.push({ level: "error", message, context }),
    warn: (message, context) => entries.push({ level: "warn", message, context }),
  };
}

/** An env with no Judge0 config, isolated from the real process.env. */
const NO_JUDGE0: RunnerEnv = {};
const FULL_JUDGE0: RunnerEnv = {
  JUDGE0_URL: "https://judge0.example.test",
  JUDGE0_KEY: "test-key",
};

// --- adapter selection ----------------------------------------------------

test("no JUDGE0_URL selects the stub", () => {
  const runner = getCodeRunner(recordingLogger(), NO_JUDGE0);
  assert.equal(runner.name, STUB_RUNNER_NAME);
});

test("a blank JUDGE0_URL selects the stub rather than a runner with an empty base url", () => {
  const runner = getCodeRunner(recordingLogger(), { JUDGE0_URL: "   ", JUDGE0_KEY: "k" });
  assert.equal(runner.name, STUB_RUNNER_NAME);
});

test("JUDGE0_URL plus JUDGE0_KEY selects Judge0", () => {
  const runner = getCodeRunner(recordingLogger(), FULL_JUDGE0);
  assert.equal(runner.name, JUDGE0_RUNNER_NAME);
});

test("JUDGE0_URL without JUDGE0_KEY throws at construction, never falls back to the stub", () => {
  // The dangerous alternative is silently degrading a misconfigured production
  // deploy to a runner that does not execute code.
  assert.throws(
    () => getCodeRunner(recordingLogger(), { JUDGE0_URL: "https://judge0.example.test" }),
    (error: unknown) => error instanceof Judge0ConfigError && /JUDGE0_KEY/.test(String(error))
  );
});

test("assertRealCodeRunner rejects the stub and passes Judge0 through", () => {
  const logger = recordingLogger();
  assert.throws(
    () => assertRealCodeRunner(getCodeRunner(logger, NO_JUDGE0)),
    /does not execute code/
  );
  const real = getCodeRunner(logger, FULL_JUDGE0);
  assert.equal(assertRealCodeRunner(real), real);
});

// --- stub verdicts --------------------------------------------------------

const stub = (logger: RunnerLogger) => createStubCodeRunner({ logger });

test("stub: no expectedStdout means nothing was asserted, so ACCEPTED", async () => {
  const result = await stub(recordingLogger()).run({
    language: "python",
    source: "print('anything at all')",
  });
  assert.equal(result.verdict, "ACCEPTED");
});

test("stub: expectedStdout matching the stdin echo is ACCEPTED", async () => {
  const result = await stub(recordingLogger()).run({
    language: "python",
    source: "ignored",
    stdin: "4 7\n",
    expectedStdout: "4 7",
  });
  assert.equal(result.verdict, "ACCEPTED");
  assert.equal(result.stdout, "4 7\n");
});

test("stub: expectedStdout not matching the stdin echo is WRONG_ANSWER", async () => {
  const result = await stub(recordingLogger()).run({
    language: "python",
    source: "ignored",
    stdin: "4 7\n",
    expectedStdout: "11",
  });
  assert.equal(result.verdict, "WRONG_ANSWER");
});

test("stub: comparison normalises line endings and trailing whitespace", async () => {
  const result = await stub(recordingLogger()).run({
    language: "python",
    source: "ignored",
    stdin: "a  \r\nb\r\n\n\n",
    expectedStdout: "a\nb",
  });
  assert.equal(result.verdict, "ACCEPTED");
});

test("stub: identical requests produce deeply-equal results (no clock, no randomness)", async () => {
  const runner = stub(recordingLogger());
  const req = { language: "cpp", source: "int main(){}", stdin: "x", expectedStdout: "x" };
  assert.deepEqual(await runner.run(req), await runner.run(req));
});

test("stub: every result is marked as not-really-executed", async () => {
  const runner = stub(recordingLogger());
  assert.equal(runner.name, STUB_RUNNER_NAME);
  const result = await runner.run({ language: "python", source: "print(1)" });
  assert.equal(result.stderr, STUB_BANNER);
  assert.match(String(result.stderr), /NO CODE WAS EXECUTED/);
});

test("stub: every run warns, so a stubbed production judge shows up in logs", async () => {
  const logger = recordingLogger();
  const runner = stub(logger);
  await runner.run({ language: "python", source: "a" });
  await runner.run({ language: "python", source: "b" });

  assert.equal(logger.entries.length, 2);
  for (const entry of logger.entries) {
    assert.equal(entry.level, "warn");
    assert.match(entry.message, /no code was executed/i);
    assert.equal(entry.context?.runner, STUB_RUNNER_NAME);
  }
});

// --- Judge0 status mapping (no network) -----------------------------------

test("Judge0 status ids 1 and 2 mean not-finished, not a verdict", () => {
  assert.equal(mapJudge0StatusId(1), null);
  assert.equal(mapJudge0StatusId(2), null);
});

test("Judge0 status ids map to the documented verdicts", () => {
  const expected: Record<number, RunVerdict> = {
    3: "ACCEPTED",
    4: "WRONG_ANSWER",
    5: "TIME_LIMIT_EXCEEDED",
    6: "COMPILE_ERROR",
    7: "RUNTIME_ERROR",
    8: "RUNTIME_ERROR",
    9: "RUNTIME_ERROR",
    10: "RUNTIME_ERROR",
    11: "RUNTIME_ERROR",
    12: "RUNTIME_ERROR",
    13: "INTERNAL_ERROR",
    14: "INTERNAL_ERROR",
  };
  for (const [id, verdict] of Object.entries(expected)) {
    assert.equal(mapJudge0StatusId(Number(id)), verdict, `status id ${id}`);
  }
});

test("an unknown Judge0 status id is INTERNAL_ERROR, never ACCEPTED", () => {
  // The failure that must not happen is an unrecognised state being rounded
  // down into a passing verdict.
  for (const id of [0, 15, 99, -1, 1.5]) {
    assert.equal(mapJudge0StatusId(id), "INTERNAL_ERROR", `status id ${id}`);
  }
});

test("Judge0 never reports MEMORY_LIMIT_EXCEEDED - it has no status id for it", () => {
  // Documented so nobody writes a branch waiting for a verdict that cannot
  // arrive from this adapter. Judge0 kills an over-memory run as SIGSEGV /
  // SIGABRT / NZEC, indistinguishable from an ordinary crash.
  const produced = new Set<RunVerdict | null>();
  for (let id = 0; id <= 20; id += 1) produced.add(mapJudge0StatusId(id));
  assert.equal(produced.has("MEMORY_LIMIT_EXCEEDED"), false);
});

test("the Judge0 language table is keyed lowercase and maps to positive ids", () => {
  const entries = Object.entries(JUDGE0_LANGUAGE_IDS);
  assert.ok(entries.length > 0);
  for (const [language, id] of entries) {
    assert.equal(language, language.toLowerCase(), `${language} must be lowercase`);
    assert.ok(Number.isInteger(id) && id > 0, `${language} -> ${id}`);
  }
  assert.equal(JUDGE0_LANGUAGE_IDS.python, 71);
  assert.equal(JUDGE0_LANGUAGE_IDS.javascript, 63);
});

test("Judge0 returns INTERNAL_ERROR for an unsupported language without a network call", async () => {
  const logger = recordingLogger();
  const runner = getCodeRunner(logger, FULL_JUDGE0);
  const result = await runner.run({ language: "brainfuck", source: "+++" });

  assert.equal(result.verdict, "INTERNAL_ERROR");
  assert.match(String(result.stderr), /Unsupported language/);
  assert.equal(logger.entries[0]?.level, "error");
});
