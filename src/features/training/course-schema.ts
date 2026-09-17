import { z } from "zod";

export const courseInputSchema = z.object({
  titleKo: z.string().trim().min(1).max(200),
  titleEn: z.string().trim().min(1).max(200),
  categoryId: z.preprocess(
    (value) => (typeof value === "string" && !value.trim() ? undefined : value),
    z.string().uuid().optional(),
  ),
  descriptionKo: z.preprocess((value) => typeof value === "string" && !value.trim() ? undefined : value, z.string().trim().max(5000).optional()),
  descriptionEn: z.preprocess((value) => typeof value === "string" && !value.trim() ? undefined : value, z.string().trim().max(5000).optional()),
  isPublished: z.preprocess((value) => value === true || value === "true", z.boolean()),
});

export type CourseInput = z.infer<typeof courseInputSchema>;
