import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CoursesPage from "./page";

const mocks = vi.hoisted(() => {
  const order = vi.fn().mockResolvedValue({
    data: [
      {
        id: "session-1",
        session_no: 1,
        starts_at: "2026-10-01T00:00:00.000Z",
        ends_at: "2026-10-01T02:00:00.000Z",
        capacity: 10,
        courses: { title_ko: "설명 있는 과정", description_ko: "참가자에게 보여줄 과정 설명" },
      },
      {
        id: "session-2",
        session_no: 2,
        starts_at: "2026-10-02T00:00:00.000Z",
        ends_at: "2026-10-02T02:00:00.000Z",
        capacity: 10,
        courses: { title_ko: "설명 없는 과정", description_ko: null },
      },
    ],
    error: null,
  });
  const eq = vi.fn(() => ({ order }));
  const select = vi.fn(() => ({ eq }));
  const from = vi.fn(() => ({ select }));
  return { from };
});

vi.mock("@/features/auth/require-user", () => ({ requireUser: vi.fn().mockResolvedValue({}) }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminSupabaseClient: vi.fn(() => ({ from: mocks.from })) }));
vi.mock("@/features/enrollments/actions", () => ({ applyForSessionAction: vi.fn() }));

describe("CoursesPage", () => {
  it("shows each course description or the empty-description guidance", async () => {
    render(await CoursesPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByText("참가자에게 보여줄 과정 설명")).toBeInTheDocument();
    expect(screen.getByText("설명이 등록되지 않았습니다")).toBeInTheDocument();
  });
});
