"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/features/auth/require-user";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { courseInputSchema } from "./course-schema";

const managers = ["system_admin", "education_manager"] as const;

export async function createCourseAction(formData: FormData) {
  const user = await requireUser(managers);
  const input = courseInputSchema.parse(Object.fromEntries(formData));
  const supabase = createAdminSupabaseClient();
  const { data: course, error } = await supabase
    .from("courses")
    .insert({
      category_id: input.categoryId ?? null,
      title_ko: input.titleKo,
      title_en: input.titleEn,
      description_ko: input.descriptionKo ?? null,
      description_en: input.descriptionEn ?? null,
      is_published: input.isPublished,
      created_by: user.id,
    })
    .select("id")
    .single();
  if (error || !course) throw error ?? new Error("교육과정을 생성하지 못했습니다.");
  const { error: managerError } = await supabase.from("course_managers").insert({
    course_id: course.id,
    manager_id: user.id,
  });
  if (managerError) throw managerError;
  revalidatePath("/admin/courses");
}
