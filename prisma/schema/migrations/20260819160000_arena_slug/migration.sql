-- Arenas get a readable URL of their own.
--
-- The URL was {slugified-title}-{uuid}, which meant every arena link ended in
-- 36 characters of hex - the part doing the actual lookup, with the words in
-- front of it as decoration. That is backwards for a string whose whole
-- audience is people reading a history dropdown, a shared message or a search
-- result.
--
-- Added nullable, backfilled, then made NOT NULL and unique, so the column is
-- never in a state where an existing row cannot satisfy it.
ALTER TABLE "arenas" ADD COLUMN IF NOT EXISTS "slug" TEXT;

-- The backfill mirrors `arenaSlugBase` in lib/arena-slug.ts closely enough for
-- existing rows: lowercase, strip anything that is not a word character or
-- space, collapse to hyphens, trim, cap at 60 characters on a word boundary.
-- New rows get their slug from the TypeScript, which is the version under test.
WITH based AS (
  SELECT
    id,
    NULLIF(
      regexp_replace(
        left(
          trim(BOTH '-' FROM regexp_replace(
            regexp_replace(lower(title), '[^a-z0-9\s-]', '', 'g'),
            '[\s_-]+', '-', 'g'
          )),
          60
        ),
        '-[a-z0-9]*$',
        ''
      ),
      ''
    ) AS base
  FROM "arenas"
  WHERE "slug" IS NULL
),
numbered AS (
  SELECT
    id,
    COALESCE(base, 'arena') AS base,
    ROW_NUMBER() OVER (PARTITION BY COALESCE(base, 'arena') ORDER BY id) AS n
  FROM based
)
UPDATE "arenas" a
SET "slug" = CASE WHEN n.n = 1 THEN n.base ELSE n.base || '-' || n.n END
FROM numbered n
WHERE a.id = n.id;

-- Belt and braces: any row the backfill somehow left empty falls back to its
-- id, which is ugly but unique and never null.
UPDATE "arenas" SET "slug" = id::text WHERE "slug" IS NULL OR "slug" = '';

ALTER TABLE "arenas" ALTER COLUMN "slug" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "arenas_slug_key" ON "arenas" ("slug");
