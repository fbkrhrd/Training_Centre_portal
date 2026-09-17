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
