import "server-only";
import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";

// Service-role client: bypasses Row Level Security. Only use for operations
// where the resource path/ownership has already been verified server-side
// against an authenticated session (e.g. profile uploads keyed by the
// caller's own user.id) - never expose this client or its key to the browser.
//
// Unlike the per-request SSR client in server.ts, this one carries no
// request-scoped state (no cookies, no session) - it's built entirely from
// static env vars, so one instance for the whole process lifetime is safe
// and avoids re-constructing it on every call.
let adminClient: SupabaseClient | null = null;

export function createAdminClient(): SupabaseClient {
  if (adminClient) {
    return adminClient;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set to use the Supabase admin client."
    );
  }

  adminClient = createSupabaseClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  return adminClient;
}
