export type Locale = "ko" | "en";

export function normalizeLocale(value?: string): Locale {
  return value?.toLowerCase().startsWith("en") ? "en" : "ko";
}
