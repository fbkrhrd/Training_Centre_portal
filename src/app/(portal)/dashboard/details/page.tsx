import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/features/auth/require-user";
import { getDashboardDetail, isDashboardMetric, type DashboardMetric } from "@/features/dashboard/dashboard-service";
import { loadDashboardSource } from "@/features/dashboard/dashboard-repository";
import { formatKst } from "@/lib/kst-date-time";

const titleByMetric: Record<DashboardMetric, string> = {
  upcoming: "예정된 교육",
  completed: "완료 차수",
  pending: "승인 대기",
};

export default async function DashboardDetailsPage({ searchParams }: { searchParams: Promise<{ metric?: string }> }) {
  const user = await requireUser();
  const { metric: rawMetric } = await searchParams;
  if (!rawMetric || !isDashboardMetric(rawMetric)) notFound();

  const source = await loadDashboardSource({ id: user.id, role: user.role });
  const detail = getDashboardDetail(source, { id: user.id, role: user.role }, rawMetric, new Date());
  const sessionsById = new Map(source.sessions.map((session) => [session.id, session]));
  const hasData = detail.sessions.length > 0 || detail.enrollments.length > 0;

  return <div className="content-panel content-panel--wide">
    <header className="page-heading">
      <p className="dashboard-intro__label">LEARNING CENTRE</p>
      <h1>{titleByMetric[rawMetric]}</h1>
      <p>대시보드 집계에 포함된 상세 항목입니다.</p>
      <Link className="text-link" href="/">홈 대시보드로 돌아가기</Link>
    </header>
    <section className="content-card content-card--table">
      {!hasData && <p>표기할 내용이 없습니다</p>}
      {detail.sessions.length > 0 && <div className="table-scroll"><table className="data-table">
        <thead><tr><th>교육과정</th><th>차수</th><th>일정</th><th>상태</th></tr></thead>
        <tbody>{detail.sessions.map((session) => <tr key={session.id}><td>{session.courseTitle ?? "-"}</td><td>{session.sessionNo ?? "-"}</td><td>{formatKst(session.startsAt)}</td><td>{session.status}</td></tr>)}</tbody>
      </table></div>}
      {detail.enrollments.length > 0 && <div className="table-scroll"><table className="data-table">
        <thead><tr><th>신청자</th><th>사번</th><th>교육과정</th><th>차수</th><th>상태</th></tr></thead>
        <tbody>{detail.enrollments.map((enrollment, index) => { const session = sessionsById.get(enrollment.sessionId); return <tr key={`${enrollment.participantId}-${enrollment.sessionId}-${index}`}><td>{enrollment.participantName ?? "-"}</td><td>{enrollment.employeeNo ?? "-"}</td><td>{session?.courseTitle ?? "-"}</td><td>{session?.sessionNo ?? "-"}</td><td>{enrollment.status}</td></tr>; })}</tbody>
      </table></div>}
    </section>
  </div>;
}
