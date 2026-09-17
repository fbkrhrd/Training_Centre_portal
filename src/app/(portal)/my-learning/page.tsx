import { requireUser } from "@/features/auth/require-user";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export default async function MyLearningPage() {
  const user = await requireUser();
  const { data: enrollments } = await createAdminSupabaseClient().from("enrollments").select("id,status,course_sessions(session_no,starts_at,courses(title_ko))").eq("participant_id", user.id).order("requested_at", { ascending: false });
  return <div className="content-panel content-panel--wide"><header className="page-heading"><p className="dashboard-intro__label">MY LEARNING</p><h1>나의 신청 현황</h1></header><section className="content-card content-card--table"><div className="table-scroll"><table className="data-table"><thead><tr><th>교육과정</th><th>차수</th><th>상태</th></tr></thead><tbody>{enrollments?.map(e => { const session=e.course_sessions as {session_no?:number;courses?:{title_ko?:string}}|null; return <tr key={e.id}><td>{session?.courses?.title_ko}</td><td>{session?.session_no}</td><td>{e.status}</td></tr>; })}{!enrollments?.length && <tr><td colSpan={3}>신청 이력이 없습니다.</td></tr>}</tbody></table></div></section></div>;
}
