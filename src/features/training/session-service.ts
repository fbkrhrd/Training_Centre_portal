export type SessionStatus = "draft" | "open" | "closed" | "completed" | "cancelled";
import { assertCourseManagementAccess, type CourseAccessDependencies } from "./course-service";

const transitions: Record<SessionStatus, readonly SessionStatus[]> = {
  draft: ["open", "cancelled"],
  open: ["closed", "cancelled"],
  closed: ["open", "completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export function assertSessionStatusTransition(
  current: SessionStatus,
  target: SessionStatus,
  hasRequiredOperations: boolean,
): SessionStatus {
  if (!transitions[current].includes(target)) {
    throw new Error("현재 상태에서는 변경할 수 없습니다.");
  }
  if (current === "draft" && target === "open" && !hasRequiredOperations) {
    throw new Error("필수 운영 정보가 갖춰져야 게시할 수 있습니다.");
  }
  return target;
}

export async function assertSessionStatusChangeAccess(
  dependencies: CourseAccessDependencies,
  actorRole: Parameters<typeof assertCourseManagementAccess>[1],
  courseId: string,
  actorId: string,
) {
  await assertCourseManagementAccess(dependencies, actorRole, courseId, actorId);
}
