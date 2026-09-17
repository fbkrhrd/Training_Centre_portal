import { describe, expect, it, vi } from "vitest";
import { authenticateEmployee } from "./auth-service";

describe("authenticateEmployee", () => {
  it("signs in with the internal auth email", async () => {
    const signInWithPassword = vi.fn().mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });

    await authenticateEmployee(
      { signInWithPassword },
      { employeeNo: "A1024", password: "A1024" },
      "auth.fbkr.internal",
    );

    expect(signInWithPassword).toHaveBeenCalledWith({
      email: "a1024@auth.fbkr.internal",
      password: "A1024",
    });
  });

  it("returns a safe localized error", async () => {
    const signInWithPassword = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "invalid credentials" },
    });

    await expect(
      authenticateEmployee(
        { signInWithPassword },
        { employeeNo: "A1024", password: "wrong" },
        "auth.fbkr.internal",
      ),
    ).rejects.toThrow("사번 또는 비밀번호");
  });
});
