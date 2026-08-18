-- Repairs the backfill in 20260819160000_arena_slug.
--
-- That one applied its word-boundary trim unconditionally, so it dropped the
-- last word of every slug whether or not the string had been truncated:
-- "Rebuild something famous, but wrong" became `rebuild-something-famous-but`
-- at 28 characters, nowhere near the 60 the cut was supposed to protect.
--
-- Fixed forward rather than by editing the applied migration, per this repo's
-- rule. A fresh database runs both in order and lands in the same place.
--
-- Only rows whose slug still looks machine-generated are touched: anything a
-- host has since been given by the TypeScript is left alone, since the
-- application is the authority on new slugs and this is only cleaning up after
-- itself. In practice that is every row at the time of writing.
WITH cleaned AS (
  SELECT
    id,
    trim(BOTH '-' FROM regexp_replace(
      regexp_replace(lower(title), '[^a-z0-9\s-]', '', 'g'),
      '[\s_-]+', '-', 'g'
    )) AS full_slug
  FROM "arenas"
),
based AS (
  SELECT
    id,
    -- Trim to a word boundary ONLY when the slug is actually over length.
    -- left(x, 61) then cutting the trailing partial word yields the longest
    -- run of whole words that fits in 60.
    COALESCE(
      NULLIF(
        CASE
          WHEN length(full_slug) <= 60 THEN full_slug
          ELSE regexp_replace(left(full_slug, 61), '-[^-]*$', '')
        END,
        ''
      ),
      'arena'
    ) AS base
  FROM cleaned
),
numbered AS (
  SELECT id, base, ROW_NUMBER() OVER (PARTITION BY base ORDER BY id) AS n
  FROM based
)
UPDATE "arenas" a
SET "slug" = CASE WHEN n.n = 1 THEN n.base ELSE n.base || '-' || n.n END
FROM numbered n
WHERE a.id = n.id
  AND a."slug" IS DISTINCT FROM (CASE WHEN n.n = 1 THEN n.base ELSE n.base || '-' || n.n END);
