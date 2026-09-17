export type EnrollmentStatus = "pending" | "approved" | "rejected" | "waiting" | "cancelled";

export function initialEnrollmentStatus(capacity: number, occupied: number): EnrollmentStatus {
  return occupied >= capacity ? "waiting" : "pending";
}

export function assertApprovalTransition(current: EnrollmentStatus, target: "approved" | "rejected") {
  if (current !== "pending") throw new Error("승인 대기 상태만 처리할 수 있습니다.");
  return target;
}
