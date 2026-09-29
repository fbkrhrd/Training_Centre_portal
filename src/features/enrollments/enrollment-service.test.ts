import { describe, expect, it } from "vitest";
import { initialEnrollmentStatus, assertApprovalTransition, assertManagerEnrollmentAction, canCancelEnrollment, getApplicationEligibility } from "./enrollment-service";

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

  it("allows a participant cancellation only before the cancellation deadline", () => {
    expect(canCancelEnrollment("participant", new Date("2026-10-01T09:00:00Z"), new Date("2026-10-01T08:59:00Z"))).toBe(true);
    expect(canCancelEnrollment("participant", new Date("2026-10-01T09:00:00Z"), new Date("2026-10-01T09:01:00Z"))).toBe(false);
  });

  it("marks an existing enrollment as already applied before inserting again", () => {
    expect(getApplicationEligibility({
      existingStatus: "approved",
      applicationOpensAt: "2026-10-01T00:00:00.000Z",
      applicationClosesAt: "2026-10-31T00:00:00.000Z",
      now: new Date("2026-10-10T00:00:00.000Z"),
    })).toBe("already_applied");
  });

  it("marks a session outside its application window as unavailable", () => {
    expect(getApplicationEligibility({
      existingStatus: null,
      applicationOpensAt: "2026-10-01T00:00:00.000Z",
      applicationClosesAt: "2026-10-31T00:00:00.000Z",
      now: new Date("2026-11-01T00:00:00.000Z"),
    })).toBe("outside_application_period");
  });
});
