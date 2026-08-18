-- Removes the two taxonomies that could not be defined, and two columns that
-- had no consumer at all.
--
-- TAGS. Six were seeded ("AI / ML", "Web3 & Crypto", "Frontend", "Backend &
-- Cloud", "DevOps & Mesh") and zero arenas ever used one - because they
-- duplicated the domain enum, which duplicated the job-types list. The table
-- also stored `color` (a metallic colourway, i.e. presentation in the database,
-- so changing the palette meant a migration) and `metadata` described as "RAG
-- vector similarity weights" for a retrieval system that does not exist
-- anywhere in this repo.
--
-- The replacement was going to be flavour tags - "make it bad", "hostile",
-- "one tool only" - drawn from the reference format's actual briefs. That is
-- the right axis and still the wrong time: with four users and no entries, any
-- taxonomy is a guess, and the honest move is to have none until real briefs
-- show what they have in common.
--
-- FORMAT and INTENT. Neither appears in the PRD; `format` additionally carried
-- duration bounds that made the create page's own default unsubmittable (see
-- 20260818140000 and lib/arena/formats.ts), and `intent` duplicated the
-- distinction `authority` already draws. One distinct value each across all 106
-- rows. No code reads either.
--
-- `domain` deliberately stays. Unlike these it still has consumers - the Glicko
-- batch groups arenas by it and proof packets snapshot it - so it becomes a
-- dormant rating bucket rather than a dropped column. See the note on the model.
--
-- Hand-written, as this repo's convention requires for DROP. IF EXISTS
-- throughout so re-running is harmless.

-- The join table first: it has a foreign key into `tags`.
DROP TABLE IF EXISTS "arena_tags_on_arenas";
DROP TABLE IF EXISTS "tags";

ALTER TABLE "arenas" DROP COLUMN IF EXISTS "format";
ALTER TABLE "arenas" DROP COLUMN IF EXISTS "intent";

-- Enums are dropped last: Postgres refuses while a column still uses the type.
DROP TYPE IF EXISTS "ArenaFormat";
DROP TYPE IF EXISTS "ArenaIntent";
