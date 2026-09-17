import { describe, expect, it } from "vitest";
import { courseInputSchema } from "./course-schema";

describe("courseInputSchema", () => {
  it("accepts a bilingual course with an optional category", () => {
    expect(courseInputSchema.parse({
      titleKo: "신임 리더 교육",
      titleEn: "New Leader Program",
      categoryId: "",
      isPublished: "true",
    })).toMatchObject({ titleKo: "신임 리더 교육", isPublished: true });
  });

  it("rejects a course without an English title", () => {
    expect(() => courseInputSchema.parse({ titleKo: "교육", titleEn: "" })).toThrow();
  });
});
