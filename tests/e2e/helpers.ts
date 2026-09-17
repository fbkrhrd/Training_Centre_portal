import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Page } from "@playwright/test";
import type { AppRole } from "@/features/auth/types";

export type TestUser = {
  id: string;
  employeeNo: string;
  password: string;
  fullName: string;
};

export function createTestAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!secret) throw new Error("SUPABASE_SECRET_KEY is required for E2E tests.");
  return createClient(url, secret, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function seedTestUser(
  client: SupabaseClient,
  employeeNo: string,
  role: AppRole,
): Promise<TestUser> {
  const email = `${employeeNo.toLowerCase()}@auth.fbkr.internal`;
  const fullName = `E2E ${role}`;
  const { data, error } = await client.auth.admin.createUser({
    email,
    password: employeeNo,
    email_confirm: true,
    app_metadata: { role },
  });
  if (error || !data.user) throw error ?? new Error("E2E user creation failed");
  const { error: profileError } = await client.from("profiles").insert({
    id: data.user.id,
    employee_no: employeeNo.toLowerCase(),
    full_name: fullName,
    company_email: `${employeeNo.toLowerCase()}@example.com`,
    employment_status: "active",
    preferred_locale: "ko",
  });
  if (profileError) {
    await client.auth.admin.deleteUser(data.user.id);
    throw profileError;
  }
  return { id: data.user.id, employeeNo, password: employeeNo, fullName };
}

export async function removeTestUser(client: SupabaseClient, userId?: string) {
  if (!userId) return;
  await client.from("profiles").delete().eq("id", userId);
  await client.auth.admin.deleteUser(userId);
}

export async function signIn(page: Page, user: TestUser) {
  await page.goto("/login");
  await page.getByLabel("사번").fill(user.employeeNo);
  await page.getByLabel("비밀번호").fill(user.password);
  await page.getByRole("button", { name: "로그인" }).click();
  await page.waitForURL("/");
}
