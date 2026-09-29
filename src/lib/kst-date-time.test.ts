import { describe, expect, it } from "vitest";
import { formatKst, toKstIso } from "./kst-date-time";

describe("KST date-time helpers", () => {
  it("stores a Korean local input as its UTC instant", () => {
    expect(toKstIso("2026-10-01T09:00")).toBe("2026-10-01T00:00:00.000Z");
  });

  it("formats a UTC instant in Korea time regardless of server timezone", () => {
    expect(formatKst("2026-10-01T00:00:00.000Z")).toBe("2026-10-01 09:00");
  });
});
