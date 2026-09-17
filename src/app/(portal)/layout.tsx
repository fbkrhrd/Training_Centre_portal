import type { ReactNode } from "react";
import { AppShell } from "@/components/shell/app-shell";
import { logoutAction, updateLocaleAction } from "@/features/auth/actions";
import { requireUser } from "@/features/auth/require-user";

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();

  return (
    <AppShell
      locale={user.preferredLocale}
      role={user.role}
      userName={user.fullName}
      signOutAction={logoutAction}
      updateLocaleAction={updateLocaleAction}
    >
      {children}
    </AppShell>
  );
}
