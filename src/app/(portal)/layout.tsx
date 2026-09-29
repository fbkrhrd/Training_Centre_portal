import type { ReactNode } from "react";
import { AppShell } from "@/components/shell/app-shell";
import { PortalShellBoundary } from "@/components/shell/portal-shell-boundary";
import { logoutAction, updateLocaleAction } from "@/features/auth/actions";
import { requireUser } from "@/features/auth/require-user";
import PortalLoading from "./loading";

async function AuthenticatedPortalShell({ children }: { children: ReactNode }) {
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

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <PortalShellBoundary fallback={<PortalLoading />}>
      <AuthenticatedPortalShell>{children}</AuthenticatedPortalShell>
    </PortalShellBoundary>
  );
}
