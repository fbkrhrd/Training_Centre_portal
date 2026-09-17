import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { requireUser } from "@/features/auth/require-user";
import { getDictionary } from "@/i18n/dictionaries";
import { UserForm } from "@/features/users/user-form";
import {
  setUserActiveAction,
  updateUserRoleAction,
} from "@/features/users/actions";
import type { AppRole } from "@/features/auth/types";
import Link from "next/link";

const managers = ["system_admin", "education_manager"] as const;

export default async function UsersPage() {
  const actor = await requireUser(managers);
  const dictionary = getDictionary(actor.preferredLocale);
  const supabase = createAdminSupabaseClient();
  const [{ data: profiles }, { data: departments }, authResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("id,employee_no,full_name,company_email,employment_status,department_id")
      .order("employee_no"),
    supabase.from("departments").select("id,name").eq("is_active", true).order("name"),
    supabase.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ]);
  const roleByUserId = new Map(
    authResult.data.users.map((user) => [user.id, user.app_metadata.role as AppRole]),
  );
  const departmentById = new Map(
    (departments ?? []).map((department) => [department.id, department.name]),
  );

  return (
    <div className="users-page">
      <header className="page-heading">
        <p className="dashboard-intro__label">ADMINISTRATION</p>
        <h1>{dictionary.usersTitle}</h1>
        <p>{dictionary.usersDescription}</p>
        <Link className="button button--quiet inline-button" href="/admin/users/import">
          {dictionary.importUsers}
        </Link>
      </header>
      <section className="content-card">
        <h2>{dictionary.addUser}</h2>
        <UserForm
          departments={departments ?? []}
          actorRole={actor.role}
          dictionary={dictionary}
        />
      </section>
      <section className="content-card content-card--table">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>{dictionary.employeeNo}</th>
                <th>{dictionary.fullName}</th>
                <th>{dictionary.department}</th>
                <th>{dictionary.role}</th>
                <th>{dictionary.employmentStatus}</th>
                <th>{dictionary.companyEmail}</th>
                <th>{dictionary.actions}</th>
              </tr>
            </thead>
            <tbody>
              {(profiles ?? []).map((profile) => {
                const role = roleByUserId.get(profile.id) ?? "participant";
                const active = profile.employment_status === "active";
                return (
                  <tr key={profile.id}>
                    <td>{profile.employee_no}</td>
                    <td>{profile.full_name}</td>
                    <td>
                      {profile.department_id
                        ? (departmentById.get(profile.department_id) ?? "-")
                        : "-"}
                    </td>
                    <td>
                      {actor.role === "system_admin" ? (
                        <form action={updateUserRoleAction}>
                          <input type="hidden" name="userId" value={profile.id} />
                          <select name="role" defaultValue={role}>
                            <option value="participant">{dictionary.participant}</option>
                            <option value="education_manager">{dictionary.educationManager}</option>
                            <option value="system_admin">{dictionary.systemAdmin}</option>
                          </select>
                          <button className="button button--quiet" type="submit">
                            {dictionary.save}
                          </button>
                        </form>
                      ) : (
                        role
                      )}
                    </td>
                    <td>{active ? dictionary.active : dictionary.inactive}</td>
                    <td>{profile.company_email}</td>
                    <td>
                      <form action={setUserActiveAction}>
                        <input type="hidden" name="userId" value={profile.id} />
                        <input type="hidden" name="active" value={String(!active)} />
                        <button className="button button--quiet">
                          {active ? dictionary.deactivate : dictionary.reactivate}
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
              {!profiles?.length ? (
                <tr>
                  <td colSpan={7}>{dictionary.noUsers}</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
