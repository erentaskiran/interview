import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { Topbar } from "./Topbar";

function Wrapper({ children }: { children: React.ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

describe("Topbar", () => {
  it("renders search input with keyboard shortcut hint", async () => {
    render(<Topbar title="Discover" />, { wrapper: Wrapper });

    expect(screen.getByPlaceholderText("Search templates, prompts, people\u2026")).toBeInTheDocument();
    expect(screen.getByText("\u2318K")).toBeInTheDocument();
  });

  it("renders clickable non-current breadcrumbs", async () => {
    const user = userEvent.setup();
    const onDiscover = vi.fn();

    render(
      <Topbar
        crumb={[{ label: "Discover", onClick: onDiscover }, "Engineering"]}
        hideSearch
      />,
      { wrapper: Wrapper }
    );

    await user.click(screen.getByRole("button", { name: "Discover" }));

    expect(onDiscover).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Engineering")).not.toHaveAttribute("role", "button");
  });

  it("opens notification popover with working actions", async () => {
    const user = userEvent.setup();
    const onOpenSessions = vi.fn();
    const onDiscoverTemplates = vi.fn();

    render(
      <Topbar
        title="Dashboard"
        hideSearch
        onOpenSessions={onOpenSessions}
        onDiscoverTemplates={onDiscoverTemplates}
      />,
      { wrapper: Wrapper }
    );

    await user.click(screen.getByRole("button", { name: /notifications/i }));
    await user.click(screen.getByRole("button", { name: /view sessions/i }));
    expect(onOpenSessions).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: /notifications/i }));
    await user.click(screen.getByRole("button", { name: /discover templates/i }));
    expect(onDiscoverTemplates).toHaveBeenCalledTimes(1);
  });
});
