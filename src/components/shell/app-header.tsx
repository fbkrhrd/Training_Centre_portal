import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/locale";

type AppHeaderProps = {
  dictionary: Dictionary;
  locale: Locale;
  userName?: string;
  signOutAction?: () => Promise<void>;
  updateLocaleAction?: (formData: FormData) => Promise<void>;
};

export function AppHeader({
  dictionary,
  locale,
  userName,
  signOutAction,
  updateLocaleAction,
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
          <form action={updateLocaleAction}>
            <input type="hidden" name="locale" value="ko" />
            <button aria-current={locale === "ko" ? "page" : undefined}>
              {dictionary.korean}
            </button>
          </form>
          <span aria-hidden="true">/</span>
          <form action={updateLocaleAction}>
            <input type="hidden" name="locale" value="en" />
            <button aria-current={locale === "en" ? "page" : undefined}>
              {dictionary.english}
            </button>
          </form>
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
