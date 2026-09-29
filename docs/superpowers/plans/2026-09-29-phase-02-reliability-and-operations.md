# Phase 2 안정화와 교육 운영 보완 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** Phase 2 데이터 화면의 Production 500을 복구하고, 교육담당자가 KST 기준으로 차수 상태를 운영하며 역할별 실제 홈 집계를 볼 수 있게 한다.

**Architecture:** Vercel Secret은 서버 전용 관리 Supabase 클라이언트의 외부 의존성으로 유지한다. 앱은 데이터 접근, KST, 상태 전환, 대시보드 서비스를 분리하고, 서버 페이지는 서비스가 반환한 권한 범위 데이터만 렌더링한다. 데이터 접근 실패는 포털 오류 경계로 전달한다.

**Tech Stack:** Next.js 16 App Router, TypeScript, React 19, Zod 4, Supabase JS 2, Vitest, Vercel CLI, Supabase CLI

**Spec:** docs/superpowers/specs/2026-09-29-phase-02-reliability-and-operations-design.md

## Global Constraints

- 시간 입력은 Asia/Seoul로 해석하고 PostgreSQL timestamptz에는 UTC ISO instant를 저장한다.
- SUPABASE_SECRET_KEY는 Vercel Secret 및 server-only 모듈에서만 읽고 화면, 테스트 출력, Git 이력에 기록하지 않는다.
- 모든 상태 변경은 requireUser()와 과정 담당자 검사를 거친다.
- 참가자에게는 타인의 이름·사번을 노출하지 않는다. 가명 데이터만 테스트/데모 문서에 사용한다.
- Docker 없이 연결된 실제 Supabase와 Vercel Production을 검증 대상으로 사용한다.
- .gitignore의 기존 미커밋 Vercel 연결 변경은 이 기능 커밋에 포함하지 않는다.

## Review Focus

- 빈 Secret은 변수 이름 존재 여부와 관계없이 런타임에서 데이터 화면을 500으로 만들므로 배포 후 실제 주입 여부를 검증한다.
- datetime-local의 시간대 없는 문자열은 UTC 서버에서 9시간 밀리므로 2026-10-01T09:00 변환 테스트를 추가한다.
- 완료·취소 차수는 재개방할 수 없고, draft 공개 전 필수 운영 정보 검증이 유지되어야 한다.
- 교육담당자의 승인 대기 집계와 목록은 자신이 배정된 과정으로만 제한되어야 한다.
- Supabase 조회 실패 시 빈 목록·0으로 숨기지 않고 한국어 오류 경계로 전달하되 비밀값과 개인정보를 표시하지 않아야 한다.

---

### Task 1: Production Secret 복구와 안전한 데이터 조회 오류 경계

**Files:**
- Create: src/lib/data-access.ts
- Create: src/lib/data-access.test.ts
- Create: src/app/(portal)/error.tsx
- Create: src/app/(portal)/error.test.tsx
- Modify: src/app/(portal)/courses/page.tsx
- Modify: src/app/(portal)/my-learning/page.tsx
- Modify: src/app/(portal)/admin/courses/page.tsx
- Modify: src/app/(portal)/admin/sessions/page.tsx
- Modify: src/app/(portal)/admin/enrollments/page.tsx
- Modify: src/app/(portal)/admin/users/page.tsx

**Interfaces:**
- Produces: requireSupabaseData(result, operation), returning valid data or a PortalDataAccessError with a fixed Korean public message.
- Consumes: existing createAdminSupabaseClient() and every listed page query result.

- [ ] **Step 1: Write failing data-access tests**

    it("returns successful Supabase data", () => {
      expect(requireSupabaseData({ data: [{ id: "1" }], error: null }, "courses"))
        .toEqual([{ id: "1" }]);
    });

    it("throws a safe portal error when Supabase returns an error", () => {
      expect(() => requireSupabaseData({ data: null, error: { message: "secret value" } }, "courses"))
        .toThrow("데이터를 불러오지 못했습니다");
    });

- [ ] **Step 2: Run test to verify it fails**

Run: pnpm test src/lib/data-access.test.ts  
Expected: FAIL because requireSupabaseData does not exist.

- [ ] **Step 3: Implement PortalDataAccessError and requireSupabaseData**

