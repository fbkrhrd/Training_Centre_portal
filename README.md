# FBKR Learning Centre Portal

한국후지필름비즈니스이노베이션의 사내 교육 운영을 자동화하는 반응형 웹 포털이다. Phase 1은 사번 로그인, 역할별 접근 제어, 사용자 계정 관리, Excel·CSV 일괄 등록을 제공한다.

## 기술 구성

- Next.js 16 App Router, React 19, TypeScript, Tailwind CSS
- Supabase Auth, PostgreSQL, RLS
- Vitest, Testing Library, Playwright
- GitHub 비공개 저장소와 Vercel
- Node.js 22, pnpm 11.19.0

## 로컬 요구사항

- Node.js 22
- pnpm 11.19.0
- Supabase CLI 및 실제 Supabase 프로젝트 접근 권한
- Git

## 환경변수

`.env.example`을 `.env.local`로 복사하고 값을 입력한다. 비밀키가 포함된 `.env.local`은 커밋하지 않는다.

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
INTERNAL_AUTH_EMAIL_DOMAIN=auth.fbkr.internal
BOOTSTRAP_EMPLOYEE_NO=
BOOTSTRAP_FULL_NAME=
BOOTSTRAP_COMPANY_EMAIL=
```

`NEXT_PUBLIC_` 변수에는 공개 가능한 프로젝트 URL과 publishable key만 사용한다. `SUPABASE_SECRET_KEY`는 서버 전용이며 브라우저 코드에 전달하지 않는다.

## 설치와 실행

```powershell
pnpm install --frozen-lockfile
pnpm exec supabase login
pnpm exec supabase link --project-ref <project-ref>
pnpm db:push
pnpm dev
```

Supabase Dashboard의 Project URL, publishable key, secret key를 `.env.local`에 설정한다. `db:push`는 실제 프로젝트에 마이그레이션을 적용하므로, 적용 전 Dashboard 백업·대상 프로젝트·변경 내용을 확인한다.

## 최초 시스템 관리자

`.env.local`의 `BOOTSTRAP_*` 값과 Supabase 서버 환경값을 설정한 뒤 다음 명령을 한 번 실행한다.

```powershell
pnpm bootstrap:admin
```

초기 비밀번호는 입력한 사번과 동일하다. 실제 계정을 생성하는 명령이므로 대상 환경과 사번을 확인한 뒤 실행한다.

## 검증 명령

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

- 단위 테스트와 빌드는 Supabase 비밀키 없이 실행할 수 있다.
- E2E 테스트는 실제 Supabase에 테스트 계정을 만들고 완료 후 제거한다. 운영 프로젝트에는 전용 테스트 계정과 별도 테스트 데이터를 사용한다.

## GitHub와 Vercel 운영

1. 기능 브랜치는 `codex/` 또는 팀이 정한 접두사로 생성한다.
2. Pull Request에서 CI의 린트, 타입 검사, 단위 테스트, 빌드를 통과시킨다.
3. 승인된 PR만 `main`에 병합하고 `main`을 Vercel Production에 연결한다.
4. PR Preview는 Vercel 인증으로 보호한다.

Preview와 Production은 승인된 정책에 따라 하나의 호스팅 Supabase 프로젝트를 공유할 수 있다. 따라서 Preview에서 실행한 생성·수정·삭제가 운영 데이터에 반영될 수 있다. E2E와 수동 검증은 운영 교육 이력과 분리된 테스트 계정·테스트 차수로만 수행한다.

## 제품 문서

- [단계별 PRD](./docs/prd/README.md)
- [승인된 제품 설계](./docs/superpowers/specs/2026-09-17-fbkr-learning-centre-portal-design.md)
- [Phase 1 구현 계획](./docs/superpowers/plans/2026-09-17-fbkr-portal-foundation-auth.md)
