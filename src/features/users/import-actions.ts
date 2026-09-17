"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/features/auth/require-user";
import { getServerEnv } from "@/lib/server-env";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createUserAccount } from "./account-service";
import { createAccountDependencies } from "./account-repository";
import { parseUserWorkbook, type UserImportError } from "./import-schema";
import {
  initialUserImportState,
  type UserImportActionState,
} from "./import-state";

const managers = ["system_admin", "education_manager"] as const;

export async function userImportAction(
  _previousState: UserImportActionState,
  formData: FormData,
): Promise<UserImportActionState> {
  const actor = await requireUser(managers);
  const file = formData.get("file");
  const intent = formData.get("intent") === "import" ? "import" : "preview";

  if (!(file instanceof File) || file.size === 0 || file.size > 5 * 1024 * 1024) {
    return {
      ...initialUserImportState,
      status: "error",
      errors: [{ rowNumber: 1, field: "file", message: "5MB 이하 파일을 선택해 주세요." }],
    };
  }

  const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  const supabase = createAdminSupabaseClient();
  const { data: departments, error: departmentError } = await supabase
    .from("departments")
    .select("id,name")
    .eq("is_active", true);
  if (departmentError) {
    return {
      ...initialUserImportState,
      status: "error",
      errors: [{ rowNumber: 1, field: "department", message: "부서 정보를 불러오지 못했습니다." }],
    };
  }

  const departmentIdsByName = new Map(
    (departments ?? []).map((department) => [department.name, department.id]),
  );
  const preview = parseUserWorkbook(
    new Uint8Array(await file.arrayBuffer()),
    extension,
    { departmentIdsByName },
  );

  if (actor.role === "education_manager") {
    preview.validRows
      .filter((row) => row.role !== "participant")
      .forEach((row) => {
        preview.errors.push({
          rowNumber: preview.sourceRowNumbers[row.employeeNo] ?? 1,
          field: "role",
          message: "교육담당자는 참가자 계정만 등록할 수 있습니다.",
        });
      });
  }

  if (preview.validRows.length) {
    const { data: existingProfiles, error: existingError } = await supabase
      .from("profiles")
      .select("employee_no")
      .in(
        "employee_no",
        preview.validRows.map((row) => row.employeeNo),
      );
    if (existingError) {
      preview.errors.push({
        rowNumber: 1,
        field: "employeeNo",
        message: "기존 사번 중복 여부를 확인하지 못했습니다.",
      });
    } else {
      existingProfiles?.forEach((profile) => {
        preview.errors.push({
          rowNumber: preview.sourceRowNumbers[profile.employee_no] ?? 1,
          field: "employeeNo",
          message: `이미 등록된 사번입니다: ${profile.employee_no}`,
        });
      });
    }
  }

  if (preview.errors.length || intent === "preview") {
    return {
      ...initialUserImportState,
      status: preview.errors.length ? "error" : "ready",
      validCount: preview.validRows.length,
      errors: preview.errors,
    };
  }

  let createdCount = 0;
  const errors: UserImportError[] = [];
  const dependencies = createAccountDependencies();
  const authDomain = getServerEnv().INTERNAL_AUTH_EMAIL_DOMAIN;

  for (const input of preview.validRows) {
    try {
      await createUserAccount(
        dependencies,
        actor.role,
        input,
        preview.sourceEmployeeNumbers[input.employeeNo] ?? input.employeeNo,
        authDomain,
      );
      createdCount += 1;
    } catch (error) {
      errors.push({
        rowNumber: preview.sourceRowNumbers[input.employeeNo] ?? 1,
        field: "employeeNo",
        message: `${input.employeeNo}: ${error instanceof Error ? error.message : "생성 실패"}`,
      });
    }
  }

  revalidatePath("/admin/users");
  return {
    status: "complete",
    validCount: preview.validRows.length,
    errors,
    createdCount,
    failedCount: errors.length,
  };
}
