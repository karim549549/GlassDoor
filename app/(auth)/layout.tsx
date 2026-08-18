import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";

/**
 * Shell for the three auth routes.
 *
 * These used to be rewrites onto "/" in next.config.ts, with AuthModal reading
 * the pathname to choose a form. That meant signing in downloaded the entire
 * homepage - GSAP, the three.js fox, the arena board and its three database
 * queries - to render an email field, and none of the three routes could carry
 * a title or a canonical of its own, because the document served was always
 * the homepage's.
 *
 * A route group, so the URLs stay /login, /signup and /forgot-password.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main
      id="main-content"
      className="flex min-h-[80vh] w-full items-center justify-center bg-background px-4 py-16 md:px-6"
    >
      <div className="grid w-full max-w-4xl grid-cols-1 border-2 border-foreground bg-[#F1EFE9] shadow-[8px_8px_0px_0px_var(--foreground)] lg:grid-cols-2">
        <AuthBrandPanel />
        <div className="col-span-1 flex min-h-[500px] flex-col justify-center p-8 md:p-12">
          {children}
        </div>
      </div>
    </main>
  );
}
