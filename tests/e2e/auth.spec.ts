import { expect, test } from "@playwright/test";
import {
  createTestAdminClient,
  removeTestUser,
  seedTestUser,
  signIn,
  type TestUser,
} from "./helpers";

const adminClient = createTestAdminClient();
let participant: TestUser;
let administrator: TestUser;

test.beforeAll(async () => {
  participant = await seedTestUser(adminClient, "E2EPART01", "participant");
  administrator = await seedTestUser(adminClient, "E2EADMIN01", "system_admin");
});

test.afterAll(async () => {
  await Promise.all([
    removeTestUser(adminClient, participant?.id),
    removeTestUser(adminClient, administrator?.id),
  ]);
});

test("redirects unauthenticated users to login", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);
});

test("shows participant navigation without account administration", async ({ page }) => {
  await signIn(page, participant);
  await expect(page.getByText("홈 대시보드")).toBeVisible();
  await expect(page.getByText("사용자 계정")).toHaveCount(0);
});

test("shows account administration to a system administrator", async ({ page }) => {
  await signIn(page, administrator);
  await expect(page.getByText("사용자 계정")).toBeVisible();
});
