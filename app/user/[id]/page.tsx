import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getUserProfileById } from "@/lib/user/service";
import { toUserProfileDto } from "@/lib/user/dto";
import { getOptionalUser } from "@/lib/server/auth/require-user";
import { ProfileView } from "@/components/profile/ProfileView";

/**
 * Shared by generateMetadata and the page body so the profile is fetched once
 * per request rather than twice. `cache()` is per-request, not persistent.
 */
const loadProfile = cache((id: string, viewerId: string | null) =>
  getUserProfileById(id, viewerId)
);

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
export async function generateMetadata({ params }: UserPageProps): Promise<Metadata> {
  const { id } = await params;
  const raw = await loadProfile(id, null);

  if (!raw) {
    return { title: "Profile Not Found", robots: { index: false, follow: false } };
  }

  const name = raw.fullName || (raw.handle ? `@${raw.handle}` : "Developer");

  return {
    title: name,
    description:
      raw.bio?.slice(0, 155) ||
      `${name} competes in team coding challenges on Devs Arena.`,
    alternates: { canonical: `/user/${id}` },
  };
}

export default async function UserPage({ params }: UserPageProps) {
  const { id } = await params;

  const viewer = await getOptionalUser();
  const raw = await loadProfile(id, viewer?.id ?? null);

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
