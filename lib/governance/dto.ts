import { z } from "zod";
import type { RawNotification } from "./notification-service";
import type { RawDispute } from "./dispute-service";

/**
 * `readAt` is a timestamp internally (so "when was it read" stays answerable)
 * but the inbox only ever branches on read/unread — the DTO exposes both rather
 * than making every consumer do the null check itself.
 */
export const notificationDtoSchema = z.object({
  id: z.string(),
  kind: z.string(),
  title: z.string(),
  body: z.string(),
  linkUrl: z.string().nullable(),
  arenaId: z.string().nullable(),
  actorId: z.string().nullable(),
  read: z.boolean(),
  readAt: z.string().nullable(),
  createdAt: z.string(),
});

export type NotificationDto = z.infer<typeof notificationDtoSchema>;

export function toNotificationDto(raw: RawNotification): NotificationDto {
  return notificationDtoSchema.parse({
    id: raw.id,
    kind: raw.kind,
    title: raw.title,
    body: raw.body,
    linkUrl: raw.linkUrl,
    arenaId: raw.arenaId,
    actorId: raw.actorId,
    read: raw.readAt !== null,
    readAt: raw.readAt?.toISOString() ?? null,
    createdAt: raw.createdAt.toISOString(),
  });
}

/** Flattens the `reporter` relation the service selects for the moderator queue. */
export const disputeDtoSchema = z.object({
  id: z.string(),
  category: z.string(),
  status: z.string(),
  detail: z.string(),
  arenaId: z.string().nullable(),
  submissionId: z.string().nullable(),
  commentId: z.string().nullable(),
  reporterId: z.string(),
  reporterName: z.string().nullable(),
  reporterHandle: z.string().nullable(),
  resolutionNote: z.string().nullable(),
  resolvedById: z.string().nullable(),
  resolvedAt: z.string().nullable(),
  createdAt: z.string(),
});

export type DisputeDto = z.infer<typeof disputeDtoSchema>;

export function toDisputeDto(raw: RawDispute): DisputeDto {
  return disputeDtoSchema.parse({
    id: raw.id,
    category: raw.category,
    status: raw.status,
    detail: raw.detail,
    arenaId: raw.arenaId,
    submissionId: raw.submissionId,
    commentId: raw.commentId,
    reporterId: raw.reporterId,
    reporterName: raw.reporter?.fullName ?? null,
    reporterHandle: raw.reporter?.handle ?? null,
    resolutionNote: raw.resolutionNote,
    resolvedById: raw.resolvedById,
    resolvedAt: raw.resolvedAt?.toISOString() ?? null,
    createdAt: raw.createdAt.toISOString(),
  });
}
