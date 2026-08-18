import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";

/**
 * Self-hosted at build time, replacing a render-blocking third-party
 * `@import url(fonts.googleapis.com)` that used to sit on line 1 of
 * globals.css. See the comment there for why that shape was expensive.
 *
 * `display: "swap"` renders text immediately in the fallback rather than
 * holding a blank frame, and the `adjustFontFallback` default scales that
 * fallback's metrics to match, so the swap does not shift layout - the
 * difference between a fast LCP and a fast LCP that costs a CLS penalty.
 */
const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-instrument-serif",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

const SITE_URL = getSiteUrl();

const TITLE = "Devs Arena — Team Hackathons & Coding Challenges in Egypt";
const DESCRIPTION =
  "Pick a strange brief, grab a team, and build it against the clock — online or in person in Cairo. Free to enter, real prize money, and a human judge who tells you exactly what they thought of your code.";

/**
 * `metadataBase` has to come first: without it every relative URL below - the
 * canonical, the OG image - resolves against nothing and Next drops it. Its
 * absence is why this site previously shared as a bare link with no card, on
 * LinkedIn in particular, which is the channel the recruiter side depends on.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s | Devs Arena",
  },
  description: DESCRIPTION,
  applicationName: "Devs Arena",
  // No `alternates` here on purpose. Metadata is INHERITED: a canonical set
  // on the root layout is adopted by every page that does not override it, so
  // `/arena`, `/billboard`, `/support`, `/terms` and `/privacy` all declared
  // themselves duplicates of the homepage and asked Google to drop them.
  // Each route now sets its own; the homepage's lives in app/page.tsx.
  // Google has ignored this tag since 2009. It is here because several AI
  // crawlers and non-Google engines still read it, and it costs one line - not
  // because it moves search rank. The keyword work that matters is in the
  // headings, the visible copy and the JSON-LD.
  //
  // These target the people who actually arrive: developers looking for
  // something to enter. They were previously employer-intent terms ("technical
  // hiring without interviews", "proof of work hiring") which chased the side
  // of the market that is not yet for sale - see PRD 1.2 and 1.4.
  keywords: [
    "hackathon Egypt",
    "hackathon Cairo",
    "coding challenge Egypt",
    "team coding competition",
    "online hackathon",
    "same day hackathon",
    "web dev challenge",
    "programming competition Egypt",
    "developer community Egypt",
    "build challenge for developers",
    "coding contest Cairo",
    "team hackathon MENA",
  ],
  openGraph: {
    type: "website",
    siteName: "Devs Arena",
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  category: "technology",
};

import AuthProvider from "@/components/providers/AuthProvider";
import { cn } from "@/lib/utils";
import { getSiteUrl } from "@/lib/site-url";
import { Nav } from "@/components/home/Nav";
import { Footer } from "@/components/home/Footer";
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
      className={cn(
        "h-full",
        "antialiased",
        "font-sans",
        dmSans.variable,
        instrumentSerif.variable,
        jetbrainsMono.variable
      )}
    >
      <body className="min-h-full flex flex-col">
        {/* First thing in the tab order: a keyboard user landing here would
            otherwise have to walk the entire nav on every page to reach the
            content. Visually hidden until focused. */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-foreground focus:px-4 focus:py-2 focus:font-mono focus:text-[0.7rem] focus:uppercase focus:tracking-[0.18em] focus:text-background focus:outline-2 focus:outline-offset-2 focus:outline-orange"
        >
          Skip to content
        </a>
        {/* Scroll-revealed content starts hidden and is unhidden by an
            IntersectionObserver. Without JS that observer never runs, so this
            restores it - the markup is already in the HTML either way. */}
        <noscript>
          <style>{`.reveal{opacity:1 !important;transform:none !important}`}</style>
        </noscript>
        <AuthProvider>
          <ToastProvider>
            <Nav />
            <LayoutSpacer>{children}</LayoutSpacer>
            {/* One mount, here, rather than ten pages each remembering to add
                it. That arrangement had already failed: every static page -
                about, support, terms, privacy - rendered with no footer at all,
                so a reader reaching the end of the legal pages had nowhere to
                go and none of the footer's links were reachable from them. */}
            <Footer />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
