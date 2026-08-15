import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { validateImageUpload, uploadImageToStorage } from "@/lib/server/upload";
import { requireUser } from "@/lib/server/auth/require-user";
import { withApiErrorHandling } from "@/lib/server/api-route";
import { checkRateLimit, rateLimitResponse } from "@/lib/server/rate-limit";

export async function POST(request: NextRequest) {
  return withApiErrorHandling(
    "Profile upload internal error",
    async () => {
      const auth = await requireUser();
      if ("response" in auth) return auth.response;
      const { user } = auth;

      // Keyed on the authenticated user rather than the IP: every upload writes
      // up to 5MB through the service-role client, which bypasses storage RLS.
      const limit = checkRateLimit(`upload-profile:${user.id}`, { limit: 20, windowMs: 3_600_000 });
      if (!limit.ok) return rateLimitResponse(limit.retryAfterSeconds);

      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const type = formData.get("type") as string | null; // "avatar" or "cover"

      if (!file || !type) {
        return NextResponse.json({ error: "Missing file or upload type." }, { status: 400 });
      }

      if (type !== "avatar" && type !== "cover") {
        return NextResponse.json({ error: "Invalid upload type." }, { status: 400 });
      }

      // Validate file - matches the "DevsArena" bucket's own size/MIME restrictions,
      // enforced here too since a request can bypass the client-side check entirely.
      const validation = validateImageUpload(file);
      if (!validation.ok) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }

      // Upload to Supabase Storage via the service-role client. This bypasses
      // storage RLS, which is safe here because filePath is built from user.id
      // taken from the verified session above, never from client input.
      const filePath = `${type}s/${user.id}.jpg`; // We compress to JPEG on client anyway

      const { publicUrl } = await uploadImageToStorage({ file, path: filePath });

      // Cache-busting URL parameter ensures client browsers don't serve old cached assets
      const finalUrl = `${publicUrl}?t=${Date.now()}`;

      // Update user record in local Postgres database
      await prisma.user.update({
        where: { id: user.id },
        data: {
          [type === "avatar" ? "avatarUrl" : "coverUrl"]: finalUrl,
        },
      });

      return NextResponse.json({ success: true, url: finalUrl });
    },
    "An unexpected error occurred during upload.",
    request
  );
}
