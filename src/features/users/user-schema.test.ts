import { describe, expect, it } from "vitest";
import { userInputSchema } from "./user-schema";

describe("userInputSchema", () => {
  it("accepts and normalizes the approved employee fields", () => {
    expect(
      userInputSchema.parse({
        employeeNo: "A1024",
        fullName: "홍길동",
        companyEmail: "hong@example.com",
        employmentStatus: "active",
        role: "participant",
        preferredLocale: "ko",
      }),
    ).toMatchObject({ employeeNo: "a1024", role: "participant" });
  });

  it("rejects an invalid company email", () => {
    expect(() =>
      userInputSchema.parse({
        employeeNo: "A1024",
        fullName: "홍길동",
        companyEmail: "invalid",
        employmentStatus: "active",
        role: "participant",
        preferredLocale: "ko",
      }),
    ).toThrow();
  });
});
