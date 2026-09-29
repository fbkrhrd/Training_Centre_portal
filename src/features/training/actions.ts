"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/features/auth/require-user";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { courseInputSchema } from "./course-schema";
import { sessionInputSchema } from "./session-schema";
import { assertCourseCanBeDeleted, assertCourseManagementAccess } from "./course-service";
import { assertSessionStatusChangeAccess, assertSessionStatusTransition, type SessionStatus } from "./session-service";

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

export async function deleteCourseAction(formData: FormData) {
  const user = await requireUser(managers);
  const courseId = z.string().uuid().parse(String(formData.get("courseId") ?? ""));
  const supabase = createAdminSupabaseClient();

  await assertCourseManagementAccess({
    async isAssignedManager(targetCourseId, userId) {
      const { data } = await supabase
        .from("course_managers")
        .select("course_id")
        .eq("course_id", targetCourseId)
        .eq("manager_id", userId)
        .maybeSingle();
      return Boolean(data);
    },
  }, user.role, courseId, user.id);

  const { count, error: sessionError } = await supabase
    .from("course_sessions")
    .select("id", { count: "exact", head: true })
    .eq("course_id", courseId);
  if (sessionError) throw sessionError;
  assertCourseCanBeDeleted(count ?? 0);

  const { data: deletedCourse, error: deleteError } = await supabase
    .from("courses")
    .delete()
    .eq("id", courseId)
    .select("id")
    .maybeSingle();
  if (deleteError || !deletedCourse) throw deleteError ?? new Error("교육과정을 찾을 수 없습니다.");

  revalidatePath("/admin/courses");
  revalidatePath("/admin/sessions");
  revalidatePath("/courses");
  revalidatePath("/");
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

export async function updateSessionStatusAction(formData: FormData) {
  const user = await requireUser(managers);
  const sessionId = String(formData.get("sessionId") ?? "");
  const target = String(formData.get("status") ?? "") as SessionStatus;
  if (!sessionId) throw new Error("차수를 찾을 수 없습니다.");
  const supabase = createAdminSupabaseClient();
  const { data: session, error } = await supabase
    .from("course_sessions")
    .select("course_id,status,starts_at,ends_at,application_opens_at,application_closes_at,cancellation_closes_at")
    .eq("id", sessionId)
    .single();
  if (error || !session) throw new Error("차수를 찾을 수 없습니다.");
  await assertSessionStatusChangeAccess({
    async isAssignedManager(courseId, userId) {
      const { data } = await supabase.from("course_managers").select("course_id").eq("course_id", courseId).eq("manager_id", userId).maybeSingle();
      return Boolean(data);
    },
  }, user.role, session.course_id, user.id);
  const status = assertSessionStatusTransition(
    session.status as SessionStatus,
    target,
    Boolean(session.starts_at && session.ends_at && session.application_opens_at && session.application_closes_at && session.cancellation_closes_at),
  );
  const { error: updateError } = await supabase.from("course_sessions").update({ status }).eq("id", sessionId);
  if (updateError) throw updateError;
  revalidatePath("/admin/sessions"); revalidatePath("/courses"); revalidatePath("/");
}
