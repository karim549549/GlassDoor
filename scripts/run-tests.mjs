/**
 * Discovers and runs every `*.test.ts` under lib/.
 *
 * `node --test` only gained glob-pattern support in Node 22, and this project
 * runs on Node 20 - so `tsx --test "lib/**\/*.test.ts"` matches nothing and
 * exits 0 having run zero tests, which is the worst possible failure mode for
 * a test command. Passing an explicit file list avoided that but had to be
 * hand-maintained in package.json, which drifts the moment someone adds a file.
 * This walks the tree instead.
 */
import { readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const searchRoot = join(root, "lib");

const files = readdirSync(searchRoot, { recursive: true, withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith(".test.ts"))
  .map((entry) => relative(root, join(entry.parentPath ?? entry.path, entry.name)))
  .sort();

if (files.length === 0) {
  console.error("No test files found under lib/ - refusing to report success.");
  process.exit(1);
}

console.log(`Running ${files.length} test file(s):\n  ${files.join("\n  ")}\n`);

const result = spawnSync("npx", ["tsx", "--test", ...files], {
  stdio: "inherit",
  cwd: root,
  shell: process.platform === "win32",
});

process.exit(result.status ?? 1);
