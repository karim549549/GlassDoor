import "server-only";
import type { NotificationKind, Prisma } from "@prisma/client";
import prisma from "@/lib/server/prisma";

/**
 * Only the columns the inbox actually renders. `userId` is deliberately absent
 * from the response shape: the caller already is that user (the route derives
 * the id from the session), so echoing it back adds nothing and makes it look
 * like a parameter something might be tempted to pass in.
 */
const NOTIFICATION_SELECT = {
  id: true,
  kind: true,
  title: true,
  body: true,
  linkUrl: true,
  arenaId: true,
  actorId: true,
  readAt: true,
  createdAt: true,
} satisfies Prisma.NotificationSelect;

export type RawNotification = Prisma.NotificationGetPayload<{ select: typeof NOTIFICATION_SELECT }>;

export interface CreateNotificationInput {
  userId: string;
  kind: NotificationKind;
  title: string;
  body: string;
  linkUrl?: string | null;
  /** Loose references, not FKs — see the schema comment on `Notification`. */
  arenaId?: string | null;
  actorId?: string | null;
}

export async function createNotification(input: CreateNotificationInput): Promise<RawNotification> {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      kind: input.kind,
      title: input.title,
      body: input.body,
      linkUrl: input.linkUrl ?? null,
      arenaId: input.arenaId ?? null,
      actorId: input.actorId ?? null,
    },
    select: NOTIFICATION_SELECT,
  });
}

/**
 * Fan-out helper for the "Ahmed and 2 connections registered" style alerts:
 * one insert for many recipients instead of a create() per user in a loop.
 * Returns the number of rows written, since createMany cannot return rows.
 */
export async function createNotificationsForUsers(
  userIds: string[],
  notification: Omit<CreateNotificationInput, "userId">
): Promise<number> {
  if (userIds.length === 0) return 0;

  const { count } = await prisma.notification.createMany({
    data: userIds.map((userId) => ({
      userId,
      kind: notification.kind,
      title: notification.title,
      body: notification.body,
      linkUrl: notification.linkUrl ?? null,
      arenaId: notification.arenaId ?? null,
      actorId: notification.actorId ?? null,
    })),
  });
  return count;
}

export interface ListNotificationsParams {
  userId: string;
  page: number;
  pageSize: number;
  unreadOnly: boolean;
}

export interface ListNotificationsResult {
  notifications: RawNotification[];
  total: number;
  totalPages: number;
  unreadCount: number;
}

/**
 * The inbox query: this user's notifications, unread first, newest first
 * within each group. That ordering is exactly what `@@index([userId, readAt,
 * createdAt])` was added for.
 *
 * `nulls: "first"` is explicit because Postgres sorts NULLs last on ASC by
 * default, which would put every *read* notification above the unread ones.
 */
export async function listForUser(params: ListNotificationsParams): Promise<ListNotificationsResult> {
  const { userId, page, pageSize, unreadOnly } = params;

  const where: Prisma.NotificationWhereInput = {
    userId,
    ...(unreadOnly ? { readAt: null } : {}),
  };

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: [{ readAt: { sort: "asc", nulls: "first" } }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: NOTIFICATION_SELECT,
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId, readAt: null } }),
  ]);

  return {
    notifications,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    unreadCount,
  };
}

/**
 * Both mark helpers scope the update by `userId` as well as by id. That is the
 * authorization check, not a redundancy: without it a caller could pass any
 * notification id and flip a stranger's inbox. The route never learns the id
 * from anywhere but the session, and this makes a mistake there harmless.
 *
 * `readAt: null` in the filter keeps the original read timestamp stable when a
 * notification is marked read twice.
 */
export async function markRead(userId: string, ids: string[]): Promise<number> {
  if (ids.length === 0) return 0;

  const { count } = await prisma.notification.updateMany({
    where: { id: { in: ids }, userId, readAt: null },
    data: { readAt: new Date() },
  });
  return count;
}

export async function markAllRead(userId: string): Promise<number> {
  const { count } = await prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
  return count;
}
