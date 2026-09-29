import { describe, expect, it } from "vitest";
import { assertSessionStatusChangeAccess } from "./session-service";

describe("assertSessionStatusChangeAccess", () => {
  it("rejects an education manager not assigned to the course", async () => {
    await expect(
      assertSessionStatusChangeAccess(
        { isAssignedManager: async () => false },
        "education_manager",
        "course-1",
        "user-1",
      ),
    ).rejects.toThrow("담당 교육과정");
  });
});
