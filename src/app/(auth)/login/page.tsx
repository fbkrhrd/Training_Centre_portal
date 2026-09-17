import Link from "next/link";
import { LoginForm } from "@/features/auth/login-form";
import { getDictionary } from "@/i18n/dictionaries";
import { normalizeLocale } from "@/i18n/locale";

type LoginPageProps = {
  searchParams: Promise<{ lang?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { lang } = await searchParams;
  const locale = normalizeLocale(lang);
  const dictionary = getDictionary(locale);

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="auth-panel__brand-line" aria-hidden="true" />
        <p className="auth-panel__company">FUJIFILM Business Innovation Korea</p>
        <h1>{dictionary.serviceName}</h1>
        <p className="auth-panel__guide">{dictionary.loginGuide}</p>
        <LoginForm dictionary={dictionary} />
        <nav className="locale-switch auth-panel__locale" aria-label={dictionary.language}>
          <Link href="?lang=ko" aria-current={locale === "ko" ? "page" : undefined}>
            {dictionary.korean}
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="?lang=en" aria-current={locale === "en" ? "page" : undefined}>
            {dictionary.english}
          </Link>
        </nav>
      </section>
    </main>
  );
}
