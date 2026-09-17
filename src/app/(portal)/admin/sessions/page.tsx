import { requireUser } from "@/features/auth/require-user";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createSessionAction } from "@/features/training/actions";

const managers = ["system_admin", "education_manager"] as const;

export default async function SessionsPage() {
  await requireUser(managers);
  const supabase = createAdminSupabaseClient();
  const { data: courses } = await supabase.from("courses").select("id,title_ko").order("title_ko");
  const { data: sessions } = await supabase.from("course_sessions").select("id,session_no,status,starts_at,capacity,courses(title_ko)").order("starts_at", { ascending: false });
  return <div className="content-panel content-panel--wide"><header className="page-heading"><p className="dashboard-intro__label">TRAINING MANAGEMENT</p><h1>차수 관리</h1><p>교육 일정, 정원, 신청·취소 기간을 등록합니다.</p></header>
    <section className="content-card"><h2>차수 등록</h2><form className="user-form" action={createSessionAction}>
      <label><span>교육과정</span><select name="courseId" required defaultValue=""><option value="" disabled>선택</option>{courses?.map(c => <option key={c.id} value={c.id}>{c.title_ko}</option>)}</select></label>
      <label><span>차수</span><input name="sessionNo" type="number" min="1" required /></label><label><span>운영 방식</span><select name="deliveryMode"><option value="in_person">대면</option><option value="online">온라인</option><option value="blended">혼합</option></select></label>
      <label><span>장소</span><input name="location" /></label><label><span>온라인 링크</span><input name="onlineUrl" type="url" /></label><label><span>정원</span><input name="capacity" type="number" min="1" required /></label>
      <label><span>시작 일시</span><input name="startsAt" type="datetime-local" required /></label><label><span>종료 일시</span><input name="endsAt" type="datetime-local" required /></label><label><span>신청 시작</span><input name="applicationOpensAt" type="datetime-local" required /></label>
      <label><span>신청 마감</span><input name="applicationClosesAt" type="datetime-local" required /></label><label><span>취소 마감</span><input name="cancellationClosesAt" type="datetime-local" required /></label><button className="button button--primary user-form__submit">차수 생성</button>
    </form></section>
    <section className="content-card content-card--table"><h2>차수 목록</h2><div className="table-scroll"><table className="data-table"><thead><tr><th>과정</th><th>차수</th><th>시작</th><th>정원</th><th>상태</th></tr></thead><tbody>{sessions?.map(s => <tr key={s.id}><td>{(s.courses as {title_ko?:string}|null)?.title_ko}</td><td>{s.session_no}</td><td>{new Date(s.starts_at).toLocaleString("ko-KR")}</td><td>{s.capacity}</td><td>{s.status}</td></tr>)}{!sessions?.length && <tr><td colSpan={5}>등록된 차수가 없습니다.</td></tr>}</tbody></table></div></section>
  </div>;
}
