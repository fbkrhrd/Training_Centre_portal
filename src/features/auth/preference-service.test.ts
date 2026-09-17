import { describe, expect, it, vi } from "vitest";
import { updatePreferredLocale } from "./preference-service";

describe("updatePreferredLocale", () => {
  it("stores only a supported locale for the current user", async () => {
    const saveLocale = vi.fn().mockResolvedValue(undefined);

    await updatePreferredLocale({ saveLocale }, "user-1", "en");

    expect(saveLocale).toHaveBeenCalledWith("user-1", "en");
  });

  it("rejects an unsupported locale", async () => {
    await expect(
      updatePreferredLocale({ saveLocale: vi.fn() }, "user-1", "ja"),
    ).rejects.toThrow("지원하지 않는 언어");
  });
});
