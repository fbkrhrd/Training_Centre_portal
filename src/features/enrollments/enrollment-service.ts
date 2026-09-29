export type EnrollmentStatus = "pending" | "approved" | "rejected" | "waiting" | "cancelled";

export function initialEnrollmentStatus(capacity: number, occupied: number): EnrollmentStatus {
  return occupied >= capacity ? "waiting" : "pending";
}

export function getApplicationEligibility(input: {
  existingStatus: EnrollmentStatus | null;
  applicationOpensAt: string;
  applicationClosesAt: string;
  now: Date;
}) {
  if (input.existingStatus) return "already_applied" as const;
  if (
    input.now.getTime() < Date.parse(input.applicationOpensAt) ||
    input.now.getTime() > Date.parse(input.applicationClosesAt)
  ) {
    return "outside_application_period" as const;
  }
  return "available" as const;
}

export function assertApprovalTransition(current: EnrollmentStatus, target: "approved" | "rejected") {
  if (current !== "pending") throw new Error("승인 대기 상태만 처리할 수 있습니다.");
  return target;
}

export function assertManagerEnrollmentAction(
  current: EnrollmentStatus,
  target: "approved" | "rejected",
) {
  if (current !== "pending" && current !== "waiting") {
    throw new Error("승인 대기 또는 대기 상태만 처리할 수 있습니다.");
  }
  return target;
}

export function canCancelEnrollment(
  actor: "participant" | "manager",
  cancellationDeadline: Date,
  now: Date,
) {
  return actor === "manager" || isDeadlineOpen(cancellationDeadline, now);
}
import { isDeadlineOpen } from "@/lib/kst-date-time";
