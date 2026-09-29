import type { AppRole } from "@/features/auth/types";

export type CourseAccessDependencies = {
  isAssignedManager(courseId: string, userId: string): Promise<boolean>;
};

export async function assertCourseManagementAccess(
  dependencies: CourseAccessDependencies,
  actorRole: AppRole,
  courseId: string,
  actorId: string,
) {
  if (actorRole === "system_admin") return;
  if (
    actorRole !== "education_manager" ||
    !(await dependencies.isAssignedManager(courseId, actorId))
  ) {
    throw new Error("담당 교육과정만 관리할 수 있습니다.");
  }
}

export function assertCourseCanBeDeleted(sessionCount: number) {
  if (sessionCount > 0) {
    throw new Error("차수가 등록된 과정은 삭제할 수 없습니다.");
  }
}

export function getCourseRosterCounts(
  sessions: ReadonlyArray<{ id: string; courseId: string }>,
  approvedEnrollments: ReadonlyArray<{ sessionId: string }>,
) {
  const courseIdBySessionId = new Map(sessions.map((session) => [session.id, session.courseId]));
  const counts = new Map<string, { sessionCount: number; approvedParticipantCount: number }>();

  for (const session of sessions) {
    const current = counts.get(session.courseId) ?? { sessionCount: 0, approvedParticipantCount: 0 };
    current.sessionCount += 1;
    counts.set(session.courseId, current);
  }

  for (const enrollment of approvedEnrollments) {
    const courseId = courseIdBySessionId.get(enrollment.sessionId);
    if (!courseId) continue;
    const current = counts.get(courseId) ?? { sessionCount: 0, approvedParticipantCount: 0 };
    current.approvedParticipantCount += 1;
    counts.set(courseId, current);
  }

  return counts;
}
