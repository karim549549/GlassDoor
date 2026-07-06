import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/app/api/lib/supabase/server";
import { prisma } from "@/app/api/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 1. Authenticate user
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

    // 3. Validate file
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image." }, { status: 400 });
    }

    const maxSize = 5 * 1024 * 1024; // 5MB limit
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File size must be under 5MB." }, { status: 400 });
    }

    // Convert File to ArrayBuffer and Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 4. Upload to Supabase Storage
    const fileExtension = "jpg"; // We compress to JPEG on client anyway
    const filePath = `${type}s/${user.id}.${fileExtension}`;

    // Upload to 'profiles' bucket (overwrites existing because of upsert: true)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("profiles")
      .upload(filePath, buffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      console.error("Supabase Storage Upload Error:", uploadError);
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}. Make sure 'profiles' bucket exists.` },
        { status: 500 }
      );
    }

    // 5. Retrieve Public URL
    const { data: urlData } = supabase.storage.from("profiles").getPublicUrl(filePath);
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
