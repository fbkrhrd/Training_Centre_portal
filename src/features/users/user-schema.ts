import { z } from "zod";
import { normalizeEmployeeNo } from "@/features/auth/auth-email";
import { appRoles } from "@/features/auth/types";

const optionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().max(100).optional(),
);

const optionalUuid = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().uuid().optional(),
);

const optionalDate = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.iso.date().optional(),
);

export const userInputSchema = z.object({
  employeeNo: z.string().transform(normalizeEmployeeNo),
  fullName: z.string().trim().min(1).max(100),
  departmentId: optionalUuid,
  companyEmail: z.email().transform((value) => value.trim().toLowerCase()),
  employmentStatus: z.enum(["active", "inactive"]).default("active"),
  grade: optionalText,
  jobTitle: optionalText,
  mobilePhone: optionalText,
  hiredOn: optionalDate,
  preferredLocale: z.enum(["ko", "en"]).default("ko"),
  role: z.enum(appRoles).default("participant"),
});

export type UserInput = z.infer<typeof userInputSchema>;

export const userProfileInputSchema = userInputSchema.omit({
  employeeNo: true,
  employmentStatus: true,
  role: true,
});

export type UserProfileInput = z.infer<typeof userProfileInputSchema>;
