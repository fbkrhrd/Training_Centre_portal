# FBKR Portal Foundation and Authentication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a deployable FBKR Learning Centre Portal foundation with the approved visual system, local Supabase schema, employee-number login, role-protected application shell, and administrator user management including Excel·CSV import.

**Architecture:** Use Next.js 16.3 App Router on Node.js 22 with Server Components by default and focused client components for forms. Supabase provides Auth and PostgreSQL; browser access uses a publishable key with RLS, while account provisioning uses a server-only admin client. Employee numbers map deterministically to internal auth emails, while real company email addresses remain profile data for notifications.

**Tech Stack:** Next.js 16.3.3, React, TypeScript 5, Tailwind CSS, Supabase JS, Supabase SSR, Zod, Vitest, Testing Library, Playwright, SheetJS, pnpm, Node.js 22

**Spec:** `docs/superpowers/specs/2026-09-17-fbkr-learning-centre-portal-design.md`

## Global Constraints

- Use `차수`, never `기수`, in application copy, identifiers, comments, and documentation.
- Service name is `FBKR Learning Centre Portal`.
- Support Korean and English; save the user's language preference.
- Use Arial for all interface text.
- Use `#01916D`, `#34A78A`, `#67BDA7`, `#CCE9E2`, and `#014937` as the primary palette.
- Use `#FB0020` only for errors, failures, and urgent states.
- Support current desktop and mobile browsers with responsive layouts.
- Never expose a Supabase secret key, service role key, OpenAI key, Microsoft credential, or cron secret to browser code.
- Enable RLS on every table in the exposed `public` schema and explicitly grant only required Data API access.
- Store authorization roles in `auth.users.raw_app_meta_data`, never user-editable metadata.
- Pin installed package versions and commit `pnpm-lock.yaml`.
- Run automated database tests against local Supabase, never the shared hosted project.
- Preview deployments remain connected to the shared hosted Supabase project only after local and CI tests pass.

## Project Roadmap

The approved design contains four independently reviewable subprojects. This plan implements Phase 1 only; each later phase receives its own implementation plan after the preceding phase is accepted.

1. **Foundation, authentication, user management** — this plan
2. **Course, session, enrollment operations** — categories, courses, single-schedule sessions, approval, assignment, waitlist, cancellation
3. **Attendance, completion, certificates** — QR/code attendance, status corrections, completion rules, PDF generation
4. **Notifications and operations** — Microsoft 365 adapter, OpenAI translation, materials, historical completion import, exports, cron, audit retention

## File Structure

```text
src/
  app/
    (auth)/login/page.tsx                 employee-number login page
    (portal)/layout.tsx                   authenticated shell
    (portal)/page.tsx                     role-aware landing page
    (portal)/admin/users/page.tsx         account management page
    api/health/route.ts                   deployment health endpoint
    globals.css                           approved tokens and responsive base styles
    layout.tsx                            root metadata, Arial stack, locale shell
  components/
    shell/app-header.tsx                  FUJIFILM-styled header and locale control
    shell/app-sidebar.tsx                 role-aware navigation
    ui/                                   small reusable controls only
  features/
    auth/
      actions.ts                          login, logout, password change actions
      auth-email.ts                       employee number to internal email mapping
      auth-email.test.ts                  mapping tests
      require-user.ts                     authenticated user and role guard
    users/
      actions.ts                          create, update, deactivate account actions
      import-schema.ts                    workbook row parsing and validation
      import-schema.test.ts               importer unit tests
      user-form.tsx                       individual account form
      user-import.tsx                     Excel·CSV import workflow
  i18n/
    dictionaries.ts                       typed Korean and English messages
    locale.ts                             locale parsing and persistence
  lib/
    env.ts                                validated public and server environment
    supabase/client.ts                    browser Supabase client
    supabase/server.ts                    cookie-backed server client
    supabase/admin.ts                     server-only admin client
  test/
    setup.ts                              Vitest DOM setup
supabase/
  config.toml                             local Supabase configuration
  migrations/                             CLI-generated SQL migrations
  tests/database/foundation_auth.test.sql pgTAP schema and RLS tests
tests/e2e/
  auth.spec.ts                            login and role-routing flow
  users.spec.ts                           account create and deactivate flow
scripts/
  bootstrap-admin.ts                      initial system administrator provisioning
.env.example                              variable names without secrets
playwright.config.ts
vitest.config.ts
```

