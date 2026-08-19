-- Teams get an order and a door policy.
--
-- `ArenaTeamMember` recorded who was on a team and who led it, and nothing
-- else. Two rules need more than that:
--
--   Leadership has to pass to somebody when the leader leaves, and "the next
--   person who joined" is the only answer that needs no decision from anyone.
--   Without a timestamp there is no next.
--
--   A team is either open to strangers or it is a group of friends, and that
--   is the one setting a team actually needs. Everything else considered -
--   blurbs, preferred stacks, per-team deadlines - is decoration until people
--   are forming teams in numbers.
CREATE TYPE "TeamJoinPolicy" AS ENUM ('OPEN', 'INVITE_ONLY');

ALTER TABLE "arena_team_members"
  ADD COLUMN IF NOT EXISTS "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Existing rows all predate this, so the founder is ordered first and everyone
-- else follows by user id. Arbitrary, but stable, and it only decides
-- succession on teams that were seeded before the column existed.
UPDATE "arena_team_members" m
SET "joinedAt" = t."createdAt" + (
  CASE WHEN m."isLeader" THEN INTERVAL '0 second' ELSE INTERVAL '1 second' END
)
FROM "arena_teams" t
WHERE t.id = m."teamId";

ALTER TABLE "arena_teams"
  ADD COLUMN IF NOT EXISTS "joinPolicy" "TeamJoinPolicy" NOT NULL DEFAULT 'OPEN';

-- The arena's default, which every team on it starts from. Separate from
-- `allowLeaderAccessControl`, which already exists and decides whether a
-- leader may depart from it.
ALTER TABLE "arenas"
  ADD COLUMN IF NOT EXISTS "defaultTeamJoinPolicy" "TeamJoinPolicy" NOT NULL DEFAULT 'OPEN';

CREATE INDEX IF NOT EXISTS "arena_team_members_teamId_joinedAt_idx"
  ON "arena_team_members" ("teamId", "joinedAt");
