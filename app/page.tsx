import { Billboard } from "@/components/home/Billboard";
import { HeroAndArenas } from "@/components/home/HeroAndArenas";
import { Footer } from "@/components/home/Footer";
import { AuthModal } from "@/components/auth/AuthModal";
import { Suspense } from "react";

// The homepage renders no per-request or per-user data server-side (Billboard,
// Hero, and Arenas content are all static marketing copy; auth/user state and
// the auth modal are resolved client-side via useAuthStore/useSearchParams).
// Safe to serve from the ISR cache instead of rendering on every request.
export const revalidate = 3600;

export default async function Home() {
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
        <Billboard />
        <HeroAndArenas />
        <Footer />
      </div>

      <Suspense fallback={null}>
        <AuthModal />
      </Suspense>
    </div>
  );
}
