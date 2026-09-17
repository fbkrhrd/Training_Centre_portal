"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/features/auth/require-user";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { courseInputSchema } from "./course-schema";
import { sessionInputSchema } from "./session-schema";
import { assertCourseManagementAccess } from "./course-service";

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

export async function createSessionAction(formData: FormData) {
  const user = await requireUser(managers);
  const input = sessionInputSchema.parse(Object.fromEntries(formData));
  const supabase = createAdminSupabaseClient();
  await assertCourseManagementAccess({
    async isAssignedManager(courseId, userId) {
      const { data } = await supabase.from("course_managers").select("course_id").eq("course_id", courseId).eq("manager_id", userId).maybeSingle();
      return Boolean(data);
    },
  }, user.role, input.courseId, user.id);
  const { error } = await supabase.from("course_sessions").insert({
    course_id: input.courseId, session_no: input.sessionNo, status: "draft", delivery_mode: input.deliveryMode,
    location: input.location ?? null, online_url: input.onlineUrl ?? null, starts_at: input.startsAt, ends_at: input.endsAt,
    capacity: input.capacity, application_opens_at: input.applicationOpensAt, application_closes_at: input.applicationClosesAt,
    cancellation_closes_at: input.cancellationClosesAt,
  });
  if (error) throw error;
  revalidatePath("/admin/sessions");
}
