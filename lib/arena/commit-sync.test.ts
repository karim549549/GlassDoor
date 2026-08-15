import { test } from "node:test";
import assert from "node:assert/strict";
import { parseGithubRepoUrl, summariseCommitHistory } from "./commit-sync";

test("parses the shapes entrants actually paste", () => {
  const expected = { owner: "vercel", repo: "next.js" };
  assert.deepEqual(parseGithubRepoUrl("https://github.com/vercel/next.js"), expected);
  assert.deepEqual(parseGithubRepoUrl("https://github.com/vercel/next.js/"), expected);
  assert.deepEqual(parseGithubRepoUrl("https://github.com/vercel/next.js.git"), expected);
  assert.deepEqual(parseGithubRepoUrl("  https://github.com/vercel/next.js  "), expected);
  assert.deepEqual(parseGithubRepoUrl("https://github.com/vercel/next.js/tree/main"), expected);
  assert.deepEqual(
    parseGithubRepoUrl("https://github.com/vercel/next.js/blob/canary/packages/next/package.json"),
    expected
  );
  assert.deepEqual(parseGithubRepoUrl("https://www.github.com/vercel/next.js"), expected);
  assert.deepEqual(parseGithubRepoUrl("http://github.com/vercel/next.js"), expected);
  assert.deepEqual(parseGithubRepoUrl("github.com/vercel/next.js"), expected);
  assert.deepEqual(parseGithubRepoUrl("git@github.com:vercel/next.js.git"), expected);
  assert.deepEqual(parseGithubRepoUrl("HTTPS://GitHub.com/vercel/next.js"), expected);
});

test("keeps query strings and fragments out of the repo name", () => {
  assert.deepEqual(parseGithubRepoUrl("https://github.com/a-user/my_repo?tab=readme"), {
    owner: "a-user",
    repo: "my_repo",
  });
  assert.deepEqual(parseGithubRepoUrl("https://github.com/a-user/my_repo#readme"), {
    owner: "a-user",
    repo: "my_repo",
  });
});

test("rejects any host that is not github.com (SSRF boundary)", () => {
  assert.equal(parseGithubRepoUrl("https://gitlab.com/o/r"), null);
  assert.equal(parseGithubRepoUrl("https://github.com.evil.com/o/r"), null);
  assert.equal(parseGithubRepoUrl("https://evil.com/github.com/o/r"), null);
  assert.equal(parseGithubRepoUrl("evil.com/github.com/o/r"), null);
  // Userinfo trick: the real host is evil.com.
  assert.equal(parseGithubRepoUrl("https://github.com@evil.com/o/r"), null);
  assert.equal(parseGithubRepoUrl("http://169.254.169.254/latest/meta-data"), null);
  assert.equal(parseGithubRepoUrl("http://localhost:3000/o/r"), null);
  assert.equal(parseGithubRepoUrl("file:///etc/passwd"), null);
  assert.equal(parseGithubRepoUrl("javascript:alert(1)"), null);
});

test("rejects github URLs that are not a repository", () => {
  assert.equal(parseGithubRepoUrl("https://github.com/vercel"), null);
  assert.equal(parseGithubRepoUrl("https://github.com/"), null);
  assert.equal(parseGithubRepoUrl("https://github.com/orgs/vercel"), null);
  assert.equal(parseGithubRepoUrl("https://github.com/settings/profile"), null);
  assert.equal(parseGithubRepoUrl("https://github.com/-bad/repo"), null);
  assert.equal(parseGithubRepoUrl("https://github.com/o/.."), null);
});

test("rejects empty and non-string input", () => {
  assert.equal(parseGithubRepoUrl(""), null);
  assert.equal(parseGithubRepoUrl("   "), null);
  assert.equal(parseGithubRepoUrl(null), null);
  assert.equal(parseGithubRepoUrl(undefined), null);
});

test("summarises an empty history without inventing a span", () => {
  assert.deepEqual(summariseCommitHistory([]), {
    commitCount: 0,
    firstCommitAt: null,
    lastCommitAt: null,
    spanHours: null,
    distinctAuthors: 0,
    largestGapHours: null,
  });
});

test("summarises span, gap and authors regardless of input order", () => {
  const rows = [
    { committedAt: new Date("2026-08-10T18:00:00.000Z"), author: "alice" },
    { committedAt: new Date("2026-08-10T09:00:00.000Z"), author: "alice" },
    { committedAt: new Date("2026-08-10T10:30:00.000Z"), author: "bob" },
  ];

  const summary = summariseCommitHistory(rows);
  assert.equal(summary.commitCount, 3);
  assert.equal(summary.firstCommitAt, "2026-08-10T09:00:00.000Z");
  assert.equal(summary.lastCommitAt, "2026-08-10T18:00:00.000Z");
  assert.equal(summary.spanHours, 9);
  assert.equal(summary.largestGapHours, 7.5);
  assert.equal(summary.distinctAuthors, 2);
});

test("a single commit has a zero span and no gap - the one-blob-paste shape", () => {
  const summary = summariseCommitHistory([
    { committedAt: new Date("2026-08-10T09:00:00.000Z"), author: null },
  ]);
  assert.equal(summary.commitCount, 1);
  assert.equal(summary.spanHours, 0);
  assert.equal(summary.largestGapHours, null);
  assert.equal(summary.distinctAuthors, 0);
});
