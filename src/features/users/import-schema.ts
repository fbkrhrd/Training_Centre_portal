import * as XLSX from "xlsx";
import type { AppRole } from "@/features/auth/types";
import { userInputSchema, type UserInput } from "./user-schema";

const headers = [
  "사번",
  "이름",
  "부서",
  "이메일",
  "재직상태",
  "직급",
  "직책",
  "휴대전화",
  "입사일",
  "역할",
  "언어",
] as const;

type ImportRow = Record<(typeof headers)[number], unknown>;

export type UserImportError = {
  rowNumber: number;
  field: string;
  message: string;
};

export type UserImportPreview = {
  validRows: UserInput[];
  errors: UserImportError[];
  sourceEmployeeNumbers: Record<string, string>;
  sourceRowNumbers: Record<string, number>;
};

type ParseOptions = {
  departmentIdsByName?: ReadonlyMap<string, string>;
};

function text(value: unknown) {
  return value == null ? "" : String(value).trim();
}

function parseStatus(value: unknown) {
  const normalized = text(value).toLowerCase();
  return normalized === "비활성" || normalized === "inactive"
    ? "inactive"
    : "active";
}

function parseRole(value: unknown): AppRole | string {
  const normalized = text(value).toLowerCase();
  const roles: Record<string, AppRole> = {
    참가자: "participant",
    participant: "participant",
    교육담당자: "education_manager",
    education_manager: "education_manager",
    "education manager": "education_manager",
    "시스템 관리자": "system_admin",
    system_admin: "system_admin",
    "system administrator": "system_admin",
  };
  return roles[normalized] ?? normalized;
}

export function parseUserWorkbook(
  buffer: Buffer | Uint8Array,
  extension: string,
  options: ParseOptions = {},
): UserImportPreview {
  if (!new Set([".csv", ".xlsx"]).has(extension.toLowerCase())) {
    return {
      validRows: [],
      errors: [{ rowNumber: 1, field: "file", message: "CSV 또는 XLSX 파일만 허용됩니다." }],
      sourceEmployeeNumbers: {},
      sourceRowNumbers: {},
    };
  }

  const workbook =
    extension.toLowerCase() === ".csv"
      ? XLSX.read(new TextDecoder("utf-8").decode(buffer), {
          type: "string",
          raw: false,
        })
      : XLSX.read(buffer, { type: "buffer", raw: false });
  const firstSheet = workbook.SheetNames[0];
  const sheet = firstSheet ? workbook.Sheets[firstSheet] : undefined;
  if (!sheet) {
    return {
      validRows: [],
      errors: [{ rowNumber: 1, field: "file", message: "첫 번째 시트를 읽을 수 없습니다." }],
      sourceEmployeeNumbers: {},
      sourceRowNumbers: {},
    };
  }

  const rows = XLSX.utils.sheet_to_json<ImportRow>(sheet, {
    defval: "",
    raw: false,
  });
  const actualHeaders = XLSX.utils.sheet_to_json<string[]>(sheet, {
    header: 1,
    blankrows: false,
  })[0]?.map((value) => text(value).replace(/^\uFEFF/, ""));
  const missingHeaders = headers.filter((header) => !actualHeaders?.includes(header));
  if (missingHeaders.length) {
    return {
      validRows: [],
      errors: missingHeaders.map((header) => ({
        rowNumber: 1,
        field: "header",
        message: `필수 헤더가 없습니다: ${header}`,
      })),
      sourceEmployeeNumbers: {},
      sourceRowNumbers: {},
    };
  }

  const validRows: UserInput[] = [];
  const errors: UserImportError[] = [];
  const employeeNumbers = new Set<string>();
  const sourceEmployeeNumbers: Record<string, string> = {};
  const sourceRowNumbers: Record<string, number> = {};

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const departmentName = text(row.부서);
    const departmentId = departmentName
      ? options.departmentIdsByName?.get(departmentName)
      : undefined;

    if (departmentName && !departmentId) {
      errors.push({
        rowNumber,
        field: "department",
        message: `활성 부서를 찾을 수 없습니다: ${departmentName}`,
      });
    }

    const parsed = userInputSchema.safeParse({
      employeeNo: text(row.사번),
      fullName: text(row.이름),
      departmentId,
      companyEmail: text(row.이메일),
      employmentStatus: parseStatus(row.재직상태),
      grade: text(row.직급),
      jobTitle: text(row.직책),
      mobilePhone: text(row.휴대전화),
      hiredOn: text(row.입사일),
      role: parseRole(row.역할),
      preferredLocale: text(row.언어).toLowerCase() || "ko",
    });

    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        errors.push({
          rowNumber,
          field: String(issue.path[0] ?? "row"),
          message: issue.message,
        });
      });
      return;
    }

    if (employeeNumbers.has(parsed.data.employeeNo)) {
      errors.push({
        rowNumber,
        field: "employeeNo",
        message: "파일 안에 중복된 사번이 있습니다.",
      });
      return;
    }

    employeeNumbers.add(parsed.data.employeeNo);
    if (!departmentName || departmentId) {
      validRows.push(parsed.data);
      sourceEmployeeNumbers[parsed.data.employeeNo] = text(row.사번);
      sourceRowNumbers[parsed.data.employeeNo] = rowNumber;
    }
  });

  return {
    validRows,
    errors,
    sourceEmployeeNumbers,
    sourceRowNumbers,
  };
}
