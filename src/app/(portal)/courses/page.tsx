import { requireUser } from "@/features/auth/require-user";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { requireSupabaseData } from "@/lib/data-access";
import { formatKst } from "@/lib/kst-date-time";
import { applyForSessionAction } from "@/features/enrollments/actions";

const applicationNotice = {
  already_applied: "이미 신청한 차수입니다. 나의 신청 현황에서 확인해 주세요.",
  outside_application_period: "신청 기간이 종료되었거나 아직 시작되지 않았습니다.",
  unavailable: "현재 신청할 수 없는 차수입니다.",
} as const;

export default async function CoursesPage({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  await requireUser();
  const { notice } = await searchParams;
  const sessions = requireSupabaseData(
    await createAdminSupabaseClient().from("course_sessions").select("id,session_no,starts_at,ends_at,capacity,courses(title_ko,title_en,description_ko)").eq("status", "open").order("starts_at"),
    "교육과정 목록",
  ) ?? [];
  return <div className="content-panel content-panel--wide"><header className="page-heading"><p className="dashboard-intro__label">LEARNING</p><h1>교육과정</h1><p>모집 중인 차수를 확인하고 신청할 수 있습니다.</p>{notice && notice in applicationNotice ? <p className="form-message form-message--error" role="status">{applicationNotice[notice as keyof typeof applicationNotice]}</p> : null}</header><section className="content-card content-card--table"><div className="table-scroll"><table className="data-table"><thead><tr><th>교육과정</th><th>차수</th><th>일정</th><th>정원</th><th>신청</th></tr></thead><tbody>{sessions.map(s => { const course = s.courses as { title_ko?: string; description_ko?: string | null } | null; return <tr key={s.id}><td><strong className="course-name">{course?.title_ko}</strong><p className="course-description">{course?.description_ko ?? "설명이 등록되지 않았습니다"}</p></td><td>{s.session_no}</td><td>{formatKst(s.starts_at)}</td><td>{s.capacity}</td><td><form action={applyForSessionAction}><input type="hidden" name="sessionId" value={s.id}/><button className="button button--primary">신청</button></form></td></tr>; })}{!sessions.length && <tr><td colSpan={5}>모집 중인 차수가 없습니다.</td></tr>}</tbody></table></div></section></div>;
}
