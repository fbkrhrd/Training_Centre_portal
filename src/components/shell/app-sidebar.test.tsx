import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { getDictionary } from "@/i18n/dictionaries";
import { AppSidebar } from "./app-sidebar";

vi.mock("next/link", () => ({
  default: ({ children, prefetch, onClick, ...props }: React.ComponentProps<"a"> & { prefetch?: boolean }) => (
    <a {...props} data-prefetch={prefetch ? "true" : undefined} onClick={(event) => { event.preventDefault(); onClick?.(event); }}>{children}</a>
  ),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

describe("AppSidebar", () => {
  it("shows immediate loading feedback when a menu item is selected", () => {
    render(<AppSidebar dictionary={getDictionary("ko")} role="participant" />);

    fireEvent.click(screen.getByRole("link", { name: "교육과정" }));

    expect(screen.getByRole("status")).toHaveTextContent("화면을 전환하는 중입니다");
  });
});
