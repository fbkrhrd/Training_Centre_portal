import { describe, expect, it } from "vitest";
import { requireSupabaseData } from "./data-access";

describe("requireSupabaseData", () => {
  it("returns successful Supabase data", () => {
    expect(
      requireSupabaseData({ data: [{ id: "1" }], error: null }, "courses"),
    ).toEqual([{ id: "1" }]);
  });

  it("throws a safe portal error when Supabase returns an error", () => {
    expect(() =>
      requireSupabaseData(
        { data: null, error: { message: "SUPABASE_SECRET_KEY=leak" } },
        "courses",
      ),
    ).toThrow("데이터를 불러오지 못했습니다");
  });
});
