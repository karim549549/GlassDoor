import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/server/supabase/server";
import { createAdminClient } from "@/lib/server/supabase/admin";
import { prisma } from "@/lib/server/prisma";

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
    const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "File must be a JPEG, PNG, or WebP image." }, { status: 400 });
    }

    const maxSize = 5 * 1024 * 1024; // 5MB limit
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File size must be under 5MB." }, { status: 400 });
    }

    // Convert File to ArrayBuffer and Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 4. Upload to Supabase Storage via the service-role client. This bypasses
    // storage RLS, which is safe here because filePath is built from user.id
    // taken from the verified session above, never from client input.
    const fileExtension = "jpg"; // We compress to JPEG on client anyway
    const filePath = `${type}s/${user.id}.${fileExtension}`;
    const admin = createAdminClient();

    // Upload to 'DevsArena' bucket (overwrites existing because of upsert: true)
    const { data: uploadData, error: uploadError } = await admin.storage
      .from("DevsArena")
      .upload(filePath, buffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      console.error("Supabase Storage Upload Error:", uploadError);
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}. Make sure 'DevsArena' bucket exists.` },
        { status: 500 }
      );
    }

    // 5. Retrieve Public URL
    const { data: urlData } = admin.storage.from("DevsArena").getPublicUrl(filePath);
    const publicUrl = urlData.publicUrl;

    // Cache-busting URL parameter ensures client browsers don't serve old cached assets
    const finalUrl = `${publicUrl}?t=${Date.now()}`;

    // 6. Update user record in local Postgres database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        [type === "avatar" ? "avatarUrl" : "coverUrl"]: finalUrl,
      },
    });

    return NextResponse.json({ success: true, url: finalUrl });
  } catch (error: any) {
    console.error("Profile upload internal error:", error);
    return NextResponse.json({ error: "An unexpected error occurred during upload." }, { status: 500 });
  }
}
