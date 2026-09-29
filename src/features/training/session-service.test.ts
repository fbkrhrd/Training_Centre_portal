import { describe, expect, it } from "vitest";
import { assertSessionStatusTransition } from "./session-service";

describe("nextSessionStatus", () => {
  it("allows a draft session to open only when the application period is valid", () => {
    expect(assertSessionStatusTransition("draft", "open", true)).toBe("open");
  });

  it("rejects publishing an incomplete draft session", () => {
    expect(() => assertSessionStatusTransition("draft", "open", false)).toThrow("필수 운영 정보");
  });

  it("rejects reopening a completed session", () => {
    expect(() => assertSessionStatusTransition("completed", "open", true))
      .toThrow("변경할 수 없습니다");
  });

  it("accepts submitting the current status without changing the session", () => {
    expect(assertSessionStatusTransition("draft", "draft", true)).toBe("draft");
  });
});
