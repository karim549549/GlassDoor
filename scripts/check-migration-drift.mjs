/**
 * Offline drift check: does the hand-written migration SQL produce the same
 * columns the Prisma schema declares? The real gate needs a shadow database
 * (`migrate diff --from-migrations`), which is impossible while the DB is
 * unreachable. This catches the most likely failure mode instead: a typo'd or
 * forgotten column in hand-authored DDL.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

const repo = process.argv[2] ?? process.cwd();
const migDir = join(repo, "prisma/schema/migrations");

const target = execSync(
  "npx prisma migrate diff --from-empty --to-schema prisma/schema --script",
  { cwd: repo, encoding: "utf8", maxBuffer: 64 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"] }
);

function parseCreates(sql) {
  const out = new Map();
  const re = /CREATE TABLE (?:IF NOT EXISTS )?"([a-z_]+)"\s*\(([\s\S]*?)\n\);/gi;
  let m;
  while ((m = re.exec(sql))) {
    const cols = new Set();
    for (const c of m[2].matchAll(/^\s*"([A-Za-z_]+)"\s+/gm)) cols.add(c[1]);
    const existing = out.get(m[1]) ?? new Set();
    for (const c of cols) existing.add(c);
    out.set(m[1], existing);
  }
  return out;
}

const schemaTables = parseCreates(target);

const migFiles = readdirSync(migDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => join(migDir, d.name, "migration.sql"))
  .sort();

const migTables = new Map();
for (const f of migFiles) {
  let sql;
  try { sql = readFileSync(f, "utf8"); } catch { continue; }
  for (const [t, cols] of parseCreates(sql)) {
    const set = migTables.get(t) ?? new Set();
    for (const c of cols) set.add(c);
    migTables.set(t, set);
  }
  // RENAME TO carries a table's columns to its new name.
  for (const m of sql.matchAll(/ALTER TABLE "([a-z_]+)" RENAME TO "([a-z_]+)"/gi)) {
    const from = migTables.get(m[1]);
    if (from) { migTables.set(m[2], new Set(from)); migTables.delete(m[1]); }
  }
  for (const m of sql.matchAll(/ALTER TABLE "([a-z_]+)"([\s\S]*?);/gi)) {
    const t = m[1];
    const set = migTables.get(t) ?? new Set();
    for (const c of m[2].matchAll(/ADD COLUMN (?:IF NOT EXISTS )?"([A-Za-z_]+)"/gi)) set.add(c[1]);
    for (const c of m[2].matchAll(/DROP COLUMN (?:IF EXISTS )?"([A-Za-z_]+)"/gi)) set.delete(c[1]);
    for (const c of m[2].matchAll(/RENAME COLUMN "([A-Za-z_]+)" TO "([A-Za-z_]+)"/gi)) {
      set.delete(c[1]); set.add(c[2]);
    }
    migTables.set(t, set);
  }
  for (const m of sql.matchAll(/DROP TABLE (?:IF EXISTS )?"([a-z_]+)"/gi)) migTables.delete(m[1]);
}

let bad = 0;
for (const [t, want] of [...schemaTables].sort()) {
  const have = migTables.get(t);
  if (!have) { console.log(`MISSING TABLE  ${t} — declared in schema, never created by any migration`); bad++; continue; }
  const missing = [...want].filter((c) => !have.has(c)).sort();
  const extra = [...have].filter((c) => !want.has(c)).sort();
  if (missing.length || extra.length) {
    bad++;
    console.log(`DRIFT  ${t}`);
    if (missing.length) console.log(`   schema has, migrations lack : ${missing.join(", ")}`);
    if (extra.length) console.log(`   migrations have, schema lacks: ${extra.join(", ")}`);
  }
}
console.log(bad === 0
  ? `\nOK — all ${schemaTables.size} tables agree between schema and migration SQL`
  : `\n${bad} table(s) drifted`);
process.exit(bad === 0 ? 0 : 1);
