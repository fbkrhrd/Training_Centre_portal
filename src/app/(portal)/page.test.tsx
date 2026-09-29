import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import PortalHomePage from "./page";

vi.mock("@/features/auth/require-user", () => ({
  requireUser: vi.fn().mockResolvedValue({
    id: "manager-1",
    role: "education_manager",
    preferredLocale: "ko",
  }),
}));

vi.mock("@/features/dashboard/dashboard-repository", () => ({
  loadDashboardSource: vi.fn().mockResolvedValue({
    assignedCourseIds: ["course-1"],
    sessions: [
      { id: "session-1", courseId: "course-1", status: "open", startsAt: "2099-10-02T00:00:00.000Z" },
      { id: "session-2", courseId: "course-1", status: "completed", startsAt: "2026-09-01T00:00:00.000Z" },
    ],
    enrollments: [
      { participantId: "participant-1", sessionId: "session-1", status: "pending" },
    ],
  }),
}));

describe("PortalHomePage", () => {
  it("renders nonzero role-scoped summary values", async () => {
    render(await PortalHomePage());

    expect(screen.getByText("예정된 교육")).toBeInTheDocument();
    expect(screen.getByText("완료 차수")).toBeInTheDocument();
    expect(screen.getByText("승인 대기")).toBeInTheDocument();
    expect(screen.getAllByText("1")).toHaveLength(3);
  });
});