---

### Task 1: Scaffold the Next.js application and test harness

**Files:**
- Create: `package.json`
- Create: `pnpm-lock.yaml`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `eslint.config.mjs`
- Create: `postcss.config.mjs`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Create: `src/test/setup.ts`
- Create: `.env.example`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: Node.js 22 and pnpm from the development environment.
- Produces: `pnpm dev`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:db`, `pnpm test:e2e`, and `pnpm build` commands used by every later task.

- [ ] **Step 1: Verify the runtime and generate the application**

Run:

```powershell
node --version
pnpm --version
pnpm create next-app@16.3.3 . --ts --eslint --tailwind --app --src-dir --import-alias "@/*" --use-pnpm
```

Expected: Node reports major version 22 and Next.js creates an App Router project in the repository root without replacing `docs/` or `.gitignore`.

- [ ] **Step 2: Install exact runtime and test dependencies**

Run:

```powershell
pnpm add --save-exact @supabase/supabase-js @supabase/ssr zod server-only xlsx
pnpm add --save-exact -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @playwright/test supabase tsx
```

Expected: `package.json` stores exact versions and `pnpm-lock.yaml` changes.

- [ ] **Step 3: Add the initial failing environment test**

Create `src/lib/env.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { parsePublicEnv } from "@/lib/env";

