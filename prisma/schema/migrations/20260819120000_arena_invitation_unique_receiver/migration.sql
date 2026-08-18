-- One invitation per person per arena.
--
-- `ArenaInvitation` had indexes on arenaId, receiverId and senderId but no
-- constraint tying the first two together, so nothing stopped a host inviting
-- the same person five times - which is what a double-clicked button produces.
-- The service checks before inserting, and a check before an insert loses to
-- two requests in the same second; this is the guard that does not.
--
-- Duplicates are collapsed first, keeping the oldest row per (arena, receiver)
-- and preferring an answered invitation over a pending one, so an ACCEPTED
-- invitation is never the row that gets deleted.
DELETE FROM "arena_invitations" a
USING "arena_invitations" b
WHERE a."arenaId" = b."arenaId"
  AND a."receiverId" = b."receiverId"
  AND a.id <> b.id
  AND (
    (a.status = 'PENDING' AND b.status <> 'PENDING')
    OR (
      (a.status = 'PENDING') = (b.status = 'PENDING')
      AND (a."createdAt", a.id) > (b."createdAt", b.id)
    )
  );

CREATE UNIQUE INDEX IF NOT EXISTS "arena_invitations_arenaId_receiverId_key"
  ON "arena_invitations" ("arenaId", "receiverId");
