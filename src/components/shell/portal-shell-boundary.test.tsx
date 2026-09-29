import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PortalShellBoundary } from "./portal-shell-boundary";

function DeferredContent(): never {
  throw new Promise<never>(() => undefined);
}

describe("PortalShellBoundary", () => {
  it("shows its fallback while the authenticated portal shell is pending", () => {
    render(
      <PortalShellBoundary fallback={<p>화면을 불러오는 중입니다</p>}>
        <DeferredContent />
      </PortalShellBoundary>,
    );

    expect(screen.getByText("화면을 불러오는 중입니다")).toBeInTheDocument();
  });
});
