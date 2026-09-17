import { z } from "zod";

const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
});

const serverSchema = publicSchema.extend({
  SUPABASE_SECRET_KEY: z.string().min(1),
  INTERNAL_AUTH_EMAIL_DOMAIN: z
    .string()
    .min(1)
    .default("auth.fbkr.internal"),
});

export function parsePublicEnv(input: Record<string, string | undefined>) {
  return publicSchema.parse(input);
}

export function parseServerEnv(input: Record<string, string | undefined>) {
  return serverSchema.parse(input);
}

export function getPublicEnv() {
  return parsePublicEnv({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });
}
