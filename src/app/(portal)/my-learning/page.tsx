import { requireUser } from "@/features/auth/require-user";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { cancelEnrollmentAction } from "@/features/enrollments/actions";

export default async function MyLearningPage() {
  const user = await requireUser();
  const { data: enrollments } = await createAdminSupabaseClient().from("enrollments").select("id,status,course_sessions(session_no,starts_at,cancellation_closes_at,courses(title_ko))").eq("participant_id", user.id).order("requested_at", { ascending: false });
  return <div className="content-panel content-panel--wide"><header className="page-heading"><p className="dashboard-intro__label">MY LEARNING</p><h1>나의 신청 현황</h1></header><section className="content-card content-card--table"><div className="table-scroll"><table className="data-table"><thead><tr><th>교육과정</th><th>차수</th><th>상태</th><th>작업</th></tr></thead><tbody>{enrollments?.map(e => { const session=e.course_sessions as {session_no?:number;cancellation_closes_at?:string;courses?:{title_ko?:string}}|null; const canCancel=e.status!=="cancelled" && session?.cancellation_closes_at && new Date(session.cancellation_closes_at)>=new Date(); return <tr key={e.id}><td>{session?.courses?.title_ko}</td><td>{session?.session_no}</td><td>{e.status}</td><td>{canCancel?<form action={cancelEnrollmentAction}><input type="hidden" name="enrollmentId" value={e.id}/><button className="button button--quiet">신청 취소</button></form>:"-"}</td></tr>; })}{!enrollments?.length && <tr><td colSpan={4}>신청 이력이 없습니다.</td></tr>}</tbody></table></div></section></div>;
}
