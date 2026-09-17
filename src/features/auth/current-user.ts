import { isAppRole, type CurrentUser } from "./types";

type VerifiedUser = {
  id: string;
  appMetadata: Record<string, unknown>;
};

type Profile = {
  employee_no: string;
  full_name: string;
  preferred_locale: string;
  employment_status: string;
};

export type CurrentUserDependencies = {
  getUser(): Promise<VerifiedUser | null>;
  getProfile(userId: string): Promise<Profile | null>;
};

export async function resolveCurrentUser(
  dependencies: CurrentUserDependencies,
): Promise<CurrentUser | null> {
  const user = await dependencies.getUser();
  if (!user) return null;

  const profile = await dependencies.getProfile(user.id);
  const role = user.appMetadata.role;

  if (
    !profile ||
    profile.employment_status !== "active" ||
    !isAppRole(role)
  ) {
    return null;
  }

  return {
    id: user.id,
    role,
    employeeNo: profile.employee_no,
    fullName: profile.full_name,
    preferredLocale: profile.preferred_locale === "en" ? "en" : "ko",
  };
}
