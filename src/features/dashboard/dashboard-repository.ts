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
    await supabase.from("course_sessions").select("id,course_id,status,starts_at"),
    "홈 차수 집계",
  ) ?? [];
  const enrollments = requireSupabaseData(
    await supabase.from("enrollments").select("participant_id,session_id,status"),
    "홈 신청 집계",
  ) ?? [];

  return {
    assignedCourseIds: assignments.map((assignment) => assignment.course_id),
    sessions: sessions.map((session) => ({
      id: session.id,
      courseId: session.course_id,
      status: session.status,
      startsAt: session.starts_at,
    })),
    enrollments: enrollments.map((enrollment) => ({
      participantId: enrollment.participant_id,
      sessionId: enrollment.session_id,
      status: enrollment.status,
    })),
  };
}
