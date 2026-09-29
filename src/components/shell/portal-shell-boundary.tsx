import { Suspense, type ReactNode } from "react";

type PortalShellBoundaryProps = {
  children: ReactNode;
  fallback: ReactNode;
};

export function PortalShellBoundary({ children, fallback }: PortalShellBoundaryProps) {
  return <Suspense fallback={fallback}>{children}</Suspense>;
}
