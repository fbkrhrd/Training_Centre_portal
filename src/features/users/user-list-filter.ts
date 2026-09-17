import { appRoles, isAppRole, type AppRole } from "@/features/auth/types";

export type UserListStatus = "all" | "active" | "inactive";
export type UserListRole = "all" | AppRole;
export type UserListFilters = { query: string; role: UserListRole; status: UserListStatus };
export type FilterableUserRow = {
  employeeNo: string;
  fullName: string;
  companyEmail: string;
  employmentStatus: "active" | "inactive";
  role: AppRole;
};

export function parseUserListFilters(input: Record<string, string | undefined>): UserListFilters {
  return {
    query: input.query?.trim().slice(0, 100) ?? "",
    role: isAppRole(input.role) ? input.role : "all",
    status: input.status === "active" || input.status === "inactive" ? input.status : "all",
  };
}

export function filterUserRows<Row extends FilterableUserRow>(rows: readonly Row[], filters: UserListFilters) {
  const query = filters.query.toLocaleLowerCase();
  return rows.filter((row) => {
    const matchesQuery = !query || [row.employeeNo, row.fullName, row.companyEmail]
      .some((value) => value.toLocaleLowerCase().includes(query));
    return matchesQuery &&
      (filters.role === "all" || row.role === filters.role) &&
      (filters.status === "all" || row.employmentStatus === filters.status);
  });
}

export const userListRoles = appRoles;
