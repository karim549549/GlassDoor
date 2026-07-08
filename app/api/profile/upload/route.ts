import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/server/supabase/server";
import { prisma } from "@/lib/server/prisma";
import { validateImageUpload, uploadImageToStorage } from "@/lib/server/upload";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 1. Authenticate user against their own session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    // 2. Parse request formData
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null; // "avatar" or "cover"

    if (!file || !type) {
      return NextResponse.json({ error: "Missing file or upload type." }, { status: 400 });
    }

    if (type !== "avatar" && type !== "cover") {
      return NextResponse.json({ error: "Invalid upload type." }, { status: 400 });
    }

    // 3. Validate file - matches the "DevsArena" bucket's own size/MIME restrictions,
    // enforced here too since a request can bypass the client-side check entirely.
    const validation = validateImageUpload(file);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // 4. Upload to Supabase Storage via the service-role client. This bypasses
    // storage RLS, which is safe here because filePath is built from user.id
    // taken from the verified session above, never from client input.
    const filePath = `${type}s/${user.id}.jpg`; // We compress to JPEG on client anyway

    let publicUrl: string;
    try {
      ({ publicUrl } = await uploadImageToStorage({ file, path: filePath }));
    } catch (uploadError) {
      console.error("Supabase Storage Upload Error:", uploadError);
      const message = uploadError instanceof Error ? uploadError.message : "Upload failed.";
      return NextResponse.json({ error: message }, { status: 500 });
    }

    // Cache-busting URL parameter ensures client browsers don't serve old cached assets
    const finalUrl = `${publicUrl}?t=${Date.now()}`;

    // 5. Update user record in local Postgres database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        [type === "avatar" ? "avatarUrl" : "coverUrl"]: finalUrl,
      },
    });

    return NextResponse.json({ success: true, url: finalUrl });
  } catch (error) {
    console.error("Profile upload internal error:", error);
    return NextResponse.json({ error: "An unexpected error occurred during upload." }, { status: 500 });
  }
}
