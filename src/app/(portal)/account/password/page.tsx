import { PasswordForm } from "@/features/auth/password-form";
import { requireUser } from "@/features/auth/require-user";
import { getDictionary } from "@/i18n/dictionaries";

export default async function PasswordPage() {
  const user = await requireUser();
  const dictionary = getDictionary(user.preferredLocale);

  return (
    <section className="content-panel">
      <p className="dashboard-intro__label">{dictionary.account}</p>
      <h1>{dictionary.passwordSettings}</h1>
      <PasswordForm dictionary={dictionary} />
    </section>
  );
}
