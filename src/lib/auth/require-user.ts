import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAppRole, type AppRole } from "./roles";

type Options = {
  /** Allowed roles. Omit to allow any signed-in user with MFA. */
  roles?: AppRole[];
};

/**
 * Call at the top of EVERY server action, route handler and protected page.
 * Checks: signed in → MFA completed (aal2) → active profile → allowed role.
 * Row-level security in the database is still the final check.
 */
export async function requireUser({ roles }: Options = {}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal?.currentLevel !== "aal2") {
    redirect(aal?.nextLevel === "aal2" ? "/mfa/verify" : "/mfa/setup");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, office, division_id, active")
    .eq("user_id", user.id)
    .single();

  if (!profile || !profile.active || !isAppRole(profile.role)) {
    redirect("/login?error=no-access");
  }

  if (roles && !roles.includes(profile.role)) {
    throw new Error("You do not have permission to do this.");
  }

  return { supabase, user, profile: { ...profile, role: profile.role as AppRole } };
}
