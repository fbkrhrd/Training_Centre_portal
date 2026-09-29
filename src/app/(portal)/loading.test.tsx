import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PortalLoading from "./loading";

describe("PortalLoading", () => {
  it("shows an immediate loading status while a portal page is fetched", () => {
    render(<PortalLoading />);

    expect(screen.getByRole("status")).toHaveTextContent("화면을 불러오는 중입니다");
  });
});
