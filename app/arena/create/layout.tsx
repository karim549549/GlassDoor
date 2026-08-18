import type { Metadata } from "next";

/**
 * page.tsx is a client component, which cannot export metadata - hence this
 * layout. Without it the create form inherited the root layout's canonical
 * and told Google it was a duplicate of the homepage.
 *
 * It is a logged-in form behind an auth gate, so the right answer is noindex
 * rather than a canonical of its own.
 */
export const metadata: Metadata = {
  title: "Write a Brief",
  robots: { index: false, follow: false },
};

export default function CreateArenaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
