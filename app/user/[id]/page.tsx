import { notFound } from "next/navigation";
import { getUserProfileById } from "@/lib/user/service";
import { toUserProfileDto } from "@/lib/user/dto";
import { getOptionalUser } from "@/lib/server/auth/require-user";
import { ProfileView } from "@/components/profile/ProfileView";

interface UserPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Calls the domain service directly rather than HTTP-fetching this app's own
 * /api/user/[id] route.
 *
 * The self-fetch it replaced built its target URL from the incoming `Host`
 * header and attached the caller's session cookie, so a request with a forged
 * Host made the server call out to that host carrying the victim's session.
 * It also cost an extra network hop and a second serverless invocation on
 * every render of this page.
 *
 * app/api/user/[id]/route.ts still exists and calls this exact same
 * getUserProfileById + toUserProfileDto pair - it remains the entry point for
 * client components and any future external consumer. The service stays the
 * single place the query lives, which is what keeps a future backend split
 * cheap; the HTTP hop was never what provided that.
 */
export default async function UserPage({ params }: UserPageProps) {
  const { id } = await params;

  const viewer = await getOptionalUser();
  const raw = await getUserProfileById(id, viewer?.id ?? null);

  if (!raw) {
    notFound();
  }

  const { isOwner, ...profileData } = toUserProfileDto(raw);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <ProfileView userProfile={profileData} isOwner={isOwner} />
    </main>
  );
}
