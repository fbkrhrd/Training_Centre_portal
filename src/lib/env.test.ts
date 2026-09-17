import { describe, expect, it } from "vitest";
import { parseAuthEnv, parsePublicEnv, parseServerEnv } from "@/lib/env";

describe("parsePublicEnv", () => {
  it("rejects a missing Supabase URL", () => {
    expect(() =>
      parsePublicEnv({ NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test" }),
    ).toThrow("NEXT_PUBLIC_SUPABASE_URL");
  });
});

describe("parseServerEnv", () => {
  it("uses the approved internal auth domain by default", () => {
    expect(
      parseServerEnv({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
        SUPABASE_SECRET_KEY: "sb_secret_test",
      }).INTERNAL_AUTH_EMAIL_DOMAIN,
    ).toBe("auth.fbkr.internal");
  });

  it("rejects a missing server secret", () => {
    expect(() =>
      parseServerEnv({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
      }),
    ).toThrow("SUPABASE_SECRET_KEY");
  });
});

describe("parseAuthEnv", () => {
  it("does not require a server secret for employee password login", () => {
    expect(parseAuthEnv({}).INTERNAL_AUTH_EMAIL_DOMAIN).toBe("auth.fbkr.internal");
  });
});
