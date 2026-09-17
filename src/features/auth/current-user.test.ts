import { describe, expect, it } from "vitest";
import { resolveCurrentUser } from "./current-user";

const activeProfile = {
  employee_no: "a1024",
  full_name: "홍길동",
  preferred_locale: "ko",
  employment_status: "active",
};

describe("resolveCurrentUser", () => {
  it("combines verified auth data with an active profile", async () => {
    await expect(
      resolveCurrentUser({
        getUser: async () => ({
          id: "user-1",
          appMetadata: { role: "education_manager" },
        }),
        getProfile: async () => activeProfile,
      }),
    ).resolves.toEqual({
      id: "user-1",
      role: "education_manager",
      employeeNo: "a1024",
      fullName: "홍길동",
      preferredLocale: "ko",
    });
  });

  it("rejects inactive accounts", async () => {
    await expect(
      resolveCurrentUser({
        getUser: async () => ({
          id: "user-1",
          appMetadata: { role: "participant" },
        }),
        getProfile: async () => ({
          ...activeProfile,
          employment_status: "inactive",
        }),
      }),
    ).resolves.toBeNull();
  });

  it("rejects unknown roles", async () => {
    await expect(
      resolveCurrentUser({
        getUser: async () => ({
          id: "user-1",
          appMetadata: { role: "unknown" },
        }),
        getProfile: async () => activeProfile,
      }),
    ).resolves.toBeNull();
  });
});
