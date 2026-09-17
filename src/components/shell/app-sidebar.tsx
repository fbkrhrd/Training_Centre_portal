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
        <Link className="app-sidebar__link app-sidebar__link--active" href="/">
          <span className="app-sidebar__mark" aria-hidden="true" />
          {dictionary.dashboard}
        </Link>
        {canManageUsers ? (
          <Link className="app-sidebar__link" href="/admin/users">
            <span className="app-sidebar__mark" aria-hidden="true" />
            {dictionary.users}
          </Link>
        ) : null}
        <Link className="app-sidebar__link" href="/account/password">
          <span className="app-sidebar__mark" aria-hidden="true" />
          {dictionary.account}
        </Link>
      </nav>
    </aside>
  );
}
