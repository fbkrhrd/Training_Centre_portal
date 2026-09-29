import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import MyLearningPage from "./page";

const mocks = vi.hoisted(() => {
  const order = vi.fn().mockResolvedValue({
    data: [{
      id: "enrollment-1",
      status: "approved",
      course_sessions: {
        session_no: 1,
        starts_at: "2026-10-01T00:00:00.000Z",
        cancellation_closes_at: "2026-09-30T00:00:00.000Z",
        courses: { title_ko: "테스트 과정" },
      },
    }],
    error: null,
  });
  const eq = vi.fn(() => ({ order }));
  const select = vi.fn(() => ({ eq }));
  const from = vi.fn(() => ({ select }));
  return { from };
});

vi.mock("@/features/auth/require-user", () => ({
  requireUser: vi.fn().mockResolvedValue({ id: "participant-1" }),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminSupabaseClient: vi.fn(() => ({ from: mocks.from })),
}));

vi.mock("@/features/enrollments/actions", () => ({
  cancelEnrollmentAction: vi.fn(),
}));

describe("MyLearningPage", () => {
  it("shows the session schedule in Korea Standard Time", async () => {
    render(await MyLearningPage());

    expect(screen.getByRole("columnheader", { name: "일정" })).toBeInTheDocument();
    expect(screen.getByText("2026-10-01 09:00")).toBeInTheDocument();
  });
});
