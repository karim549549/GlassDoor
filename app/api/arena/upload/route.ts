import { NextResponse, type NextRequest } from "next/server";
import { validateImageUpload, uploadImageToStorage } from "@/lib/server/upload";
import { requireUser } from "@/lib/server/auth/require-user";
import { withApiErrorHandling } from "@/lib/server/api-route";

export async function POST(request: NextRequest) {
  return withApiErrorHandling(
    "Arena cover upload internal error",
    async () => {
      const auth = await requireUser();
      if ("response" in auth) return auth.response;

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

      let publicUrl: string;
      try {
        ({ publicUrl } = await uploadImageToStorage({ file, path: filePath }));
      } catch (uploadError) {
        console.error("Supabase Storage Upload Error (Arena):", uploadError);
        const message = uploadError instanceof Error ? uploadError.message : "Upload failed.";
        return NextResponse.json({ error: message }, { status: 500 });
      }

      return NextResponse.json({ success: true, url: publicUrl });
    },
    "An unexpected error occurred during upload."
  );
}