Preserve an original Supabase error only as server-side cause, return valid empty arrays unchanged, and never interpolate the original message into a client-facing error.

- [ ] **Step 4: Run data-access tests**

Run: pnpm test src/lib/data-access.test.ts  
Expected: PASS.

- [ ] **Step 5: Write failing portal error-boundary test**

Render PortalError with Error("SUPABASE_SECRET_KEY=leak"). Assert Korean retry guidance, a retry button calling reset, and absence of both the original message and key name.

- [ ] **Step 6: Run test to verify it fails**

Run: pnpm test src/app/(portal)/error.test.tsx  
Expected: FAIL because the error component does not exist.

- [ ] **Step 7: Implement PortalError**

Create the use-client error boundary with Korean explanation, reset button, and home link. Do not render error.message.

- [ ] **Step 8: Apply requireSupabaseData to all six data pages**

After every list query in the listed pages, process the query's data/error pair. Preserve legitimate empty lists and existing authorization checks.

- [ ] **Step 9: Run focused checks**

Run: pnpm test src/lib/data-access.test.ts src/app/(portal)/error.test.tsx && pnpm lint && pnpm typecheck  
Expected: PASS.

- [ ] **Step 10: Restore and verify Vercel Secret**

Use the linked Vercel project to replace the empty Production/Preview SUPABASE_SECRET_KEY with the existing local server secret without printing it. Redeploy Production, inspect recent Production error logs, and verify authenticated data pages. Do not commit environment files.

- [ ] **Step 11: Commit**

    git add src/lib/data-access.ts src/lib/data-access.test.ts src/app/(portal)/error.tsx src/app/(portal)/error.test.tsx src/app/(portal)/courses/page.tsx src/app/(portal)/my-learning/page.tsx src/app/(portal)/admin/courses/page.tsx src/app/(portal)/admin/sessions/page.tsx src/app/(portal)/admin/enrollments/page.tsx src/app/(portal)/admin/users/page.tsx
    git commit -m "fix: recover training data pages safely"

### Task 2: 한국 표준시 공통 모듈

**Files:**
- Create: src/lib/kst-date-time.ts
- Create: src/lib/kst-date-time.test.ts
- Modify: src/features/training/session-schema.ts
- Modify: src/features/training/session-schema.test.ts
- Modify: src/features/enrollments/actions.ts
- Modify: src/features/enrollments/enrollment-service.ts
- Modify: src/features/enrollments/enrollment-service.test.ts
- Modify: src/app/(portal)/courses/page.tsx
- Modify: src/app/(portal)/my-learning/page.tsx
- Modify: src/app/(portal)/admin/sessions/page.tsx

**Interfaces:**
- Produces: toKstIso(input), formatKst(value, locale), and isDeadlineOpen(deadline, now).
- Consumes: timezone-free datetime-local form values and UTC values from Supabase.

- [ ] **Step 1: Write failing KST conversion tests**

    it("stores 09:00 Korean local input as midnight UTC", () => {
      expect(toKstIso("2026-10-01T09:00")).toBe("2026-10-01T00:00:00.000Z");
    });

    it("formats a UTC instant in Korean time regardless of server timezone", () => {
      expect(formatKst("2026-10-01T00:00:00.000Z")).toContain("09:00");
    });

- [ ] **Step 2: Run test to verify it fails**

Run: pnpm test src/lib/kst-date-time.test.ts  
Expected: FAIL because the KST module does not exist.

- [ ] **Step 3: Implement KST helpers**

Use explicit +09:00 parsing for validated YYYY-MM-DDTHH:mm values and Intl.DateTimeFormat with timeZone Asia/Seoul, hourCycle h23, and a stable YYYY-MM-DD HH:mm display shape. Reject malformed values instead of relying on the host timezone.

- [ ] **Step 4: Run KST tests**

Run: pnpm test src/lib/kst-date-time.test.ts  
Expected: PASS.

- [ ] **Step 5: Write failing schema regression test**

Assert that a valid datetime-local session start of 2026-10-01T09:00 stores as 2026-10-01T00:00:00.000Z.

- [ ] **Step 6: Run test to verify it fails**

Run: pnpm test src/features/training/session-schema.test.ts  
Expected: FAIL because new Date(value) reads the server timezone.

- [ ] **Step 7: Use KST helpers in forms, pages, and deadlines**

