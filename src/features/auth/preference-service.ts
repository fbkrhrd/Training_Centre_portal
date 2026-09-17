import { isLocale, type Locale } from "@/i18n/locale";

export type PreferenceDependencies = {
  saveLocale(userId: string, locale: Locale): Promise<void>;
};

export async function updatePreferredLocale(
  dependencies: PreferenceDependencies,
  userId: string,
  locale: unknown,
) {
  if (!isLocale(locale)) throw new Error("지원하지 않는 언어입니다.");
  await dependencies.saveLocale(userId, locale);
}
