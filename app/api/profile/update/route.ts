import { NextResponse } from "next/server";
import { profileSchema } from "@/lib/profile/schema";
import { updateUserProfile } from "@/lib/profile/service";
import { requireUser } from "@/lib/server/auth/require-user";
import { withApiErrorHandling } from "@/lib/server/api-route";

export async function POST(req: Request) {
  return withApiErrorHandling("Profile update failed", async () => {
    const auth = await requireUser();
    if ("response" in auth) return auth.response;
    const { user } = auth;

    const rawBody = await req.json();
    const parsed = profileSchema.safeParse(rawBody);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstIssue ? `${firstIssue.path.join(".")}: ${firstIssue.message}` : "Invalid request body." },
        { status: 400 }
      );
    }

    const result = await updateUserProfile(user.id, parsed.data);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, user: result.user });
  }, "Profile update failed.", req);
}
