import { describe, expect, it, vi } from "vitest";
import {
  createUserAccount,
  deactivateUserAccount,
  updateUserRole,
  updateUserProfile,
} from "./account-service";

const input = {
  employeeNo: "a1024",
  fullName: "홍길동",
  companyEmail: "hong@example.com",
  employmentStatus: "active" as const,
  role: "participant" as const,
  preferredLocale: "ko" as const,
};

describe("account service", () => {
  it("prevents an education manager from creating a privileged account", async () => {
    const dependencies = {
      createAuthUser: vi.fn(),
      deleteAuthUser: vi.fn(),
      insertProfile: vi.fn(),
      updateProfileStatus: vi.fn(),
      updateAuthUser: vi.fn(),
      updateProfile: vi.fn(),
    };

    await expect(
      createUserAccount(
        dependencies,
        "education_manager",
        { ...input, role: "system_admin" },
        "A1024",
        "auth.fbkr.internal",
      ),
    ).rejects.toThrow("참가자 계정만");
    expect(dependencies.createAuthUser).not.toHaveBeenCalled();
  });

  it("removes the auth user when profile creation fails", async () => {
    const deleteAuthUser = vi.fn().mockResolvedValue(undefined);
    const dependencies = {
      createAuthUser: vi.fn().mockResolvedValue("user-1"),
      deleteAuthUser,
      insertProfile: vi.fn().mockRejectedValue(new Error("profile failed")),
      updateProfileStatus: vi.fn(),
      updateAuthUser: vi.fn(),
      updateProfile: vi.fn(),
    };

    await expect(
      createUserAccount(
        dependencies,
        "system_admin",
        input,
        "A1024",
        "auth.fbkr.internal",
      ),
    ).rejects.toThrow("profile failed");
    expect(deleteAuthUser).toHaveBeenCalledWith("user-1");
  });

  it("disables auth without deleting the profile", async () => {
    const dependencies = {
      createAuthUser: vi.fn(),
      deleteAuthUser: vi.fn(),
      insertProfile: vi.fn(),
      updateProfileStatus: vi.fn().mockResolvedValue(undefined),
      updateAuthUser: vi.fn().mockResolvedValue(undefined),
      updateProfile: vi.fn(),
    };

    await deactivateUserAccount(dependencies, "education_manager", "user-1");

    expect(dependencies.updateProfileStatus).toHaveBeenCalledWith(
      "user-1",
      "inactive",
    );
    expect(dependencies.updateAuthUser).toHaveBeenCalledWith("user-1", {
      banDuration: "876000h",
    });
    expect(dependencies.deleteAuthUser).not.toHaveBeenCalled();
  });

  it("updates authorization metadata when a role changes", async () => {
    const updateAuthUser = vi.fn().mockResolvedValue(undefined);
    const dependencies = {
      createAuthUser: vi.fn(),
      deleteAuthUser: vi.fn(),
      insertProfile: vi.fn(),
      updateProfileStatus: vi.fn(),
      updateAuthUser,
      updateProfile: vi.fn(),
    };

    await updateUserRole(
      dependencies,
      "system_admin",
      "user-1",
      "education_manager",
    );

    expect(updateAuthUser).toHaveBeenCalledWith("user-1", {
      role: "education_manager",
    });
  });

  it("lets an education manager update participant profile fields", async () => {
    const updateProfile = vi.fn().mockResolvedValue(undefined);
    const dependencies = {
      createAuthUser: vi.fn(),
      deleteAuthUser: vi.fn(),
      insertProfile: vi.fn(),
      updateProfileStatus: vi.fn(),
      updateAuthUser: vi.fn(),
      updateProfile,
    };
    const profile = {
      fullName: "홍길순",
      companyEmail: "gilsoon@example.com",
      preferredLocale: "en" as const,
    };

    await updateUserProfile(
      dependencies,
      "education_manager",
      "participant",
      "user-1",
      profile,
    );

    expect(updateProfile).toHaveBeenCalledWith("user-1", profile);
  });
});
