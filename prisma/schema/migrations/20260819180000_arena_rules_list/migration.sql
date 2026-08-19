-- House rules become a list.
--
-- `rulesText` was a free-text blob, and every arena filled it with a run of
-- short sentences - "Original work only. Any stack. Be nice in the chat." -
-- because that is what rules are. Rendered as a paragraph, three separate
-- rules read as one piece of prose nobody scans.
--
-- A list column rather than a convention about newlines. A convention is
-- something the next writer breaks, and there is no meaningful state where two
-- rules belong in the same string.
ALTER TABLE "arenas" ADD COLUMN IF NOT EXISTS "rules" TEXT[] NOT NULL DEFAULT '{}';

-- Split existing values into entries. Newlines first, because a host who typed
-- a list already used them; failing that, sentence boundaries, which is how
-- every seeded row is written. Leading markdown bullets are stripped, since a
-- textarea invited them and several rows will have one.
UPDATE "arenas"
SET "rules" = COALESCE(
  (
    SELECT array_agg(cleaned ORDER BY ord)
    FROM (
      SELECT
        ord,
        trim(regexp_replace(part, '^\s*(?:[-*•]|\d+[.)])\s*', '')) AS cleaned
      FROM unnest(
        CASE
          WHEN "rulesText" ~ '[\r\n]' THEN regexp_split_to_array("rulesText", '[\r\n]+')
          ELSE regexp_split_to_array("rulesText", '(?<=[.!?])\s+')
        END
      ) WITH ORDINALITY AS s(part, ord)
      WHERE trim(regexp_replace(part, '^\s*(?:[-*•]|\d+[.)])\s*', '')) <> ''
    ) parts
  ),
  '{}'
)
WHERE "rulesText" IS NOT NULL AND trim("rulesText") <> '';

-- Dropped rather than left unread: an unused column is a standing invitation
-- for something to start writing to it again, and the form, the schema, the
-- DTO and the board's search clause all move in the same change.
ALTER TABLE "arenas" DROP COLUMN IF EXISTS "rulesText";
