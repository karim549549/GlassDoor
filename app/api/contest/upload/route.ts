import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/server/supabase/server";
import { validateImageUpload, uploadImageToStorage } from "@/lib/server/upload";

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
    const validation = validateImageUpload(file);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // 4. Upload to Supabase Storage via the service-role admin client.
    // Generate a random UUID for the cover image to prevent collisions.
    const randomId = crypto.randomUUID();
    const filePath = `contests/covers/${randomId}.jpg`; // We compress to JPEG on upload/save

    let publicUrl: string;
    try {
      ({ publicUrl } = await uploadImageToStorage({ file, path: filePath }));
    } catch (uploadError) {
      console.error("Supabase Storage Upload Error (Contest):", uploadError);
      const message = uploadError instanceof Error ? uploadError.message : "Upload failed.";
      return NextResponse.json({ error: message }, { status: 500 });
    }

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error("Contest cover upload internal error:", error);
    return NextResponse.json({ error: "An unexpected error occurred during upload." }, { status: 500 });
  }
}