describe("parsePublicEnv", () => {
  it("rejects a missing Supabase URL", () => {
    expect(() =>
      parsePublicEnv({ NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test" }),
    ).toThrow("NEXT_PUBLIC_SUPABASE_URL");
  });
});
```

- [ ] **Step 4: Run the test and verify failure**

Run: `pnpm vitest run src/lib/env.test.ts`

Expected: FAIL because `@/lib/env` does not exist.

- [ ] **Step 5: Add scripts, test configuration, and minimal environment parser**

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:db": "supabase test db",
    "test:e2e": "playwright test"
  }
}
```

Create `src/lib/env.ts`:

```ts
import { z } from "zod";

const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
});

export function parsePublicEnv(input: Record<string, string | undefined>) {
  return publicSchema.parse(input);
}

export const publicEnv = parsePublicEnv({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
});
```

Configure Vitest for `jsdom`, `@/*` path aliases, and `src/test/setup.ts`. Configure Playwright to start `pnpm dev` on port 3000. Add these names to `.env.example`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
INTERNAL_AUTH_EMAIL_DOMAIN=auth.fbkr.internal
```

- [ ] **Step 6: Verify the project foundation**

Run:

```powershell
pnpm test
pnpm lint
pnpm typecheck
pnpm build
```

Expected: all commands exit 0.

- [ ] **Step 7: Commit**

```powershell
git add package.json pnpm-lock.yaml next.config.ts tsconfig.json eslint.config.mjs postcss.config.mjs vitest.config.ts playwright.config.ts src/test src/lib/env.ts src/lib/env.test.ts .env.example .gitignore
git commit -m "chore: scaffold portal application"
```

---

### Task 2: Build the approved visual foundation and bilingual shell

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`
- Create: `src/i18n/dictionaries.ts`
- Create: `src/i18n/locale.ts`
- Create: `src/i18n/locale.test.ts`
- Create: `src/components/shell/app-header.tsx`
- Create: `src/components/shell/app-sidebar.tsx`
- Create: `src/components/shell/app-shell.tsx`
- Create: `src/components/shell/app-shell.test.tsx`

**Interfaces:**
- Consumes: Next.js App Router and Tailwind from Task 1.
- Produces: `Locale`, `Dictionary`, `getDictionary(locale)`, `AppShell`, and CSS design tokens consumed by all pages.

- [ ] **Step 1: Write failing locale tests**

Create `src/i18n/locale.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { normalizeLocale } from "@/i18n/locale";

describe("normalizeLocale", () => {
  it.each([
    ["ko", "ko"],
    ["ko-KR", "ko"],
    ["en-US", "en"],
    [undefined, "ko"],
  ])("normalizes %s to %s", (input, expected) => {
    expect(normalizeLocale(input)).toBe(expected);
  });
});
```

- [ ] **Step 2: Verify the locale test fails**

Run: `pnpm vitest run src/i18n/locale.test.ts`

Expected: FAIL because the locale module does not exist.

- [ ] **Step 3: Implement the typed dictionary and locale normalizer**

Create `src/i18n/locale.ts`:

```ts
export type Locale = "ko" | "en";

export function normalizeLocale(value?: string): Locale {
  return value?.toLowerCase().startsWith("en") ? "en" : "ko";
}
```

Create `src/i18n/dictionaries.ts` with matching Korean and English keys:

```ts
import type { Locale } from "./locale";

const dictionaries = {
  ko: {
    serviceName: "FBKR Learning Centre Portal",
    dashboard: "홈 대시보드",
    users: "사용자 계정",
    signOut: "로그아웃",
  },
  en: {
    serviceName: "FBKR Learning Centre Portal",
    dashboard: "Dashboard",
    users: "User Accounts",
    signOut: "Sign out",
  },
} as const;

export type Dictionary = {
  [Key in keyof (typeof dictionaries)["ko"]]: string;
};
export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
```

- [ ] **Step 4: Write the failing shell rendering test**

Create `src/components/shell/app-shell.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppShell } from "./app-shell";

describe("AppShell", () => {
  it("renders the approved service name and navigation", () => {
    render(
      <AppShell locale="ko" role="system_admin">
        <p>content</p>
      </AppShell>,
    );
    expect(screen.getByText("FBKR Learning Centre Portal")).toBeInTheDocument();
    expect(screen.getByText("홈 대시보드")).toBeInTheDocument();
    expect(screen.getByText("사용자 계정")).toBeInTheDocument();
  });
});
```

- [ ] **Step 5: Implement the shell and approved design tokens**

Define these CSS variables in `src/app/globals.css` and set the global font stack:

```css
:root {
  --fbkr-green-700: #014937;
  --fbkr-green-600: #01916d;
  --fbkr-green-500: #34a78a;
  --fbkr-green-300: #67bda7;
  --fbkr-green-100: #cce9e2;
  --fbkr-red: #fb0020;
  --fbkr-ink: #333333;
  --fbkr-gray: #858585;
  --fbkr-line: #d6d6d6;
  --fbkr-paper: #ffffff;
}

html, body, button, input, select, textarea {
  font-family: Arial, Helvetica, sans-serif;
}
```

Implement `AppHeader`, `AppSidebar`, and `AppShell` with a white canvas, thin dark rules, a narrow green gradient brand line, responsive mobile navigation, and red reserved for failure states. Navigation accepts `role: "system_admin" | "education_manager" | "participant"` and hides administrator links from other roles.

- [ ] **Step 6: Verify shell behavior and visual foundation**

Run:

```powershell
pnpm vitest run src/i18n/locale.test.ts src/components/shell/app-shell.test.tsx
pnpm lint
pnpm typecheck
```

Expected: all commands exit 0.

- [ ] **Step 7: Commit**

```powershell
git add src/app src/components/shell src/i18n
git commit -m "feat: add FBKR bilingual application shell"
```

---

### Task 3: Create the local Supabase schema and RLS contract

**Files:**
- Create: `supabase/config.toml`
- Create via CLI: migration named `foundation_auth`
- Create: `supabase/tests/database/foundation_auth.test.sql`

**Interfaces:**
- Consumes: the locally pinned Supabase CLI discovered with `pnpm exec supabase --help` and `pnpm exec supabase migration new --help`.
- Produces: `public.departments`, `public.profiles`, `public.user_role`, `public.employment_status`, and RLS policies used by all server and browser features.

- [ ] **Step 1: Discover the installed CLI and initialize local Supabase**

Run:

```powershell
pnpm exec supabase --version
pnpm exec supabase --help
pnpm exec supabase init
pnpm exec supabase start
```

Expected: the locally pinned CLI reports its version and starts the local API, database, and Studio.

- [ ] **Step 2: Create the migration with the CLI**

Run:

```powershell
pnpm exec supabase migration new foundation_auth
```

Expected: the CLI prints the exact new SQL file path under `supabase/migrations/`. Use that generated file for every SQL statement in this task.

- [ ] **Step 3: Write failing pgTAP schema assertions**

Create `supabase/tests/database/foundation_auth.test.sql`:

```sql
begin;
select plan(8);

select has_table('public', 'departments', 'departments exists');
select has_table('public', 'profiles', 'profiles exists');
select has_column('public', 'profiles', 'employee_no', 'employee number exists');
select has_column('public', 'profiles', 'preferred_locale', 'locale exists');
select col_is_unique('public', 'profiles', 'employee_no', 'employee number is unique');
select policies_are('public', 'profiles', array[
  'profiles_select_self_or_staff',
  'profiles_update_own_locale'
]);
select table_privs_are('authenticated', 'public', 'departments', array['SELECT']);
select table_privs_are('anon', 'public', 'profiles', array[]::text[]);

select * from finish();
rollback;
```

- [ ] **Step 4: Verify the database test fails**

Run: `pnpm exec supabase test db`

Expected: FAIL because the tables and policies do not exist.

- [ ] **Step 5: Implement schema, grants, and RLS in the generated migration**

Add enums and tables with these exact public interfaces:

```sql
create type public.user_role as enum (
  'system_admin',
  'education_manager',
  'participant'
);

create type public.employment_status as enum ('active', 'inactive');

create table public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete restrict,
  employee_no text not null unique check (employee_no ~ '^[A-Za-z0-9_-]{3,32}$'),
  full_name text not null,
  department_id uuid references public.departments(id) on delete set null,
  company_email text not null,
  employment_status public.employment_status not null default 'active',
  grade text,
  job_title text,
  mobile_phone text,
  hired_on date,
  preferred_locale text not null default 'ko' check (preferred_locale in ('ko', 'en')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Enable RLS on both tables. Grant authenticated users `SELECT` on departments and profiles, and grant only `UPDATE(preferred_locale)` on profiles. Create `profiles_select_self_or_staff` using `auth.uid() = id` or `auth.jwt() -> 'app_metadata' ->> 'role' in ('system_admin','education_manager')`. Create `profiles_update_own_locale` with both `using` and `with check` restricted to `auth.uid() = id`. Revoke all access from `anon`.

- [ ] **Step 6: Verify schema and advisors**

Run:

```powershell
pnpm exec supabase db reset
pnpm exec supabase test db
pnpm exec supabase db advisors
pnpm exec supabase migration list --local
```

Expected: pgTAP passes, advisors show no security errors introduced by the migration, and the migration appears in local history.

- [ ] **Step 7: Commit**

```powershell
git add supabase
git commit -m "feat: add account schema and RLS"
```

---

### Task 4: Implement Supabase clients and employee-number identity mapping

**Files:**
- Modify: `src/lib/env.ts`
- Modify: `src/lib/env.test.ts`
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/admin.ts`
- Create: `src/features/auth/auth-email.ts`
- Create: `src/features/auth/auth-email.test.ts`

**Interfaces:**
- Consumes: environment names from Task 1 and database contract from Task 3.
- Produces: `createBrowserSupabaseClient()`, `createServerSupabaseClient()`, `createAdminSupabaseClient()`, `normalizeEmployeeNo()`, and `employeeNoToAuthEmail()`.

- [ ] **Step 1: Write failing identity mapping tests**

Create `src/features/auth/auth-email.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { employeeNoToAuthEmail, normalizeEmployeeNo } from "./auth-email";

describe("employee number identity", () => {
  it("preserves leading zeroes and normalizes case", () => {
    expect(normalizeEmployeeNo(" 00Ab-12 ")).toBe("00ab-12");
  });

  it("maps to the internal auth domain", () => {
    expect(employeeNoToAuthEmail("A1024", "auth.fbkr.internal")).toBe(
      "a1024@auth.fbkr.internal",
    );
  });

  it("rejects unsafe identifiers", () => {
    expect(() => normalizeEmployeeNo("A 1024")).toThrow("사번 형식");
  });
});
```

- [ ] **Step 2: Verify the identity tests fail**

Run: `pnpm vitest run src/features/auth/auth-email.test.ts`

Expected: FAIL because `auth-email.ts` does not exist.

- [ ] **Step 3: Implement identity mapping**

Create `src/features/auth/auth-email.ts`:

```ts
const employeeNoPattern = /^[a-z0-9_-]{3,32}$/;

export function normalizeEmployeeNo(value: string): string {
  const normalized = value.trim().toLowerCase();
  if (!employeeNoPattern.test(normalized)) {
    throw new Error("사번 형식이 올바르지 않습니다.");
  }
  return normalized;
}

export function employeeNoToAuthEmail(employeeNo: string, domain: string): string {
  return `${normalizeEmployeeNo(employeeNo)}@${domain}`;
}
```

- [ ] **Step 4: Implement public and server environment schemas**

Extend `src/lib/env.ts` with a server-only schema containing:

```ts
const serverSchema = publicSchema.extend({
  SUPABASE_SECRET_KEY: z.string().min(1),
  INTERNAL_AUTH_EMAIL_DOMAIN: z.string().min(1).default("auth.fbkr.internal"),
});
```

Export a `parseServerEnv` function for tests. Keep the parsed secret object in a `server-only` module path so it cannot enter the browser bundle.

- [ ] **Step 5: Implement Supabase client factories**

Use `createBrowserClient` for `client.ts`, cookie-backed `createServerClient` for `server.ts`, and `createClient` from `@supabase/supabase-js` with `auth: { autoRefreshToken: false, persistSession: false }` for `admin.ts`. Import `server-only` at the top of `admin.ts`.

- [ ] **Step 6: Verify clients and mapping**

Run:

```powershell
pnpm vitest run src/lib/env.test.ts src/features/auth/auth-email.test.ts
pnpm lint
pnpm typecheck
```

Expected: all commands exit 0.

- [ ] **Step 7: Commit**

```powershell
git add src/lib src/features/auth/auth-email.ts src/features/auth/auth-email.test.ts
git commit -m "feat: add Supabase clients and employee identity mapping"
```

---

### Task 5: Implement login, logout, password change, and protected routing

**Files:**
- Create: `src/features/auth/actions.ts`
- Create: `src/features/auth/actions.test.ts`
- Create: `src/features/auth/require-user.ts`
- Create: `src/features/auth/require-user.test.ts`
- Create: `src/app/(auth)/login/page.tsx`
- Create: `src/app/(portal)/layout.tsx`
- Create: `src/app/(portal)/page.tsx`
- Create: `src/app/(portal)/account/password/page.tsx`
- Create: `src/proxy.ts`

**Interfaces:**
- Consumes: Supabase clients and employee identity mapping from Task 4, `AppShell` from Task 2.
- Produces: `loginAction`, `logoutAction`, `changePasswordAction`, `requireUser`, and authenticated role routing.

- [ ] **Step 1: Write failing login action tests**

Create `src/features/auth/actions.test.ts` using an injected auth client:

```ts
import { describe, expect, it, vi } from "vitest";
import { authenticateEmployee } from "./actions";

describe("authenticateEmployee", () => {
  it("signs in with the internal auth email", async () => {
    const signInWithPassword = vi.fn().mockResolvedValue({ data: {}, error: null });
    await authenticateEmployee(
      { signInWithPassword },
      { employeeNo: "A1024", password: "A1024" },
      "auth.fbkr.internal",
    );
    expect(signInWithPassword).toHaveBeenCalledWith({
      email: "a1024@auth.fbkr.internal",
      password: "A1024",
    });
  });
});
```

- [ ] **Step 2: Verify the action test fails**

Run: `pnpm vitest run src/features/auth/actions.test.ts`

Expected: FAIL because `authenticateEmployee` does not exist.

- [ ] **Step 3: Implement testable authentication functions and server actions**

Implement:

```ts
type PasswordAuthClient = {
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
  if (result.error) throw new Error("사번 또는 비밀번호를 확인해 주세요.");
  return result.data;
}
```

Wrap it with `loginAction(formData)`, redirect to `/` on success, and return a localized form error on failure. Add logout and authenticated password update actions.

- [ ] **Step 4: Implement `requireUser` and route protection**

Define:

```ts
export type AppRole = "system_admin" | "education_manager" | "participant";
export type CurrentUser = {
  id: string;
  role: AppRole;
  employeeNo: string;
  fullName: string;
  preferredLocale: "ko" | "en";
};
```

`requireUser(allowedRoles?)` validates the session with Supabase, reads the profile, rejects inactive accounts, and redirects unauthenticated users to `/login`. If the role is not allowed, redirect to `/`.

- [ ] **Step 5: Build login and protected pages**

The login page contains employee number and password inputs, a Korean/English switch, and the approved template styling. The portal layout calls `requireUser()`, renders `AppShell`, and shows role-specific navigation. The password page lets a signed-in user replace the initial password.

- [ ] **Step 6: Verify auth behavior**

Run:

```powershell
pnpm vitest run src/features/auth
pnpm lint
pnpm typecheck
pnpm build
```

Expected: all commands exit 0 and unauthenticated portal requests redirect to `/login`.

- [ ] **Step 7: Commit**

```powershell
git add src/features/auth src/app src/proxy.ts
git commit -m "feat: add employee login and protected portal"
```

---

### Task 6: Add administrator account provisioning and account lifecycle

**Files:**
- Create: `src/features/users/user-schema.ts`
- Create: `src/features/users/user-schema.test.ts`
- Create: `src/features/users/actions.ts`
- Create: `src/features/users/actions.test.ts`
- Create: `src/features/users/user-form.tsx`
- Create: `src/app/(portal)/admin/users/page.tsx`
- Create: `scripts/bootstrap-admin.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `createAdminSupabaseClient`, `employeeNoToAuthEmail`, `requireUser`, and the `profiles` schema.
- Produces: `UserInput`, `createUserAccount`, `updateUserProfile`, `deactivateUserAccount`, and `pnpm bootstrap:admin`.

- [ ] **Step 1: Write failing account validation tests**

Create `src/features/users/user-schema.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { userInputSchema } from "./user-schema";

describe("userInputSchema", () => {
  it("accepts the approved employee fields", () => {
    expect(
      userInputSchema.parse({
        employeeNo: "A1024",
        fullName: "홍길동",
        companyEmail: "hong@example.com",
        employmentStatus: "active",
        role: "participant",
        preferredLocale: "ko",
      }),
    ).toMatchObject({ employeeNo: "a1024", role: "participant" });
  });

  it("rejects a non-company email shape", () => {
    expect(() =>
      userInputSchema.parse({
        employeeNo: "A1024",
        fullName: "홍길동",
        companyEmail: "invalid",
        employmentStatus: "active",
        role: "participant",
        preferredLocale: "ko",
      }),
    ).toThrow();
  });
});
```

- [ ] **Step 2: Verify validation tests fail**

Run: `pnpm vitest run src/features/users/user-schema.test.ts`

Expected: FAIL because the schema does not exist.

- [ ] **Step 3: Implement schema and account service**

Define `UserInput` with employee number, name, department ID, company email, employment status, grade, job title, mobile phone, hired date, preferred locale, and role. `createUserAccount` must:

1. Require `system_admin` or `education_manager`.
2. Call `auth.admin.createUser` with internal auth email, password equal to the original employee number, `email_confirm: true`, and `app_metadata.role`.
3. Insert the `profiles` row.
4. Delete the newly created auth user if the profile insert fails.

`deactivateUserAccount` updates `profiles.employment_status` to `inactive`, bans or disables the Auth user through the admin API, and preserves the profile row.

- [ ] **Step 4: Add service tests with mocked admin APIs**

Create tests that prove profile failure removes the just-created Auth user, inactive accounts are disabled without deleting profiles, and role changes update `app_metadata`.

Run: `pnpm vitest run src/features/users`

Expected: PASS.

- [ ] **Step 5: Build account management UI**

Create a server-rendered user table with employee number, name, department, role, employment status, and email. Add search, role/status filters, individual creation, edit, deactivate, and reactivate actions. Do not render the internal auth email.

- [ ] **Step 6: Add initial administrator bootstrap script**

The script accepts environment values `BOOTSTRAP_EMPLOYEE_NO`, `BOOTSTRAP_FULL_NAME`, and `BOOTSTRAP_COMPANY_EMAIL`, calls the same account service, and assigns `system_admin`. Add:

```json
{
  "scripts": {
    "bootstrap:admin": "tsx scripts/bootstrap-admin.ts"
  }
}
```

- [ ] **Step 7: Verify account lifecycle**

Run:

```powershell
pnpm test
pnpm lint
pnpm typecheck
pnpm build
```

Expected: all commands exit 0.

- [ ] **Step 8: Commit**

```powershell
git add src/features/users src/app scripts package.json pnpm-lock.yaml
git commit -m "feat: add user account administration"
```

---

### Task 7: Add Excel and CSV account import

**Files:**
- Create: `src/features/users/import-schema.ts`
- Create: `src/features/users/import-schema.test.ts`
- Create: `src/features/users/import-actions.ts`
- Create: `src/features/users/user-import.tsx`
- Create: `src/app/(portal)/admin/users/import/page.tsx`
- Create: `tests/fixtures/users-valid.csv`
- Create: `tests/fixtures/users-invalid.csv`

**Interfaces:**
- Consumes: `UserInput` and `createUserAccount` from Task 6.
- Produces: `parseUserWorkbook(buffer, extension)`, `UserImportPreview`, and `executeUserImport(file)`.

- [ ] **Step 1: Write failing import parser tests**

Create `src/features/users/import-schema.test.ts`:

```ts
import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { parseUserWorkbook } from "./import-schema";

describe("parseUserWorkbook", () => {
  it("parses a valid CSV row", async () => {
    const file = await readFile("tests/fixtures/users-valid.csv");
    const result = parseUserWorkbook(file, ".csv");
    expect(result.validRows).toHaveLength(1);
    expect(result.validRows[0]?.employeeNo).toBe("a1024");
  });

  it("reports row number and field errors", async () => {
    const file = await readFile("tests/fixtures/users-invalid.csv");
    const result = parseUserWorkbook(file, ".csv");
    expect(result.errors[0]).toMatchObject({ rowNumber: 2, field: "companyEmail" });
  });
});
```

- [ ] **Step 2: Verify import tests fail**

Run: `pnpm vitest run src/features/users/import-schema.test.ts`

Expected: FAIL because the parser does not exist.

- [ ] **Step 3: Implement workbook parsing and validation**

Accept `.xlsx` and `.csv`. Map these exact headers:

```text
사번, 이름, 부서, 이메일, 재직상태, 직급, 직책, 휴대전화, 입사일, 역할, 언어
```

Return:

```ts
export type UserImportPreview = {
  validRows: UserInput[];
  errors: Array<{
    rowNumber: number;
    field: string;
    message: string;
  }>;
};
```

Reject duplicate employee numbers inside the file. Resolve department names to existing active departments during the server preview action. Never create accounts during preview.

- [ ] **Step 4: Implement preview and confirmed execution**

Keep the selected file in the browser until confirmation. Confirmation uploads the same file again; the server repeats the complete parse, header, department, duplicate, and field validation before it calls `createUserAccount`. Return created, skipped, and failed counts keyed by employee number. If validation differs from the preview, create no accounts and return the new row errors.

- [ ] **Step 5: Build the import UI**

Provide file selection, header guidance, valid/error counts, row-level error table, and a disabled confirmation button while any unresolved error exists. Provide a downloadable CSV of errors.

- [ ] **Step 6: Verify importer behavior**

Run:

```powershell
pnpm vitest run src/features/users/import-schema.test.ts
pnpm lint
pnpm typecheck
pnpm build
```

Expected: all commands exit 0.

- [ ] **Step 7: Commit**

```powershell
git add src/features/users src/app tests/fixtures
git commit -m "feat: add employee account import"
```

---

### Task 8: Add end-to-end coverage, health checks, and CI

**Files:**
- Create: `src/app/api/health/route.ts`
- Create: `tests/e2e/auth.spec.ts`
- Create: `tests/e2e/users.spec.ts`
- Create: `.github/workflows/ci.yml`
- Modify: `README.md`

**Interfaces:**
- Consumes: all Phase 1 features.
- Produces: reproducible local setup, a Vercel health endpoint, and CI gates required before Preview or `main` deployment.

- [ ] **Step 1: Write failing health route test**

Create `src/app/api/health/route.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("GET /api/health", () => {
  it("returns service identity", async () => {
    const response = await GET();
    await expect(response.json()).resolves.toEqual({
      ok: true,
      service: "fbkr-learning-centre-portal",
    });
  });
});
```

- [ ] **Step 2: Verify failure, then implement the route**

Run: `pnpm vitest run src/app/api/health/route.test.ts`

Expected: FAIL because `route.ts` does not exist.

Create `src/app/api/health/route.ts`:

```ts
export function GET() {
  return Response.json({
    ok: true,
    service: "fbkr-learning-centre-portal",
  });
}
```

- [ ] **Step 3: Add Playwright authentication flow**

`tests/e2e/auth.spec.ts` must prove an unauthenticated request redirects to `/login`, a participant sees participant navigation, and a system administrator sees the user-account navigation. Seed local test users through the admin API in `test.beforeAll` and remove them in `test.afterAll`.

- [ ] **Step 4: Add Playwright user lifecycle flow**

`tests/e2e/users.spec.ts` signs in as a system administrator, creates an employee account, confirms it appears in the table, deactivates it, and confirms its status becomes inactive.

- [ ] **Step 5: Add CI workflow**

Create `.github/workflows/ci.yml` with these jobs:

```yaml
name: ci
on:
  pull_request:
  push:
    branches: [main]
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 10
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm build
```

Add this database job to the same workflow. It uses the locally pinned CLI and GitHub's Docker-enabled Ubuntu runner; it never receives hosted Supabase credentials.

```yaml
  database:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 10
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec supabase start
      - run: pnpm exec supabase test db
      - if: always()
        run: pnpm exec supabase stop
```

- [ ] **Step 6: Document local setup and deployment contract**

README must include Node 22, pnpm, Docker, Supabase CLI, environment variable names, `supabase start`, `pnpm dev`, test commands, bootstrap admin command, GitHub PR workflow, and the warning that Vercel Preview shares hosted production data.

- [ ] **Step 7: Run the complete Phase 1 verification**

Run:

```powershell
pnpm exec supabase db reset
pnpm exec supabase test db
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

Expected: every command exits 0 and the two Playwright scenarios pass on desktop and a mobile viewport.

- [ ] **Step 8: Commit**

```powershell
git add src/app/api tests/e2e .github README.md
git commit -m "test: verify portal foundation and account flows"
```

## Phase 1 Acceptance Gate

Phase 1 is complete only when:

- Employee-number login works with an initial password equal to the employee number.
- A signed-in user can change the password.
- Inactive users cannot enter the portal.
- Role-specific navigation and server guards agree.
- System administrators and education managers can create individual accounts.
- A valid Excel·CSV import previews and creates accounts; invalid rows show exact errors before creation.
- Browser requests cannot use a secret or service role key.
- Database tests prove self/staff profile access and anonymous denial.
- The approved Arial and FUJIFILM template-derived visual system renders on desktop and mobile.
- Lint, typecheck, unit tests, database tests, production build, and end-to-end tests all pass.
