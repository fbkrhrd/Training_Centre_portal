import Link from "next/link";
import { requireUser } from "@/features/auth/require-user";
import { getDictionary } from "@/i18n/dictionaries";
import { getDashboardSummary } from "@/features/dashboard/dashboard-service";
import { loadDashboardSource } from "@/features/dashboard/dashboard-repository";

export default async function PortalHomePage() {
  const user = await requireUser();
  const dictionary = getDictionary(user.preferredLocale);
  const summary = getDashboardSummary(
    await loadDashboardSource({ id: user.id, role: user.role }),
    { id: user.id, role: user.role },
    new Date(),
  );

  return (
    <>
      <section className="dashboard-intro">
        <p className="dashboard-intro__label">LEARNING CENTRE</p>
        <h1>{dictionary.welcomeTitle}</h1>
        <p>{dictionary.welcomeBody}</p>
      </section>
      <section className="dashboard-grid" aria-label={dictionary.dashboard}>
        <Link className="dashboard-card dashboard-card--primary" href="/dashboard/details?metric=upcoming">
          <p>{dictionary.upcomingTraining}</p>
          <strong>{summary.upcomingTraining}</strong>
        </Link>
        <Link className="dashboard-card" href="/dashboard/details?metric=completed">
          <p>{dictionary.completedTraining}</p>
          <strong>{summary.completedSessions}</strong>
        </Link>
        <Link className="dashboard-card" href="/dashboard/details?metric=pending">
          <p>{dictionary.pendingApproval}</p>
          <strong>{summary.pendingApproval}</strong>
        </Link>
      </section>
    </>
  );
}
