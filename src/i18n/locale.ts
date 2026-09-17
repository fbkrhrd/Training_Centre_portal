export type Locale = "ko" | "en";

export function isLocale(value: unknown): value is Locale {
  return value === "ko" || value === "en";
}

export function normalizeLocale(value?: string): Locale {
  return value?.toLowerCase().startsWith("en") ? "en" : "ko";
}
