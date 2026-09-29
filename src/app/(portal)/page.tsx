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
        <article className="dashboard-card dashboard-card--primary">
          <p>{dictionary.upcomingTraining}</p>
          <strong>{summary.upcomingTraining}</strong>
        </article>
        <article className="dashboard-card">
          <p>{dictionary.completedTraining}</p>
          <strong>{summary.completedSessions}</strong>
        </article>
        <article className="dashboard-card">
          <p>{dictionary.pendingApproval}</p>
          <strong>{summary.pendingApproval}</strong>
        </article>
      </section>
    </>
  );
}
