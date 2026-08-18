import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getUserProfileByHandle } from "@/lib/user/service";
import { toUserProfileDto } from "@/lib/user/dto";
import { getOptionalUser } from "@/lib/server/auth/require-user";
import { ProfileView } from "@/components/profile/ProfileView";
import { handleSchema } from "@/lib/user/handle";

interface HandlePageProps {
  params: Promise<{ handle: string }>;
}

/**
 * The public profile, addressed by name.
 *
 * /user/<uuid> still resolves and redirects here, so nothing that was ever
 * linked breaks - but this is the canonical form. A uuid in a URL someone is
 * meant to put on a CV is unmemorable, unshareable and leaks an internal
 * identifier for no benefit.
 *
 * Validated through handleSchema before it reaches the database rather than
 * passed straight to Prisma: the segment is caller-controlled, and the rules
 * that decide what a handle may be belong in one place.
 */
const loadProfile = cache((handle: string, viewerId: string | null) =>
  getUserProfileByHandle(handle, viewerId)
);

function parseHandle(raw: string): string | null {
  const parsed = handleSchema.safeParse(decodeURIComponent(raw));
  return parsed.success ? parsed.data : null;
}

export async function generateMetadata({ params }: HandlePageProps): Promise<Metadata> {
  const handle = parseHandle((await params).handle);
  if (!handle) {
    return { title: "Profile Not Found", robots: { index: false, follow: false } };
  }

  const raw = await loadProfile(handle, null);
  if (!raw) {
    return { title: "Profile Not Found", robots: { index: false, follow: false } };
  }

  const name = raw.fullName || `@${handle}`;

  return {
    title: `${name} (@${handle})`,
    description:
      raw.bio?.slice(0, 155) ||
      `${name} competes in team coding challenges on Devs Arena.`,
    alternates: { canonical: `/u/${handle}` },
  };
}

export default async function HandleProfilePage({ params }: HandlePageProps) {
  const handle = parseHandle((await params).handle);
  if (!handle) {
    notFound();
  }

  const viewer = await getOptionalUser();
  const raw = await loadProfile(handle, viewer?.id ?? null);

  if (!raw) {
    notFound();
  }

  const { isOwner, ...profileData } = toUserProfileDto(raw);

  return (
    <main id="main-content" className="min-h-screen bg-background text-foreground">
      <ProfileView userProfile={profileData} isOwner={isOwner} />
    </main>
  );
}