Replace the session transform with toKstIso, all list displays with formatKst, and application/cancellation date comparisons with isDeadlineOpen. Preserve manager cancellation rules.

- [ ] **Step 8: Run focused checks**

Run: pnpm test src/lib/kst-date-time.test.ts src/features/training/session-schema.test.ts src/features/enrollments/enrollment-service.test.ts && pnpm lint && pnpm typecheck  
Expected: PASS.

- [ ] **Step 9: Commit**

    git add src/lib/kst-date-time.ts src/lib/kst-date-time.test.ts src/features/training/session-schema.ts src/features/training/session-schema.test.ts src/features/enrollments/actions.ts src/features/enrollments/enrollment-service.ts src/features/enrollments/enrollment-service.test.ts src/app/(portal)/courses/page.tsx src/app/(portal)/my-learning/page.tsx src/app/(portal)/admin/sessions/page.tsx
    git commit -m "fix: use Korea time for training operations"

### Task 3: 차수 상태 전환과 참가자 공개 제어

**Files:**
- Modify: src/features/training/session-service.ts
- Modify: src/features/training/session-service.test.ts
- Create: src/features/training/session-action-service.test.ts
- Modify: src/features/training/actions.ts
- Modify: src/app/(portal)/admin/sessions/page.tsx
- Modify: src/app/(portal)/courses/page.tsx

**Interfaces:**
- Produces: assertSessionStatusTransition(current, target, hasRequiredOperations).
- Produces: updateSessionStatusAction(formData).
- Consumes: assertCourseManagementAccess, course_sessions.status, and manager roles.

- [ ] **Step 1: Write failing transition tests**

    it("allows a complete draft to open", () => {
      expect(assertSessionStatusTransition("draft", "open", true)).toBe("open");
    });

    it("rejects reopening a completed session", () => {
      expect(() => assertSessionStatusTransition("completed", "open", true))
        .toThrow("변경할 수 없습니다");
    });

- [ ] **Step 2: Run test to verify it fails**

Run: pnpm test src/features/training/session-service.test.ts  
Expected: FAIL because existing helper accepts unsupported transitions.

- [ ] **Step 3: Implement the transition matrix**

Replace nextSessionStatus with the approved draft/open/closed/completed/cancelled matrix. Keep the draft-open required operations rule and reject no-op or terminal transitions with Korean copy.

- [ ] **Step 4: Run transition tests**

Run: pnpm test src/features/training/session-service.test.ts  
Expected: PASS.

- [ ] **Step 5: Write failing status-action authorization test**

Use an extracted/injected action service to prove an education manager must be assigned to the target course before requesting a state update.

- [ ] **Step 6: Run test to verify it fails**

Run: pnpm test src/features/training/session-action-service.test.ts  
Expected: FAIL because the status action service does not exist.

- [ ] **Step 7: Implement updateSessionStatusAction and a status form**

Load the target session/course, enforce assignment, validate target enum, enforce the state matrix, update only that record, and revalidate /admin/sessions, /courses, and /. Add a status selector and button to each session row.

- [ ] **Step 8: Run focused checks**

Run: pnpm test src/features/training/session-service.test.ts src/features/training/session-action-service.test.ts && pnpm lint && pnpm typecheck  
Expected: PASS.

- [ ] **Step 9: Commit**

    git add src/features/training/session-service.ts src/features/training/session-service.test.ts src/features/training/session-action-service.test.ts src/features/training/actions.ts src/app/(portal)/admin/sessions/page.tsx src/app/(portal)/courses/page.tsx
    git commit -m "feat: manage training session publication status"

### Task 4: 역할별 홈 대시보드 집계

**Files:**
- Create: src/features/dashboard/dashboard-service.ts
- Create: src/features/dashboard/dashboard-service.test.ts
- Create: src/features/dashboard/dashboard-repository.ts
- Create: src/app/(portal)/page.test.tsx
- Modify: src/app/(portal)/page.tsx
- Modify: src/i18n/dictionaries.ts

**Interfaces:**
- Produces: getDashboardSummary(source, user, now), returning upcomingTraining, completedSessions, pendingApproval.
- Consumes: current user role/id, course_managers, course_sessions, enrollments through a server-only repository.

- [ ] **Step 1: Write failing role-summary tests**

