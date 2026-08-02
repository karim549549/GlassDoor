import "server-only";
import { cache } from "react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Wrapped in React's cache() so multiple calls within the same request (e.g.
 * a route handler calling requireUser() while also needing the client for a
 * storage upload) share one client instead of each constructing its own -
 * cache() de-dupes by the current request/render, not across requests, which
 * is what's needed here since this client is bound to that request's cookies.
 */
export const createClient = cache(async () => {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set. Configure them in your environment before starting the app."
    );
  }

  return createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Expected in a Server Component (no response object to write
            // cookies to) - middleware handles the actual token refresh.
            // Fires on effectively every RSC render, so deliberately not
            // logged per the logging policy in lib/server/logger.ts.
          }
        },
      },
    }
  );
});
