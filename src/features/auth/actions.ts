"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getServerEnv } from "@/lib/server-env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { authenticateEmployee } from "./auth-service";
import type { AuthActionState } from "./action-state";
import { requireUser } from "./require-user";
import { updatePreferredLocale } from "./preference-service";

const loginSchema = z.object({
  employeeNo: z.string().trim().min(1),
  password: z.string().min(1),
});

const passwordSchema = z
  .object({
    password: z.string().min(8, "비밀번호는 8자 이상 입력해 주세요."),
    passwordConfirm: z.string(),
  })
  .refine((value) => value.password === value.passwordConfirm, {
    message: "비밀번호 확인이 일치하지 않습니다.",
    path: ["passwordConfirm"],
  });

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: "error", message: "사번과 비밀번호를 입력해 주세요." };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const env = getServerEnv();
    await authenticateEmployee(
      supabase.auth,
      parsed.data,
      env.INTERNAL_AUTH_EMAIL_DOMAIN,
    );
  } catch {
    return {
      status: "error",
      message: "사번 또는 비밀번호를 확인해 주세요.",
    };
  }

  redirect("/");
}

export async function logoutAction() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function updateLocaleAction(formData: FormData) {
  const user = await requireUser();
  const supabase = await createServerSupabaseClient();

  await updatePreferredLocale(
    {
      async saveLocale(userId, locale) {
        const { error } = await supabase
          .from("profiles")
          .update({ preferred_locale: locale })
          .eq("id", userId);
        if (error) throw error;
      },
    },
    user.id,
    formData.get("locale"),
  );

  revalidatePath("/", "layout");
}

export async function changePasswordAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = passwordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "입력값을 확인해 주세요.",
    };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { status: "error", message: "비밀번호를 변경하지 못했습니다." };
  }

  return { status: "success", message: "비밀번호를 변경했습니다." };
}
