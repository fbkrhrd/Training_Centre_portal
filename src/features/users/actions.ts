"use server";

import { revalidatePath } from "next/cache";
import { getServerEnv } from "@/lib/server-env";
import { requireUser } from "@/features/auth/require-user";
import {
  createUserAccount,
  deactivateUserAccount,
  reactivateUserAccount,
  updateUserRole,
} from "./account-service";
import { createAccountDependencies } from "./account-repository";
import type { UserActionState } from "./action-state";
import { userInputSchema } from "./user-schema";
import { isAppRole } from "@/features/auth/types";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

const managers = ["system_admin", "education_manager"] as const;

export async function createUserAction(
  _previousState: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  const actor = await requireUser(managers);
  const raw = Object.fromEntries(formData);
  const parsed = userInputSchema.safeParse(raw);

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message };
  }

  try {
    await createUserAccount(
      createAccountDependencies(),
      actor.role,
      parsed.data,
      String(raw.employeeNo).trim(),
      getServerEnv().INTERNAL_AUTH_EMAIL_DOMAIN,
    );
    revalidatePath("/admin/users");
    return { status: "success", message: "사용자 계정을 생성했습니다." };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "계정을 생성하지 못했습니다.",
    };
  }
}

export async function setUserActiveAction(formData: FormData) {
  const actor = await requireUser(managers);
  const userId = String(formData.get("userId") ?? "");
  const active = formData.get("active") === "true";
  if (!userId) return;
  if (userId === actor.id) {
    throw new Error("본인 계정의 재직 상태는 변경할 수 없습니다.");
  }
  if (actor.role === "education_manager") {
    const { data, error } = await createAdminSupabaseClient().auth.admin.getUserById(
      userId,
    );
    if (error || data.user.app_metadata.role !== "participant") {
      throw new Error("교육담당자는 참가자 계정만 관리할 수 있습니다.");
    }
  }

  const dependencies = createAccountDependencies();
  if (active) {
    await reactivateUserAccount(dependencies, actor.role, userId);
  } else {
    await deactivateUserAccount(dependencies, actor.role, userId);
  }
  revalidatePath("/admin/users");
}

export async function updateUserRoleAction(formData: FormData) {
  const actor = await requireUser(["system_admin"]);
  const userId = String(formData.get("userId") ?? "");
  const role = formData.get("role");
  if (!userId || !isAppRole(role)) return;
  await updateUserRole(createAccountDependencies(), actor.role, userId, role);
  revalidatePath("/admin/users");
}
