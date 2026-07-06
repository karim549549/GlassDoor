import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/server/supabase/server";
import { syncUser } from "@/lib/server/auth/auth-service";
import { prisma } from "@/lib/server/prisma";

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, roleName = "USER" } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    // Check if user already exists in public DB first
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email address is already registered." }, { status: 400 });
    }

    const supabase = await createClient();
    const origin = new URL(request.url).origin;

    // 1. Sign up user via Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/api/auth/callback`,
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const user = data.user;
    if (!user) {
      return NextResponse.json({ error: "Failed to create user account." }, { status: 400 });
    }

    // 2. Synchronize user and role to Prisma public DB
    await syncUser({
      id: user.id,
      email: user.email || email,
      fullName,
      roleName,
      emailVerified: false,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
