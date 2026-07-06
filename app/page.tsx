import { getDefaultCompanies } from "@/lib/companies/service";
import { Nav } from "@/components/home/Nav";
import { Billboard } from "@/components/home/Billboard";
import { HeroSection } from "@/components/home/Hero/HeroSection";
import { StatsStrip } from "@/components/home/StatsStrip";
import { CtaSection } from "@/components/home/CtaSection";
import { Footer } from "@/components/home/Footer";
import { AuthModal } from "@/components/auth/AuthModal";
import { Suspense } from "react";

export default async function Home() {
  const initialCompanies = getDefaultCompanies();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative overflow-x-hidden">
      {/* Editorial Background Blueprint Grid */}
      <div className="absolute inset-0 opacity-[0.085] pointer-events-none z-0">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="landing-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#landing-grid)" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Nav />
        <Billboard />
        <HeroSection />
        <StatsStrip />
        <CtaSection />
        <Footer />
      </div>

      <Suspense fallback={null}>
        <AuthModal />
      </Suspense>
    </div>
  );
}
