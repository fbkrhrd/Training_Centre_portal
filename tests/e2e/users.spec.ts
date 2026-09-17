import { expect, test } from "@playwright/test";
import {
  createTestAdminClient,
  removeTestUser,
  seedTestUser,
  signIn,
  type TestUser,
} from "./helpers";

const adminClient = createTestAdminClient();
let administrator: TestUser;
let createdUserId: string | undefined;

test.beforeAll(async () => {
  administrator = await seedTestUser(adminClient, "E2EADMIN02", "system_admin");
});

test.afterAll(async () => {
  await Promise.all([
    removeTestUser(adminClient, createdUserId),
    removeTestUser(adminClient, administrator?.id),
  ]);
});

test("creates and deactivates an employee account", async ({ page }) => {
  await signIn(page, administrator);
  await page.goto("/admin/users");
  await page.getByLabel("사번").fill("E2ENEW01");
  await page.getByLabel("이름").fill("E2E 신규 사용자");
  await page.getByLabel("회사 이메일").fill("e2enew01@example.com");
  await page.getByRole("button", { name: "계정 생성" }).click();

  const row = page.getByRole("row").filter({ hasText: "e2enew01" });
  await expect(row).toBeVisible();
  await row.getByRole("button", { name: "비활성화" }).click();
  await expect(row).toContainText("비활성");

  const { data } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 });
  createdUserId = data.users.find(
    (user) => user.email === "e2enew01@auth.fbkr.internal",
  )?.id;
});
