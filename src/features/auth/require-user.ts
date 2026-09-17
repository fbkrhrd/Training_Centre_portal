import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { resolveCurrentUser } from "./current-user";
import type { AppRole } from "./types";

const loadCurrentUser = cache(async () => {
  const supabase = await createServerSupabaseClient();

  const user = await resolveCurrentUser({
    async getUser() {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) return null;
      return {
        id: data.user.id,
        appMetadata: data.user.app_metadata,
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
