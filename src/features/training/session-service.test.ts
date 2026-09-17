import { describe, expect, it } from "vitest";
import { nextSessionStatus } from "./session-service";

describe("nextSessionStatus", () => {
  it("allows a draft session to open only when the application period is valid", () => {
    expect(nextSessionStatus("draft", "open", true)).toBe("open");
  });

  it("rejects publishing an incomplete draft session", () => {
    expect(() => nextSessionStatus("draft", "open", false)).toThrow("필수 운영 정보");
  });
});
