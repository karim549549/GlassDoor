import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/server/supabase/server";
import { createAdminClient } from "@/lib/server/supabase/admin";
import { ACCEPTED_IMAGE_TYPES, MAX_UPLOAD_SIZE_BYTES } from "@/lib/upload-constants";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 1. Authenticate user against their session
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

    if (!file) {
      return NextResponse.json({ error: "Missing cover image file." }, { status: 400 });
    }

    // 3. Validate file
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
      return NextResponse.json({ error: "File must be a JPEG, PNG, or WebP image." }, { status: 400 });
    }

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      return NextResponse.json({ error: "File size must be under 5MB." }, { status: 400 });
    }

    // Convert File to ArrayBuffer and Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 4. Upload to Supabase Storage via the service-role admin client
    // Generate a random UUID for the cover image to prevent collisions
    const randomId = crypto.randomUUID();
    const fileExtension = "jpg"; // We compress to JPEG on upload/save
    const filePath = `contests/covers/${randomId}.${fileExtension}`;
    const admin = createAdminClient();

    // Upload to 'DevsArena' bucket
    const { data: uploadData, error: uploadError } = await admin.storage
      .from("DevsArena")
      .upload(filePath, buffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      console.error("Supabase Storage Upload Error (Contest):", uploadError);
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}. Make sure 'DevsArena' bucket exists.` },
        { status: 500 }
      );
    }

    // 5. Retrieve Public URL
    const { data: urlData } = admin.storage.from("DevsArena").getPublicUrl(filePath);
    const publicUrl = urlData.publicUrl;

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error: any) {
    console.error("Contest cover upload internal error:", error);
    return NextResponse.json({ error: "An unexpected error occurred during upload." }, { status: 500 });
  }
}
