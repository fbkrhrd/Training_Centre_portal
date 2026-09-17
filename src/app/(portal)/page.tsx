import { requireUser } from "@/features/auth/require-user";
import { getDictionary } from "@/i18n/dictionaries";

export default async function PortalHomePage() {
  const user = await requireUser();
  const dictionary = getDictionary(user.preferredLocale);

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
          <strong>0</strong>
        </article>
        <article className="dashboard-card">
          <p>{dictionary.completedTraining}</p>
          <strong>0</strong>
        </article>
        <article className="dashboard-card">
          <p>{dictionary.pendingApproval}</p>
          <strong>0</strong>
        </article>
      </section>
    </>
  );
}
