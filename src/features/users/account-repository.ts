import "server-only";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { AccountDependencies } from "./account-service";

export function createAccountDependencies(): AccountDependencies {
  const supabase = createAdminSupabaseClient();

  return {
    async createAuthUser({ email, password, role }) {
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        app_metadata: { role },
      });
      if (error || !data.user) throw error ?? new Error("계정을 생성하지 못했습니다.");
      return data.user.id;
    },
    async deleteAuthUser(userId) {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;
    },
    async insertProfile(userId, input) {
      const { error } = await supabase.from("profiles").insert({
        id: userId,
        employee_no: input.employeeNo,
        full_name: input.fullName,
        department_id: input.departmentId,
        company_email: input.companyEmail,
        employment_status: input.employmentStatus,
        grade: input.grade,
        job_title: input.jobTitle,
        mobile_phone: input.mobilePhone,
        hired_on: input.hiredOn,
        preferred_locale: input.preferredLocale,
      });
      if (error) throw error;
    },
    async updateProfileStatus(userId, employmentStatus) {
      const { error } = await supabase
        .from("profiles")
        .update({ employment_status: employmentStatus })
        .eq("id", userId);
      if (error) throw error;
    },
    async updateAuthUser(userId, change) {
      const attributes =
        "role" in change
          ? { app_metadata: { role: change.role } }
          : { ban_duration: change.banDuration };
      const { error } = await supabase.auth.admin.updateUserById(
        userId,
        attributes,
      );
      if (error) throw error;
    },
    async updateProfile(userId, input) {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: input.fullName,
          department_id: input.departmentId ?? null,
          company_email: input.companyEmail,
          grade: input.grade ?? null,
          job_title: input.jobTitle ?? null,
          mobile_phone: input.mobilePhone ?? null,
          hired_on: input.hiredOn ?? null,
          preferred_locale: input.preferredLocale,
        })
        .eq("id", userId);
      if (error) throw error;
    },
  };
}
