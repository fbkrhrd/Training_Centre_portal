# Course, Session, and Enrollment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver reusable course, 차수, enrollment, and education-manager approval workflows for Phase 2.

**Architecture:** Keep domain validation in pure `src/features/training` services, with server actions as thin authorization adapters and Supabase repositories as persistence adapters. The database is authoritative for course ownership, date conflicts, capacity, and enrollment state; RLS constrains participant, assigned manager, and system-admin access.

**Tech Stack:** Next.js App Router, TypeScript, Zod, Supabase Postgres/Auth/RLS, Vitest, pgTAP, Playwright.

**Spec:** `docs/prd/phase-02-course-session-enrollment.md`

## Global Constraints

- Use “차수” exclusively; never use “기수”.
- UI remains bilingual, Arial, responsive PC/mobile, and uses the approved FUJIFILM green palette.
- Direct participant applications always require education-manager approval.
- Initial scope supports one start/end schedule per 차수 and no automatic waiting-list promotion.
- Keep `service_role` server-only; public tables require RLS and explicit grants.

---

### Task 1: Define Phase 2 database contract and RLS

**Files:**
- Create: `supabase/migrations/<generated>_training_enrollment.sql`
- Create: `supabase/tests/database/training_enrollment.test.sql`
- Modify: `docs/prd/phase-02-course-session-enrollment.md`

- [ ] Write pgTAP tests for tables, status constraints, unique active enrollment, RLS, and manager ownership.
- [ ] Generate migration through Supabase CLI; add categories, courses, course-manager assignments, 차수, reminders, and enrollments.
- [ ] Add indexes, ownership/active-user RLS helpers, and explicit authenticated/service-role grants.
- [ ] Run local `supabase test db` and advisors; record any Docker blocker in PRD.
- [ ] Commit schema independently.

### Task 2: Build reusable course and 차수 domain services

**Files:**
- Create: `src/features/training/course-schema.ts`, `course-service.ts`, `course-repository.ts`
- Create: `src/features/training/session-schema.ts`, `session-service.ts`, `session-repository.ts`
- Test: `src/features/training/*.test.ts`

- [ ] Write failing tests for ownership, valid publishing, mode-specific location/link fields, capacity, and status transitions.
- [ ] Implement Zod schemas and pure services with injected repositories.
- [ ] Implement server-only Supabase repositories.
- [ ] Run focused tests, lint, and typecheck.
- [ ] Commit domain layer.

### Task 3: Build manager course and 차수 management UI

**Files:**
- Create: `src/app/(portal)/admin/courses/**`
- Create: `src/features/training/course-form.tsx`, `session-form.tsx`, `actions.ts`
- Modify: shell navigation, dictionaries, global styles, Phase 2 PRD

- [ ] Write component/service tests before forms and actions.
- [ ] Add category/course creation, assigned manager handling, 차수 draft/publish/edit flows.
- [ ] Enforce role and course ownership on every action.
- [ ] Verify desktop/mobile rendering and build.
- [ ] Commit manager UI.

### Task 4: Build participant discovery and enrollment workflow

**Files:**
- Create: `src/app/(portal)/courses/**`, `src/app/(portal)/my-learning/**`
- Create: `src/features/enrollments/enrollment-service.ts`, `enrollment-repository.ts`, `actions.ts`
- Test: `src/features/enrollments/*.test.ts`

- [ ] Write failing tests for date conflict, prior completion block, capacity-to-waiting behavior, and cancellation deadline.
- [ ] Implement transactional enrollment service and repository RPC/query boundary.
- [ ] Add searchable public course list/detail, application, and participant status views.
- [ ] Run unit tests, lint, typecheck, and build.
- [ ] Commit participant workflow.

### Task 5: Add manager enrollment operations and verification

**Files:**
- Create: `src/app/(portal)/admin/sessions/[sessionId]/enrollments/page.tsx`
- Create: `tests/e2e/training.spec.ts`
- Modify: CI, Phase 2 PRD, README as needed

- [ ] Write tests for approve/reject, direct assignment, manual waitlist promotion, and post-deadline manager cancellation.
- [ ] Implement server actions with ownership checks and auditable status change timestamps.
- [ ] Add E2E scenario covering participant application and manager approval.
- [ ] Run full unit, DB, E2E, lint, typecheck, and production build verification.
- [ ] Mark PRD items only after evidence exists; commit Phase 2 completion.
