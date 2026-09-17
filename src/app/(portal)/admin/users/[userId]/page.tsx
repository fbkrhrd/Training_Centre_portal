import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/features/auth/require-user";
import { isAppRole } from "@/features/auth/types";
import { EditUserForm } from "@/features/users/edit-user-form";
import { getDictionary } from "@/i18n/dictionaries";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

const managers = ["system_admin", "education_manager"] as const;

export default async function EditUserPage({ params }: { params: Promise<{ userId: string }> }) {
  const actor = await requireUser(managers);
  const { userId } = await params;
  const dictionary = getDictionary(actor.preferredLocale);
  const supabase = createAdminSupabaseClient();
  const [{ data: profile }, { data: departments }, authResult] = await Promise.all([
    supabase.from("profiles").select("id,employee_no,full_name,department_id,company_email,grade,job_title,mobile_phone,hired_on,preferred_locale").eq("id", userId).maybeSingle(),
    supabase.from("departments").select("id,name").eq("is_active", true).order("name"),
    supabase.auth.admin.getUserById(userId),
  ]);
  if (!profile || !authResult.data.user) notFound();
  const targetRole = authResult.data.user.app_metadata.role;
  if (!isAppRole(targetRole)) notFound();
  if (actor.role === "education_manager" && targetRole !== "participant") redirect("/admin/users");

  return <div className="content-panel content-panel--wide">
    <header className="page-heading">
      <p className="dashboard-intro__label">ADMINISTRATION</p>
      <h1>{dictionary.editUser}: {profile.full_name}</h1>
      <p>{dictionary.employeeNo}: {profile.employee_no}</p>
      <Link className="text-link" href="/admin/users">{dictionary.backToUsers}</Link>
    </header>
    <section className="content-card">
      <EditUserForm profile={{
        id: profile.id,
        fullName: profile.full_name,
        departmentId: profile.department_id,
        companyEmail: profile.company_email,
        grade: profile.grade,
        jobTitle: profile.job_title,
        mobilePhone: profile.mobile_phone,
        hiredOn: profile.hired_on,
        preferredLocale: profile.preferred_locale === "en" ? "en" : "ko",
      }} departments={departments ?? []} dictionary={dictionary} />
    </section>
  </div>;
}
