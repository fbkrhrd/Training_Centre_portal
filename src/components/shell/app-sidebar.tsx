import Link from "next/link";
import type { Dictionary } from "@/i18n/dictionaries";
import type { AppRole } from "@/features/auth/types";

type AppSidebarProps = {
  dictionary: Dictionary;
  role: AppRole;
};

export function AppSidebar({ dictionary, role }: AppSidebarProps) {
  const canManageUsers =
    role === "system_admin" || role === "education_manager";

  return (
    <aside className="app-sidebar" aria-label={dictionary.menu}>
      <nav className="app-sidebar__nav">
        <Link className="app-sidebar__link app-sidebar__link--active" href="/" prefetch>
          <span className="app-sidebar__mark" aria-hidden="true" />
          {dictionary.dashboard}
        </Link>
        <Link className="app-sidebar__link" href="/courses" prefetch><span className="app-sidebar__mark" aria-hidden="true" />교육과정</Link>
        <Link className="app-sidebar__link" href="/my-learning" prefetch><span className="app-sidebar__mark" aria-hidden="true" />나의 신청 현황</Link>
        {canManageUsers ? (
          <Link className="app-sidebar__link" href="/admin/users" prefetch>
            <span className="app-sidebar__mark" aria-hidden="true" />
            {dictionary.users}
          </Link>
        ) : null}
        {canManageUsers ? <Link className="app-sidebar__link" href="/admin/enrollments" prefetch><span className="app-sidebar__mark" aria-hidden="true" />신청 승인 관리</Link> : null}
        {canManageUsers ? (
          <Link className="app-sidebar__link" href="/admin/sessions" prefetch><span className="app-sidebar__mark" aria-hidden="true" />차수 관리</Link>
        ) : null}
        {canManageUsers ? (
          <Link className="app-sidebar__link" href="/admin/courses" prefetch>
            <span className="app-sidebar__mark" aria-hidden="true" />
            교육과정 관리
          </Link>
        ) : null}
        <Link className="app-sidebar__link" href="/account/password" prefetch>
          <span className="app-sidebar__mark" aria-hidden="true" />
          {dictionary.account}
        </Link>
      </nav>
    </aside>
  );
}
