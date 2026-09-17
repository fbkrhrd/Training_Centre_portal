import { describe, expect, it } from "vitest";
import { employeeNoToAuthEmail, normalizeEmployeeNo } from "./auth-email";

describe("employee number identity", () => {
  it("preserves leading zeroes and normalizes case", () => {
    expect(normalizeEmployeeNo(" 00Ab-12 ")).toBe("00ab-12");
  });

  it("maps to the internal auth domain", () => {
    expect(employeeNoToAuthEmail("A1024", "auth.fbkr.internal")).toBe(
      "a1024@auth.fbkr.internal",
    );
  });

  it("rejects unsafe identifiers", () => {
    expect(() => normalizeEmployeeNo("A 1024")).toThrow("사번 형식");
  });

  it("rejects an unsafe internal domain", () => {
    expect(() => employeeNoToAuthEmail("A1024", "not a domain")).toThrow(
      "인증 도메인",
    );
  });
});
