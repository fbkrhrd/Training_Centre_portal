import { describe, expect, it, vi } from "vitest";
import EnrollmentsPage from "./page";

const mocks = vi.hoisted(() => {
  const order = vi.fn().mockResolvedValue({ data: [], error: null });
  const select = vi.fn(() => ({ order }));
  const from = vi.fn(() => ({ select }));

  return { from, select };
});

vi.mock("@/features/auth/require-user", () => ({
  requireUser: vi.fn().mockResolvedValue({
    id: "admin-1",
    role: "system_admin",
    preferredLocale: "ko",
  }),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminSupabaseClient: vi.fn(() => ({ from: mocks.from })),
}));

vi.mock("@/features/enrollments/actions", () => ({
  decideEnrollmentAction: vi.fn(),
}));

describe("EnrollmentsPage", () => {
  it("selects the participant profile through its explicit foreign-key relation", async () => {
    await EnrollmentsPage();

    expect(mocks.select).toHaveBeenCalledWith(
      expect.stringContaining("profiles!enrollments_participant_id_fkey(full_name,employee_no)"),
    );
  });
});
