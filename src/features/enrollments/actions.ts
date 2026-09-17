"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/features/auth/require-user";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { initialEnrollmentStatus } from "./enrollment-service";
import { assertManagerEnrollmentAction, canCancelEnrollment } from "./enrollment-service";

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

export async function cancelEnrollmentAction(formData: FormData) {
  const user = await requireUser();
  const enrollmentId = String(formData.get("enrollmentId") ?? "");
  if (!enrollmentId) throw new Error("신청 정보를 찾을 수 없습니다.");
  const supabase = createAdminSupabaseClient();
  const { data: enrollment } = await supabase.from("enrollments").select("id,participant_id,status,session_id").eq("id", enrollmentId).single();
  if (!enrollment || enrollment.status === "cancelled") throw new Error("취소할 수 없는 신청입니다.");
  const { data: session } = await supabase.from("course_sessions").select("course_id,cancellation_closes_at").eq("id", enrollment.session_id).single();
  if (!session) throw new Error("차수를 찾을 수 없습니다.");
  const isParticipant = enrollment.participant_id === user.id;
  let isManager = user.role === "system_admin";
  if (!isParticipant && !isManager && user.role === "education_manager") {
    const { data } = await supabase.from("course_managers").select("course_id").eq("course_id", session.course_id).eq("manager_id", user.id).maybeSingle();
    isManager = Boolean(data);
  }
  if (!isParticipant && !isManager) throw new Error("취소 권한이 없습니다.");
  if (!canCancelEnrollment(isManager ? "manager" : "participant", new Date(session.cancellation_closes_at), new Date())) throw new Error("취소 기한이 지났습니다. 교육담당자에게 문의해 주세요.");
  const { error } = await supabase.from("enrollments").update({ status: "cancelled", cancellation_reason: isManager ? "교육담당자 취소" : "참가자 취소" }).eq("id", enrollmentId);
  if (error) throw error;
  revalidatePath("/my-learning"); revalidatePath("/admin/enrollments");
}
