"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/features/auth/require-user";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { initialEnrollmentStatus } from "./enrollment-service";
import { assertManagerEnrollmentAction } from "./enrollment-service";

export async function applyForSessionAction(formData: FormData) {
  const user = await requireUser(["participant", "education_manager", "system_admin"]);
  const sessionId = String(formData.get("sessionId") ?? "");
  if (!sessionId) throw new Error("차수를 찾을 수 없습니다.");
  const supabase = createAdminSupabaseClient();
  const { data: session, error } = await supabase.from("course_sessions").select("id,status,capacity,application_opens_at,application_closes_at").eq("id", sessionId).single();
  if (error || !session || session.status !== "open") throw new Error("신청할 수 없는 차수입니다.");
  const now = Date.now();
  if (now < Date.parse(session.application_opens_at) || now > Date.parse(session.application_closes_at)) throw new Error("신청 기간이 아닙니다.");
  const { count } = await supabase.from("enrollments").select("id", { count: "exact", head: true }).eq("session_id", sessionId).in("status", ["pending", "approved"]);
  const status = initialEnrollmentStatus(session.capacity, count ?? 0);
  const { error: insertError } = await supabase.from("enrollments").insert({ session_id: sessionId, participant_id: user.id, status });
  if (insertError) throw insertError;
  revalidatePath("/courses"); revalidatePath("/my-learning");
}

export async function decideEnrollmentAction(formData: FormData) {
  const user = await requireUser(["system_admin", "education_manager"]);
  const enrollmentId = String(formData.get("enrollmentId") ?? "");
  const target = formData.get("target");
  if (!enrollmentId || (target !== "approved" && target !== "rejected")) throw new Error("신청 상태를 확인해 주세요.");
  const supabase = createAdminSupabaseClient();
  const { data: enrollment, error } = await supabase.from("enrollments").select("id,status,session_id").eq("id", enrollmentId).single();
  if (error || !enrollment) throw new Error("신청 정보를 찾을 수 없습니다.");
  if (user.role === "education_manager") {
    const { data: session } = await supabase.from("course_sessions").select("course_id").eq("id", enrollment.session_id).single();
    const { data: assignment } = await supabase.from("course_managers").select("course_id").eq("course_id", session?.course_id ?? "").eq("manager_id", user.id).maybeSingle();
    if (!assignment) throw new Error("담당 교육과정의 신청만 처리할 수 있습니다.");
  }
  const status = assertManagerEnrollmentAction(enrollment.status, target);
  const { error: updateError } = await supabase.from("enrollments").update({ status, decided_at: new Date().toISOString(), decided_by: user.id }).eq("id", enrollmentId);
  if (updateError) throw updateError;
  revalidatePath("/admin/enrollments"); revalidatePath("/my-learning");
}
