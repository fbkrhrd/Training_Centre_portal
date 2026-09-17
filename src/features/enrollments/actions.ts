"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/features/auth/require-user";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { initialEnrollmentStatus } from "./enrollment-service";

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
