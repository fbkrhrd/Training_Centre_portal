import type { AppRole } from "@/features/auth/types";

type Session = {
  id: string;
  courseId: string;
  status: string;
  startsAt: string;
};

type Enrollment = {
  participantId: string;
  sessionId: string;
  status: string;
};

export type DashboardSource = {
  assignedCourseIds: string[];
  sessions: Session[];
  enrollments: Enrollment[];
};

export type DashboardActor = { id: string; role: AppRole };

export type DashboardSummary = {
  upcomingTraining: number;
  completedSessions: number;
  pendingApproval: number;
};

export function getDashboardSummary(
  source: DashboardSource,
  actor: DashboardActor,
  now: Date,
): DashboardSummary {
  const scopedSessions = actor.role === "education_manager"
    ? source.sessions.filter((session) => source.assignedCourseIds.includes(session.courseId))
    : source.sessions;
  const scopedSessionIds = new Set(scopedSessions.map((session) => session.id));

  if (actor.role === "participant") {
    const approvedSessionIds = new Set(
      source.enrollments
        .filter((enrollment) => enrollment.participantId === actor.id && enrollment.status === "approved")
        .map((enrollment) => enrollment.sessionId),
    );
    return {
      upcomingTraining: source.sessions.filter(
        (session) => approvedSessionIds.has(session.id) && new Date(session.startsAt) > now,
      ).length,
      completedSessions: source.sessions.filter(
        (session) => approvedSessionIds.has(session.id) && session.status === "completed",
      ).length,
      pendingApproval: 0,
    };
  }

  return {
    upcomingTraining: scopedSessions.filter((session) => new Date(session.startsAt) > now).length,
    completedSessions: scopedSessions.filter((session) => session.status === "completed").length,
    pendingApproval: source.enrollments.filter(
      (enrollment) =>
        scopedSessionIds.has(enrollment.sessionId) &&
        (enrollment.status === "pending" || enrollment.status === "waiting"),
    ).length,
  };
}
