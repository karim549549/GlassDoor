import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Devs Arena — Developer Competition Platform & Hiring Credentials",
    template: "%s | Devs Arena",
  },
  description: "Rubric-based developer competitions, domain Glicko-2 ratings, and tamper-evident hiring credentials for engineering talent.",
};

import AuthProvider from "@/components/providers/AuthProvider";
import { cn } from "@/lib/utils";
import { Nav } from "@/components/home/Nav";
import { LayoutSpacer } from "@/components/providers/LayoutSpacer";
import { ToastProvider } from "@/components/providers/ToastProvider";

/**
 * Deliberately NOT async and deliberately does not read the session.
 *
 * Resolving the viewer here (via cookies()) was tried and measured: it opts the
 * entire route tree into dynamic rendering, and `/`, `/billboard`, and
 * `/arena/create` all lost static prerendering — the homepage's
 * `revalidate = 3600` became dead code. That trade is not worth it, and it is
 * not even coherent: a page cached for an hour is shared across users, so it
 * cannot embed per-user nav in the first place. Auth state is therefore
 * resolved client-side in AuthProvider, which is the correct layer for it here.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", "font-sans")}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <ToastProvider>
            <Nav />
            <LayoutSpacer>{children}</LayoutSpacer>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
