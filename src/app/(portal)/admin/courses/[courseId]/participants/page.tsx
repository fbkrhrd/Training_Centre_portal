import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/features/auth/require-user";
import { toApprovedParticipantRow } from "@/features/enrollments/approved-participant-service";
import { assertCourseManagementAccess } from "@/features/training/course-service";
import { requireSupabaseData } from "@/lib/data-access";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

const managers = ["system_admin", "education_manager"] as const;

export default async function ApprovedParticipantsPage({ params }: { params: Promise<{ courseId: string }> }) {
  const user = await requireUser(managers);
  const { courseId: rawCourseId } = await params;
  const parsedCourseId = z.string().uuid().safeParse(rawCourseId);
  if (!parsedCourseId.success) notFound();

  const courseId = parsedCourseId.data;
  const supabase = createAdminSupabaseClient();
  const course = requireSupabaseData(await supabase
    .from("courses")
    .select("id,title_ko,title_en")
    .eq("id", courseId)
    .maybeSingle(), "교육과정")
  if (!course) notFound();

  await assertCourseManagementAccess({
    async isAssignedManager(targetCourseId, userId) {
      const assignment = requireSupabaseData(await supabase
        .from("course_managers")
        .select("course_id")
        .eq("course_id", targetCourseId)
        .eq("manager_id", userId)
        .maybeSingle(), "교육과정 담당자");
      return Boolean(assignment);
    },
  }, user.role, courseId, user.id);

  const enrollments = requireSupabaseData(await supabase
    .from("enrollments")
    .select("decided_at,profiles!enrollments_participant_id_fkey(full_name,employee_no,departments(name)),course_sessions!inner(session_no,course_id)")
    .eq("status", "approved")
    .eq("course_sessions.course_id", courseId)
    .order("decided_at", { ascending: false }), "승인 참가자 목록") ?? [];

  const participants = enrollments.map((enrollment) => {
    const profile = enrollment.profiles as {
      full_name?: string | null;
      employee_no?: string | null;
      departments?: { name?: string | null } | null;
    } | null;
    const session = enrollment.course_sessions as { session_no?: number | null } | null;
    return toApprovedParticipantRow({
      fullName: profile?.full_name ?? null,
      employeeNo: profile?.employee_no ?? null,
      department: profile?.departments?.name ?? null,
      sessionNo: session?.session_no ?? null,
      decidedAt: enrollment.decided_at,
    });
  });

  return <div className="content-panel content-panel--wide">
    <header className="page-heading">
      <p className="dashboard-intro__label">TRAINING MANAGEMENT</p>
      <h1>{course.title_ko} 승인 참가자</h1>
      <p>승인 완료된 참가자와 차수 정보를 확인합니다.</p>
      <Link className="text-link" href="/admin/courses">교육과정 목록으로 돌아가기</Link>
    </header>
    <section className="content-card content-card--table">
      <div className="table-scroll"><table className="data-table">
        <thead><tr><th>이름</th><th>사번</th><th>소속</th><th>차수</th><th>승인일</th></tr></thead>
        <tbody>
          {participants.map((participant, index) => <tr key={`${participant.employeeNo}-${participant.sessionNo}-${index}`}>
            <td>{participant.fullName}</td><td>{participant.employeeNo}</td><td>{participant.department}</td><td>{participant.sessionNo}</td><td>{participant.approvedAt}</td>
          </tr>)}
          {!participants.length && <tr><td colSpan={5}>표시할 데이터가 없습니다</td></tr>}
        </tbody>
      </table></div>
    </section>
  </div>;
}
