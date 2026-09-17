import { describe, expect, it } from "vitest";
import { normalizeLocale } from "@/i18n/locale";

describe("normalizeLocale", () => {
  it.each([
    ["ko", "ko"],
    ["ko-KR", "ko"],
    ["en-US", "en"],
    [undefined, "ko"],
  ])("normalizes %s to %s", (input, expected) => {
    expect(normalizeLocale(input)).toBe(expected);
  });
});
