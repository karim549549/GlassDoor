/**
 * Prints a compact `table:col1,col2,...` digest of the schema Prisma DECLARES,
 * derived from `migrate diff --from-empty --to-schema` (works with no database).
 *
 * Pair it with the same digest taken from a live database to detect drift
 * without needing a shadow DB or a connection string:
 *
 *   SELECT table_name || ':' || string_agg(column_name, ',' ORDER BY column_name)
 *   FROM information_schema.columns
 *   WHERE table_schema='public' AND table_name <> '_prisma_migrations'
 *   GROUP BY table_name ORDER BY table_name;
 *
 * Run: node scripts/schema-digest.mjs
 */
import { execSync } from "node:child_process";

const sql = execSync(
  "npx prisma migrate diff --from-empty --to-schema prisma/schema --script",
  { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"] }
);

const tables = new Map();
for (const m of sql.matchAll(/CREATE TABLE "([a-z_]+)" \(([\s\S]*?)\n\);/g)) {
  const cols = [...m[2].matchAll(/^\s*"([A-Za-z_]+)"\s+/gm)].map((c) => c[1]);
  tables.set(m[1], cols.sort());
}

for (const [t, cols] of [...tables].sort()) {
  console.log(`${t}:${cols.join(",")}`);
}
