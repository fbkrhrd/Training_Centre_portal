import { AppShell } from "@/components/shell/app-shell";
import { getDictionary } from "@/i18n/dictionaries";
import { normalizeLocale } from "@/i18n/locale";

type HomeProps = {
  searchParams: Promise<{ lang?: string }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const { lang } = await searchParams;
  const locale = normalizeLocale(lang);
  const dictionary = getDictionary(locale);

  return (
    <AppShell locale={locale} role="participant">
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
    </AppShell>
  );
}
