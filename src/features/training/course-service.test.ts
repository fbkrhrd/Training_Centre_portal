import { describe, expect, it, vi } from "vitest";
import { assertCourseCanBeDeleted, assertCourseManagementAccess } from "./course-service";

describe("assertCourseManagementAccess", () => {
  it("allows a system administrator to manage any course", async () => {
    const isAssignedManager = vi.fn();

    await expect(
      assertCourseManagementAccess({ isAssignedManager }, "system_admin", "course-1", "user-1"),
    ).resolves.toBeUndefined();
    expect(isAssignedManager).not.toHaveBeenCalled();
  });

  it("rejects an education manager who is not assigned to the course", async () => {
    await expect(
      assertCourseManagementAccess(
        { isAssignedManager: vi.fn().mockResolvedValue(false) },
        "education_manager",
        "course-1",
        "user-1",
      ),
    ).rejects.toThrow("담당 교육과정만");
  });

  it("blocks deletion when the course has sessions", () => {
    expect(() => assertCourseCanBeDeleted(1)).toThrow("차수가 등록된 과정은 삭제할 수 없습니다.");
  });
});
