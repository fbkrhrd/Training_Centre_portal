import { describe, expect, it } from "vitest";
import { filterUserRows, parseUserListFilters } from "./user-list-filter";

const rows = [
  {
    id: "1",
    employeeNo: "1001",
    fullName: "홍길동",
    companyEmail: "hong@example.com",
    employmentStatus: "active" as const,
    role: "participant" as const,
  },
  {
    id: "2",
    employeeNo: "2001",
    fullName: "Kim Manager",
    companyEmail: "kim@example.com",
    employmentStatus: "inactive" as const,
    role: "education_manager" as const,
  },
];

describe("user list filters", () => {
  it("normalizes invalid query values", () => {
    expect(parseUserListFilters({ query: " 1001 ", role: "owner", status: "all" })).toEqual({
      query: "1001",
      role: "all",
      status: "all",
    });
  });

  it("filters by search text, role, and employment status", () => {
    expect(
      filterUserRows(rows, {
        query: "kim",
        role: "education_manager",
        status: "inactive",
      }),
    ).toEqual([rows[1]]);
  });
});
