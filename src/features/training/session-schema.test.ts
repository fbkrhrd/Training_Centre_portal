import { describe, expect, it } from "vitest";
import { sessionInputSchema } from "./session-schema";

describe("sessionInputSchema", () => {
  it("requires an online link for online delivery", () => {
    expect(() => sessionInputSchema.parse({
      courseId: "00000000-0000-4000-8000-000000000001",
      sessionNo: 1,
      deliveryMode: "online",
      startsAt: "2026-10-01T09:00:00.000Z",
      endsAt: "2026-10-01T10:00:00.000Z",
      capacity: 20,
      applicationOpensAt: "2026-09-01T00:00:00.000Z",
      applicationClosesAt: "2026-09-30T00:00:00.000Z",
      cancellationClosesAt: "2026-09-30T00:00:00.000Z",
    })).toThrow("온라인 접속 링크");
  });

  it("rejects a session that ends before it starts", () => {
    expect(() => sessionInputSchema.parse({
      courseId: "00000000-0000-4000-8000-000000000001",
      sessionNo: 1,
      deliveryMode: "in_person",
      location: "서울",
      startsAt: "2026-10-01T10:00:00.000Z",
      endsAt: "2026-10-01T09:00:00.000Z",
      capacity: 20,
      applicationOpensAt: "2026-09-01T00:00:00.000Z",
      applicationClosesAt: "2026-09-30T00:00:00.000Z",
      cancellationClosesAt: "2026-09-30T00:00:00.000Z",
    })).toThrow("종료 일시");
  });
});
