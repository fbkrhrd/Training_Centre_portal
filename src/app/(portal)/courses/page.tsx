import { requireUser } from "@/features/auth/require-user";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { applyForSessionAction } from "@/features/enrollments/actions";

export default async function CoursesPage() {
  await requireUser();
  const { data: sessions } = await createAdminSupabaseClient().from("course_sessions").select("id,session_no,starts_at,ends_at,capacity,courses(title_ko,title_en)").eq("status", "open").order("starts_at");
  return <div className="content-panel content-panel--wide"><header className="page-heading"><p className="dashboard-intro__label">LEARNING</p><h1>교육과정</h1><p>모집 중인 차수를 확인하고 신청할 수 있습니다.</p></header><section className="content-card content-card--table"><div className="table-scroll"><table className="data-table"><thead><tr><th>교육과정</th><th>차수</th><th>일정</th><th>정원</th><th>신청</th></tr></thead><tbody>{sessions?.map(s => <tr key={s.id}><td>{(s.courses as {title_ko?:string}|null)?.title_ko}</td><td>{s.session_no}</td><td>{new Date(s.starts_at).toLocaleString("ko-KR")}</td><td>{s.capacity}</td><td><form action={applyForSessionAction}><input type="hidden" name="sessionId" value={s.id}/><button className="button button--primary">신청</button></form></td></tr>)}{!sessions?.length && <tr><td colSpan={5}>모집 중인 차수가 없습니다.</td></tr>}</tbody></table></div></section></div>;
}
