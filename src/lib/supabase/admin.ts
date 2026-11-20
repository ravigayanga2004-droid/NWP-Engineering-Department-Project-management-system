import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client with the SECRET key. Bypasses row-level security.
 * Server only (user invites, admin tasks). Never import from a client component.
 */
export const createAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
