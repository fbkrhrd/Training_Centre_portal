"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import type { Dictionary } from "@/i18n/dictionaries";
import type { AppRole } from "@/features/auth/types";

type AppSidebarProps = {
  dictionary: Dictionary;
  role: AppRole;
};

export function AppSidebar({ dictionary, role }: AppSidebarProps) {
  const pathname = usePathname();
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const isNavigating = pendingPath !== null && pendingPath !== pathname;
  const canManageUsers =
    role === "system_admin" || role === "education_manager";

  function startNavigation(href: string) {
    if (href !== pathname) setPendingPath(href);
  }

  return (
    <aside className="app-sidebar" aria-label={dictionary.menu}>
      <nav className="app-sidebar__nav" aria-busy={isNavigating}>
        <Link className="app-sidebar__link app-sidebar__link--active" href="/" prefetch onClick={() => startNavigation("/")}>
          <span className="app-sidebar__mark" aria-hidden="true" />
          {dictionary.dashboard}
        </Link>
        <Link className="app-sidebar__link" href="/courses" prefetch onClick={() => startNavigation("/courses")}><span className="app-sidebar__mark" aria-hidden="true" />교육과정</Link>
        <Link className="app-sidebar__link" href="/my-learning" prefetch onClick={() => startNavigation("/my-learning")}><span className="app-sidebar__mark" aria-hidden="true" />나의 신청 현황</Link>
        {canManageUsers ? (
          <Link className="app-sidebar__link" href="/admin/users" prefetch onClick={() => startNavigation("/admin/users")}>
            <span className="app-sidebar__mark" aria-hidden="true" />
            {dictionary.users}
          </Link>
        ) : null}
        {canManageUsers ? <Link className="app-sidebar__link" href="/admin/enrollments" prefetch onClick={() => startNavigation("/admin/enrollments")}><span className="app-sidebar__mark" aria-hidden="true" />신청 승인 관리</Link> : null}
        {canManageUsers ? (
          <Link className="app-sidebar__link" href="/admin/sessions" prefetch onClick={() => startNavigation("/admin/sessions")}><span className="app-sidebar__mark" aria-hidden="true" />차수 관리</Link>
        ) : null}
        {canManageUsers ? (
          <Link className="app-sidebar__link" href="/admin/courses" prefetch onClick={() => startNavigation("/admin/courses")}>
            <span className="app-sidebar__mark" aria-hidden="true" />
            교육과정 관리
          </Link>
        ) : null}
        <Link className="app-sidebar__link" href="/account/password" prefetch onClick={() => startNavigation("/account/password")}>
          <span className="app-sidebar__mark" aria-hidden="true" />
          {dictionary.account}
        </Link>
        {isNavigating ? <p className="app-sidebar__loading" role="status" aria-live="polite">화면을 전환하는 중입니다</p> : null}
      </nav>
    </aside>
  );
}
