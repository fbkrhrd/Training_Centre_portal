import type { ReactNode } from "react";
import type { AppRole } from "@/features/auth/types";
import { getDictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/locale";
import { AppHeader } from "./app-header";
import { AppSidebar } from "./app-sidebar";

type AppShellProps = {
  children: ReactNode;
  locale: Locale;
  role: AppRole;
  userName?: string;
  signOutAction?: () => Promise<void>;
  updateLocaleAction?: (formData: FormData) => Promise<void>;
};

export function AppShell({
  children,
  locale,
  role,
  userName,
  signOutAction,
  updateLocaleAction,
}: AppShellProps) {
  const dictionary = getDictionary(locale);

  return (
    <div className="app-shell">
      <div className="app-shell__brand-line" aria-hidden="true" />
      <AppHeader
        dictionary={dictionary}
        locale={locale}
        userName={userName}
        signOutAction={signOutAction}
        updateLocaleAction={updateLocaleAction}
      />
      <div className="app-shell__body">
        <AppSidebar dictionary={dictionary} role={role} />
        <main className="app-shell__content">{children}</main>
      </div>
    </div>
  );
}
