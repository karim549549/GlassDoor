import type { Metadata } from "next";
import { Instrument_Serif, DM_Sans, JetBrains_Mono, Geist } from "next/font/google";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Devs Arena — Egypt tech salary transparency",
  description: "Real salaries. Real reviews. Every Egyptian tech company, indexed.",
};

import AuthProvider from "@/components/providers/AuthProvider";
import { cn } from "@/lib/utils";
import { Nav } from "@/components/home/Nav";
import { LayoutSpacer } from "@/components/providers/LayoutSpacer";
import { ToastProvider } from "@/components/providers/ToastProvider";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", instrumentSerif.variable, dmSans.variable, jetbrainsMono.variable, "font-sans", geist.variable)}
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

