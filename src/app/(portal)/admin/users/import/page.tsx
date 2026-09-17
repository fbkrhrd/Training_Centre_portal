import { requireUser } from "@/features/auth/require-user";
import { UserImport } from "@/features/users/user-import";
import { getDictionary } from "@/i18n/dictionaries";

export default async function UserImportPage() {
  const user = await requireUser(["system_admin", "education_manager"]);
  const dictionary = getDictionary(user.preferredLocale);

  return (
    <section className="content-panel content-panel--wide">
      <p className="dashboard-intro__label">ADMINISTRATION</p>
      <h1>{dictionary.importUsers}</h1>
      <UserImport dictionary={dictionary} />
    </section>
  );
}
