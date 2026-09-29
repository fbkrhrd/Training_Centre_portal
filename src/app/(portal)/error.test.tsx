import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import PortalError from "./error";

describe("PortalError", () => {
  it("shows Korean retry guidance without exposing the original error", () => {
    const reset = vi.fn();

    render(
      <PortalError
        error={new Error("SUPABASE_SECRET_KEY=leak")}
        reset={reset}
      />,
    );

    expect(
      screen.getByText("표시할 데이터가 없습니다"),
    ).toBeInTheDocument();
    expect(screen.queryByText("SUPABASE_SECRET_KEY=leak")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));
    expect(reset).toHaveBeenCalledOnce();
  });
});
