export type SessionStatus = "draft" | "open" | "closed" | "completed" | "cancelled";

export function nextSessionStatus(
  current: SessionStatus,
  target: SessionStatus,
  hasRequiredOperations: boolean,
): SessionStatus {
  if (current === "draft" && target === "open" && !hasRequiredOperations) {
    throw new Error("필수 운영 정보가 갖춰져야 게시할 수 있습니다.");
  }
  return target;
}
