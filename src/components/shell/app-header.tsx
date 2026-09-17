import Link from "next/link";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/locale";

type AppHeaderProps = {
  dictionary: Dictionary;
  locale: Locale;
  userName?: string;
  signOutAction?: () => Promise<void>;
};

export function AppHeader({
  dictionary,
  locale,
  userName,
  signOutAction,
}: AppHeaderProps) {
  return (
    <header className="app-header">
      <div className="app-header__brand">
        <span className="app-header__company" aria-hidden="true">
          FUJIFILM
        </span>
        <div>
          <p className="app-header__eyebrow">{dictionary.companyName}</p>
          <p className="app-header__title">{dictionary.serviceName}</p>
        </div>
      </div>
      <div className="app-header__actions">
        <nav className="locale-switch" aria-label={dictionary.language}>
          <Link
            href="?lang=ko"
            hrefLang="ko"
            aria-current={locale === "ko" ? "page" : undefined}
          >
            {dictionary.korean}
          </Link>
          <span aria-hidden="true">/</span>
          <Link
            href="?lang=en"
            hrefLang="en"
            aria-current={locale === "en" ? "page" : undefined}
          >
            {dictionary.english}
          </Link>
        </nav>
        {userName ? <span className="app-header__user">{userName}</span> : null}
        {signOutAction ? (
          <form action={signOutAction}>
            <button className="button button--quiet">{dictionary.signOut}</button>
          </form>
        ) : null}
      </div>
    </header>
  );
}
