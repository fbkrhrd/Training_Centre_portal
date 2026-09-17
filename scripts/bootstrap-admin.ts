import { createAccountDependencies } from "@/features/users/account-repository";
import { createUserAccount } from "@/features/users/account-service";
import { userInputSchema } from "@/features/users/user-schema";
import { getServerEnv } from "@/lib/server-env";

const employeeNo = process.env.BOOTSTRAP_EMPLOYEE_NO;
const fullName = process.env.BOOTSTRAP_FULL_NAME;
const companyEmail = process.env.BOOTSTRAP_COMPANY_EMAIL;

if (!employeeNo || !fullName || !companyEmail) {
  throw new Error(
    "BOOTSTRAP_EMPLOYEE_NO, BOOTSTRAP_FULL_NAME, BOOTSTRAP_COMPANY_EMAIL이 필요합니다.",
  );
}

const input = userInputSchema.parse({
  employeeNo,
  fullName,
  companyEmail,
  employmentStatus: "active",
  role: "system_admin",
  preferredLocale: "ko",
});

await createUserAccount(
  createAccountDependencies(),
  "system_admin",
  input,
  employeeNo,
  getServerEnv().INTERNAL_AUTH_EMAIL_DOMAIN,
);

console.log(`Bootstrap administrator created: ${input.employeeNo}`);
