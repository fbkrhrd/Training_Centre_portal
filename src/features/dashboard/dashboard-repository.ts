import "server-only";
import { requireSupabaseData } from "@/lib/data-access";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { DashboardActor, DashboardSource } from "./dashboard-service";

export async function loadDashboardSource(actor: DashboardActor): Promise<DashboardSource> {
  const supabase = createAdminSupabaseClient();
  const assignments = actor.role === "education_manager"
    ? requireSupabaseData(
      await supabase.from("course_managers").select("course_id").eq("manager_id", actor.id),
      "담당 과정",
    ) ?? []
    : [];
  const sessions = requireSupabaseData(
    await supabase.from("course_sessions").select("id,course_id,session_no,status,starts_at,courses(title_ko)"),
    "홈 차수 집계",
  ) ?? [];
  const enrollments = requireSupabaseData(
    await supabase.from("enrollments").select("participant_id,session_id,status,profiles!enrollments_participant_id_fkey(full_name,employee_no)"),
    "홈 신청 집계",
  ) ?? [];

  return {
    assignedCourseIds: assignments.map((assignment) => assignment.course_id),
    sessions: sessions.map((session) => ({
      id: session.id,
      courseId: session.course_id,
      status: session.status,
      startsAt: session.starts_at,
      sessionNo: session.session_no,
      courseTitle: (session.courses as { title_ko?: string } | null)?.title_ko,
    })),
    enrollments: enrollments.map((enrollment) => ({
      participantId: enrollment.participant_id,
      sessionId: enrollment.session_id,
      status: enrollment.status,
      participantName: (enrollment.profiles as { full_name?: string } | null)?.full_name,
      employeeNo: (enrollment.profiles as { employee_no?: string } | null)?.employee_no,
    })),
  };
}
