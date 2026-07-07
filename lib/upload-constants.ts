export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024; // 5MB, matches the "DevsArena" storage bucket's own limit
