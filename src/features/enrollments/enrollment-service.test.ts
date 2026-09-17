import { describe, expect, it } from "vitest";
import { initialEnrollmentStatus, assertApprovalTransition, assertManagerEnrollmentAction } from "./enrollment-service";

describe("enrollment service", () => {
  it("puts an application within capacity into manager approval", () => {
    expect(initialEnrollmentStatus(10, 9)).toBe("pending");
  });

  it("puts an application over capacity on the waiting list", () => {
    expect(initialEnrollmentStatus(10, 10)).toBe("waiting");
  });

  it("allows only a pending application to be approved", () => {
    expect(assertApprovalTransition("pending", "approved")).toBe("approved");
    expect(() => assertApprovalTransition("waiting", "approved")).toThrow("승인 대기");
  });

  it("allows a waiting applicant to be manually promoted", () => {
    expect(assertManagerEnrollmentAction("waiting", "approved")).toBe("approved");
  });
});
