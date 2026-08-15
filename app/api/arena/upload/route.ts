import { NextResponse, type NextRequest } from "next/server";
import { validateImageUpload, uploadImageToStorage } from "@/lib/server/upload";
import { requireUser } from "@/lib/server/auth/require-user";
import { withApiErrorHandling } from "@/lib/server/api-route";
import { checkRateLimit, rateLimitResponse } from "@/lib/server/rate-limit";

export async function POST(request: NextRequest) {
  return withApiErrorHandling(
    "Arena cover upload internal error",
    async () => {
      const auth = await requireUser();
      if ("response" in auth) return auth.response;
      const { user } = auth;

      // Keyed on the authenticated user rather than the IP: every upload writes
      // up to 5MB to a fresh, never-collected UUID path via the service-role
      // client, so an unlimited caller is an unbounded storage-cost amplifier.
      const limit = checkRateLimit(`upload-arena:${user.id}`, { limit: 20, windowMs: 3_600_000 });
      if (!limit.ok) return rateLimitResponse(limit.retryAfterSeconds);

      const formData = await request.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json({ error: "Missing cover image file." }, { status: 400 });
      }

      const validation = validateImageUpload(file);
      if (!validation.ok) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }

      // Generate a random UUID for the cover image to prevent collisions.
      const randomId = crypto.randomUUID();
      const filePath = `arenas/covers/${randomId}.jpg`;

      const { publicUrl } = await uploadImageToStorage({ file, path: filePath });

      return NextResponse.json({ success: true, url: publicUrl });
    },
    "An unexpected error occurred during upload.",
    request
  );
}
