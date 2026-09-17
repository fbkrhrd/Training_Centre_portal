import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppShell } from "./app-shell";

describe("AppShell", () => {
  it("renders the approved service name and administrator navigation", () => {
    render(
      <AppShell locale="ko" role="system_admin">
        <p>content</p>
      </AppShell>,
    );

    expect(screen.getByText("FBKR Learning Centre Portal")).toBeInTheDocument();
    expect(screen.getByText("홈 대시보드")).toBeInTheDocument();
    expect(screen.getByText("사용자 계정")).toBeInTheDocument();
  });

  it("hides administrator navigation from participants", () => {
    render(
      <AppShell locale="ko" role="participant">
        <p>content</p>
      </AppShell>,
    );

    expect(screen.queryByText("사용자 계정")).not.toBeInTheDocument();
  });

  it("renders English navigation when selected", () => {
    render(
      <AppShell locale="en" role="education_manager">
        <p>content</p>
      </AppShell>,
    );

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("User Accounts")).toBeInTheDocument();
  });
});
