import "server-only";
import { createAdminClient } from "@/lib/server/supabase/admin";
import { ACCEPTED_IMAGE_TYPES, MAX_UPLOAD_SIZE_BYTES } from "@/lib/upload-constants";

export type ValidateImageResult = { ok: true } | { ok: false; error: string };

export function validateImageUpload(file: File): ValidateImageResult {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
    return { ok: false, error: "File must be a JPEG, PNG, or WebP image." };
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    return { ok: false, error: "File size must be under 5MB." };
  }

  return { ok: true };
}

export interface UploadImageParams {
  file: File;
  /** Storage bucket, defaults to the shared "DevsArena" bucket used by all image uploads. */
  bucket?: string;
  /** Final storage path within the bucket, e.g. `contests/covers/${uuid}.jpg` or `${type}s/${userId}.jpg`. */
  path: string;
  contentType?: string;
}

export async function uploadImageToStorage({
  file,
  bucket = "DevsArena",
  path,
  contentType = "image/jpeg",
}: UploadImageParams): Promise<{ publicUrl: string }> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const admin = createAdminClient();
  const { error: uploadError } = await admin.storage.from(bucket).upload(path, buffer, {
    contentType,
    upsert: true,
  });

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}. Make sure the '${bucket}' bucket exists.`);
  }

  const { data: urlData } = admin.storage.from(bucket).getPublicUrl(path);
  return { publicUrl: urlData.publicUrl };
}
