import type { AppRole } from "@/features/auth/types";
import { employeeNoToAuthEmail } from "@/features/auth/auth-email";
import type { UserInput, UserProfileInput } from "./user-schema";

type EmploymentStatus = "active" | "inactive";

export type AccountDependencies = {
  createAuthUser(input: {
    email: string;
    password: string;
    role: AppRole;
  }): Promise<string>;
  deleteAuthUser(userId: string): Promise<void>;
  insertProfile(userId: string, input: UserInput): Promise<void>;
  updateProfileStatus(
    userId: string,
    status: EmploymentStatus,
  ): Promise<void>;
  updateAuthUser(
    userId: string,
    change: { banDuration: string } | { role: AppRole },
  ): Promise<void>;
  updateProfile(userId: string, input: UserProfileInput): Promise<void>;
};

function assertManager(role: AppRole) {
  if (role !== "system_admin" && role !== "education_manager") {
    throw new Error("사용자 계정 관리 권한이 없습니다.");
  }
}

function assertRoleAssignment(actorRole: AppRole, targetRole: AppRole) {
  assertManager(actorRole);
  if (actorRole === "education_manager" && targetRole !== "participant") {
    throw new Error("교육담당자는 참가자 계정만 생성할 수 있습니다.");
  }
}

export async function createUserAccount(
  dependencies: AccountDependencies,
  actorRole: AppRole,
  input: UserInput,
  initialPassword: string,
  authDomain: string,
) {
  assertRoleAssignment(actorRole, input.role);

  const userId = await dependencies.createAuthUser({
    email: employeeNoToAuthEmail(input.employeeNo, authDomain),
    password: initialPassword,
    role: input.role,
  });

  try {
    await dependencies.insertProfile(userId, input);
  } catch (error) {
    await dependencies.deleteAuthUser(userId);
    throw error;
  }

  if (input.employmentStatus === "inactive") {
    await dependencies.updateAuthUser(userId, { banDuration: "876000h" });
  }

  return userId;
}

export async function deactivateUserAccount(
  dependencies: AccountDependencies,
  actorRole: AppRole,
  userId: string,
) {
  assertManager(actorRole);
  await dependencies.updateProfileStatus(userId, "inactive");
  await dependencies.updateAuthUser(userId, { banDuration: "876000h" });
}

export async function reactivateUserAccount(
  dependencies: AccountDependencies,
  actorRole: AppRole,
  userId: string,
) {
  assertManager(actorRole);
  await dependencies.updateAuthUser(userId, { banDuration: "none" });
  await dependencies.updateProfileStatus(userId, "active");
}

export async function updateUserRole(
  dependencies: AccountDependencies,
  actorRole: AppRole,
  userId: string,
  role: AppRole,
) {
  if (actorRole !== "system_admin") {
    throw new Error("역할 변경은 시스템 관리자만 할 수 있습니다.");
  }
  await dependencies.updateAuthUser(userId, { role });
}

export async function updateUserProfile(
  dependencies: AccountDependencies,
  actorRole: AppRole,
  targetRole: AppRole,
  userId: string,
  input: UserProfileInput,
) {
  assertManager(actorRole);
  if (actorRole === "education_manager" && targetRole !== "participant") {
    throw new Error("교육담당자는 참가자 계정만 관리할 수 있습니다.");
  }
  await dependencies.updateProfile(userId, input);
}
