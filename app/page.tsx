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
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Nav />
      <Billboard />
      <HeroSection initialCompanies={initialCompanies} />
      <StatsStrip />
      <CtaSection />
      <Footer />
      <Suspense fallback={null}>
        <AuthModal />
      </Suspense>
    </div>
  );
}
