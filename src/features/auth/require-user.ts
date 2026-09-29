import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { resolveCurrentUser } from "./current-user";
import type { AppRole } from "./types";

const loadCurrentUser = cache(async () => {
  const supabase = await createServerSupabaseClient();

  const user = await resolveCurrentUser({
    async getClaims() {
      const { data, error } = await supabase.auth.getClaims();
      const claims = data?.claims;
      if (error || !claims || typeof claims.sub !== "string") return null;
      return {
        sub: claims.sub,
        app_metadata: typeof claims.app_metadata === "object" && claims.app_metadata !== null
          ? claims.app_metadata
          : {},
      };
    },
    async getProfile(userId) {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "employee_no,full_name,preferred_locale,employment_status",
        )
        .eq("id", userId)
        .maybeSingle();
      return error ? null : data;
    },
  });

  if (!user) await supabase.auth.signOut();
  return user;
});

export async function requireUser(allowedRoles?: readonly AppRole[]) {
  const user = await loadCurrentUser();

  if (!user) redirect("/login");
  if (allowedRoles && !allowedRoles.includes(user.role)) redirect("/");

  return user;
}
