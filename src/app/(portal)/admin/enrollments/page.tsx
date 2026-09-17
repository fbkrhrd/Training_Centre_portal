import { requireUser } from "@/features/auth/require-user";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { decideEnrollmentAction } from "@/features/enrollments/actions";

const managers = ["system_admin", "education_manager"] as const;

export default async function EnrollmentsPage() {
  const user = await requireUser(managers);
  const supabase = createAdminSupabaseClient();
  let sessionIds: string[] | undefined;
  if (user.role === "education_manager") {
    const { data: assignments } = await supabase.from("course_managers").select("course_id").eq("manager_id", user.id);
    const { data: sessions } = await supabase.from("course_sessions").select("id").in("course_id", (assignments ?? []).map(a => a.course_id));
    sessionIds = (sessions ?? []).map(s => s.id);
  }
  let query = supabase.from("enrollments").select("id,status,requested_at,profiles(full_name,employee_no),course_sessions(session_no,courses(title_ko))").order("requested_at", { ascending: false });
  if (sessionIds) query = query.in("session_id", sessionIds);
  const { data: enrollments } = await query;
  return <div className="content-panel content-panel--wide"><header className="page-heading"><p className="dashboard-intro__label">TRAINING MANAGEMENT</p><h1>신청 승인 관리</h1><p>직접 신청을 승인·반려하고 대기자를 수동 승급합니다.</p></header><section className="content-card content-card--table"><div className="table-scroll"><table className="data-table"><thead><tr><th>과정</th><th>차수</th><th>신청자</th><th>상태</th><th>작업</th></tr></thead><tbody>{enrollments?.map(e => { const s=e.course_sessions as {session_no?:number;courses?:{title_ko?:string}}|null; const p=e.profiles as {full_name?:string;employee_no?:string}|null; const actionable=e.status==='pending'||e.status==='waiting'; return <tr key={e.id}><td>{s?.courses?.title_ko}</td><td>{s?.session_no}</td><td>{p?.full_name} ({p?.employee_no})</td><td>{e.status}</td><td>{actionable ? <div className="button-row"><form action={decideEnrollmentAction}><input type="hidden" name="enrollmentId" value={e.id}/><input type="hidden" name="target" value="approved"/><button className="button button--primary">승인</button></form><form action={decideEnrollmentAction}><input type="hidden" name="enrollmentId" value={e.id}/><input type="hidden" name="target" value="rejected"/><button className="button button--quiet">반려</button></form></div> : "-"}</td></tr>; })}{!enrollments?.length && <tr><td colSpan={5}>처리할 신청이 없습니다.</td></tr>}</tbody></table></div></section></div>;
}
