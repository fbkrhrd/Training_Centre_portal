import type { AppRole } from "@/features/auth/types";

export type DashboardSession = {
  id: string;
  courseId: string;
  status: string;
  startsAt: string;
  courseTitle?: string;
  sessionNo?: number;
};

export type DashboardEnrollment = {
  participantId: string;
  sessionId: string;
  status: string;
  participantName?: string;
  employeeNo?: string;
};

export type DashboardSource = {
  assignedCourseIds: string[];
  sessions: DashboardSession[];
  enrollments: DashboardEnrollment[];
};

export type DashboardActor = { id: string; role: AppRole };

export type DashboardSummary = {
  upcomingTraining: number;
  completedSessions: number;
  pendingApproval: number;
};

export const dashboardMetrics = ["upcoming", "completed", "pending"] as const;
export type DashboardMetric = (typeof dashboardMetrics)[number];

export function isDashboardMetric(value: string): value is DashboardMetric {
  return dashboardMetrics.includes(value as DashboardMetric);
}

function getScopedSessions(source: DashboardSource, actor: DashboardActor) {
  return actor.role === "education_manager"
    ? source.sessions.filter((session) => source.assignedCourseIds.includes(session.courseId))
    : source.sessions;
}

export function getDashboardSummary(
  source: DashboardSource,
  actor: DashboardActor,
  now: Date,
): DashboardSummary {
  const scopedSessions = getScopedSessions(source, actor);
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

export function getDashboardDetail(
  source: DashboardSource,
  actor: DashboardActor,
  metric: DashboardMetric,
  now: Date,
) {
  const scopedSessions = getScopedSessions(source, actor);
  const scopedSessionIds = new Set(scopedSessions.map((session) => session.id));

  if (actor.role === "participant") {
    const approvedSessionIds = new Set(
      source.enrollments
        .filter((enrollment) => enrollment.participantId === actor.id && enrollment.status === "approved")
        .map((enrollment) => enrollment.sessionId),
    );
    const sessions = metric === "upcoming"
      ? source.sessions.filter((session) => approvedSessionIds.has(session.id) && new Date(session.startsAt) > now)
      : metric === "completed"
        ? source.sessions.filter((session) => approvedSessionIds.has(session.id) && session.status === "completed")
        : [];
    return { sessions, enrollments: [] as DashboardEnrollment[] };
  }

  if (metric === "pending") {
    return {
      sessions: [] as DashboardSession[],
      enrollments: source.enrollments.filter(
        (enrollment) => scopedSessionIds.has(enrollment.sessionId) &&
          (enrollment.status === "pending" || enrollment.status === "waiting"),
      ),
    };
  }

  return {
    sessions: metric === "upcoming"
      ? scopedSessions.filter((session) => new Date(session.startsAt) > now)
      : scopedSessions.filter((session) => session.status === "completed"),
    enrollments: [] as DashboardEnrollment[],
  };
}
