export const appRoles = [
  "system_admin",
  "education_manager",
  "participant",
] as const;

export type AppRole = (typeof appRoles)[number];

export type CurrentUser = {
  id: string;
  role: AppRole;
  employeeNo: string;
  fullName: string;
  preferredLocale: "ko" | "en";
};

export function isAppRole(value: unknown): value is AppRole {
  return typeof value === "string" && appRoles.includes(value as AppRole);
}
