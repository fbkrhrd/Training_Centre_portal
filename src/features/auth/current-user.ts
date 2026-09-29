import { isAppRole, type CurrentUser } from "./types";

type VerifiedClaims = {
  sub: string;
  app_metadata: Record<string, unknown>;
};

type Profile = {
  employee_no: string;
  full_name: string;
  preferred_locale: string;
  employment_status: string;
};

export type CurrentUserDependencies = {
  getClaims(): Promise<VerifiedClaims | null>;
  getProfile(userId: string): Promise<Profile | null>;
};

export async function resolveCurrentUser(
  dependencies: CurrentUserDependencies,
): Promise<CurrentUser | null> {
  const claims = await dependencies.getClaims();
  if (!claims) return null;

  const profile = await dependencies.getProfile(claims.sub);
  const role = claims.app_metadata.role;

  if (
    !profile ||
    profile.employment_status !== "active" ||
    !isAppRole(role)
  ) {
    return null;
  }

  return {
    id: claims.sub,
    role,
    employeeNo: profile.employee_no,
    fullName: profile.full_name,
    preferredLocale: profile.preferred_locale === "en" ? "en" : "ko",
  };
}
