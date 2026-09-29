import { describe, expect, it } from "vitest";
import { getDashboardDetail, getDashboardSummary } from "./dashboard-service";

const now = new Date("2026-10-01T00:00:00.000Z");
const source = {
  assignedCourseIds: ["course-1"],
  sessions: [
    { id: "session-1", courseId: "course-1", status: "open", startsAt: "2026-10-02T00:00:00.000Z" },
    { id: "session-2", courseId: "course-2", status: "completed", startsAt: "2026-09-01T00:00:00.000Z" },
  ],
  enrollments: [
    { participantId: "participant-1", sessionId: "session-1", status: "approved" },
    { participantId: "participant-2", sessionId: "session-1", status: "pending" },
    { participantId: "participant-3", sessionId: "session-2", status: "waiting" },
  ],
};

describe("getDashboardSummary", () => {
  it("counts only a participant's future approved sessions", () => {
    expect(getDashboardSummary(source, { id: "participant-1", role: "participant" }, now))
      .toEqual({ upcomingTraining: 1, completedSessions: 0, pendingApproval: 0 });
  });

  it("counts pending applications only for assigned manager courses", () => {
    expect(getDashboardSummary(source, { id: "manager-1", role: "education_manager" }, now))
      .toMatchObject({ upcomingTraining: 1, pendingApproval: 1 });
  });

  it("returns only approved future sessions for a participant's upcoming detail", () => {
    const detail = getDashboardDetail(source, { id: "participant-1", role: "participant" }, "upcoming", new Date("2026-10-01T00:00:00.000Z"));

    expect(detail.sessions.map((session) => session.id)).toEqual(["session-1"]);
    expect(detail.enrollments).toEqual([]);
  });

  it("returns only assigned-course pending applications for a manager's detail", () => {
    const detail = getDashboardDetail(source, { id: "manager-1", role: "education_manager" }, "pending", new Date("2026-10-01T00:00:00.000Z"));

    expect(detail.sessions).toEqual([]);
    expect(detail.enrollments.map((enrollment) => enrollment.sessionId)).toEqual(["session-1"]);
  });
});
