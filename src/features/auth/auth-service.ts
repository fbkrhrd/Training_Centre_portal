import { employeeNoToAuthEmail } from "./auth-email";

export type PasswordAuthClient = {
  signInWithPassword(input: { email: string; password: string }): Promise<{
    data: unknown;
    error: { message: string } | null;
  }>;
};

export async function authenticateEmployee(
  auth: PasswordAuthClient,
  input: { employeeNo: string; password: string },
  domain: string,
) {
  const result = await auth.signInWithPassword({
    email: employeeNoToAuthEmail(input.employeeNo, domain),
    password: input.password,
  });

  if (result.error) {
    throw new Error("사번 또는 비밀번호를 확인해 주세요.");
  }

  return result.data;
}
