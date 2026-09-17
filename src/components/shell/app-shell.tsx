import type { ReactNode } from "react";
import { getDictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/locale";
import { AppHeader } from "./app-header";
import { AppSidebar, type AppRole } from "./app-sidebar";

type AppShellProps = {
  children: ReactNode;
  locale: Locale;
  role: AppRole;
};

export function AppShell({ children, locale, role }: AppShellProps) {
  const dictionary = getDictionary(locale);

  return (
    <div className="app-shell">
      <div className="app-shell__brand-line" aria-hidden="true" />
      <AppHeader dictionary={dictionary} locale={locale} />
      <div className="app-shell__body">
        <AppSidebar dictionary={dictionary} role={role} />
        <main className="app-shell__content">{children}</main>
      </div>
    </div>
  );
}