Assert that a participant sees only their future approved sessions and zero pending approval. Assert that an education manager sees pending/waiting applications only from assigned courses.

- [ ] **Step 2: Run test to verify it fails**

Run: pnpm test src/features/dashboard/dashboard-service.test.ts  
Expected: FAIL because the dashboard service does not exist.

- [ ] **Step 3: Implement pure role summary service**

Keep business rules independent of Supabase. System administrators count all rows; education managers count assigned-course rows; participants count only their enrollment rows. Treat completed sessions as a temporary metric until Phase 3 completion records exist.

- [ ] **Step 4: Run service tests**

Run: pnpm test src/features/dashboard/dashboard-service.test.ts  
Expected: PASS.

- [ ] **Step 5: Implement server-only repository and wire home**

Put createAdminSupabaseClient only in the repository. Render actual values and change the second card copy to 완료 차수 / Completed sessions until Phase 3.

- [ ] **Step 6: Add nonzero page rendering test and run checks**

Run: pnpm test src/features/dashboard/dashboard-service.test.ts src/app/(portal)/page.test.tsx && pnpm lint && pnpm typecheck  
Expected: PASS.

- [ ] **Step 7: Commit**

    git add src/features/dashboard/dashboard-service.ts src/features/dashboard/dashboard-service.test.ts src/features/dashboard/dashboard-repository.ts src/app/(portal)/page.tsx src/app/(portal)/page.test.tsx src/i18n/dictionaries.ts
    git commit -m "feat: show role-aware learning dashboard metrics"

### Task 5: 가명 테스트 데이터 규칙과 PRD 추적

**Files:**
- Create: docs/testing/demo-data-policy.md
- Modify: docs/prd/phase-02-course-session-enrollment.md
- Modify: README.md

**Interfaces:**
- Produces: repeatable instructions for non-identifying demo users and production smoke checks.

- [ ] **Step 1: Write the demo-data policy**

Specify fictional Korean display names, explicitly non-production test identifiers, no reuse of a real employee number/email/phone, and the prohibition on altering a live profile to create a demo.

- [ ] **Step 2: Update Phase 2 PRD tracking**

Add the stability items: server-only production data access, KST conversion, state transitions, real dashboard metrics, and safe Korean error guidance. Mark only completed items after implementation.

- [ ] **Step 3: Update README operational checklist**

Document health, login, authenticated courses, sessions, enrollments, and dashboard checks. State that a variable name alone is insufficient: its Production value must be nonempty.

- [ ] **Step 4: Verify documentation safety**

Run: rg -n "sb_secret_|service_role|2020010180" README.md docs  
Expected: no secret-like values or real bootstrap employee number in new documentation.

- [ ] **Step 5: Commit**

    git add docs/testing/demo-data-policy.md docs/prd/phase-02-course-session-enrollment.md README.md
    git commit -m "docs: define safe training demo data operations"

### Task 6: End-to-end verification, deployment, and delivery

**Files:**
- Modify: docs/prd/phase-02-course-session-enrollment.md

**Interfaces:**
- Consumes: tasks 1–5 and linked Vercel/Supabase projects.

- [ ] **Step 1: Run local quality suite**

Run: pnpm test && pnpm lint && pnpm typecheck && pnpm build  
Expected: PASS.

- [ ] **Step 2: Verify remote Supabase migration history**

Run: pnpm exec supabase migration list --linked  
Expected: local and remote IDs match. No new migration is needed because the status enum already exists and this plan changes application logic only.

- [ ] **Step 3: Run authenticated Production smoke verification**

Verify login, home metrics, /courses, /my-learning, /admin/courses, /admin/sessions, /admin/enrollments, and /admin/users. Confirm an open test session is participant-visible and a KST 09:00 input displays as 09:00.

- [ ] **Step 4: Inspect health and logs**

Run Vercel health curl and production error logs for the prior 15 minutes.  
Expected: health returns ok true and no 500 errors for the six data pages.

- [ ] **Step 5: Update verified PRD completion boxes**

Mark only verified stability acceptance items complete. Add the deployment URL and date without credentials or user information.

- [ ] **Step 6: Commit, push, and deploy**

    git add docs/prd/phase-02-course-session-enrollment.md
    git commit -m "docs: verify phase 2 reliability delivery"
    git push origin codex/foundation-auth
    npx vercel@latest deploy --prod --yes
