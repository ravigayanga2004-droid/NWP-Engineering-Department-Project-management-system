import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for client components.
 * Use it for the session (sign-in, MFA) only; read and write data on the server.
 */
export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
