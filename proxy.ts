import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { logger } from "@/lib/server/logger";

const PROTECTED_PREFIXES = ["/admin", "/profile", "/user", "/arena/create"];

function isProtected(pathname: string) {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("redirectTo", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Fail closed: without Supabase configured we cannot establish identity,
    // so a protected route must not be served.
    return isProtected(request.nextUrl.pathname) ? redirectToLogin(request) : supabaseResponse;
  }

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            supabaseResponse = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Optimistic auth check (cookie-based only, no DB call - see Next.js Proxy docs).
    // Real per-resource authorization still happens close to the data (page/route level).
    if (isProtected(request.nextUrl.pathname) && !user) return redirectToLogin(request);
  } catch (err) {
    logger.error("Proxy auth check failed", {
      error: err instanceof Error ? err.message : String(err),
      pathname: request.nextUrl.pathname,
    });
    // Fail closed - a Supabase outage must not silently disable the
    // optimistic auth layer for protected routes.
    if (isProtected(request.nextUrl.pathname)) return redirectToLogin(request);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
