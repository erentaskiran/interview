import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Topbar } from "./Topbar";

describe("Topbar", () => {
  it("submits global template search", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();

    render(<Topbar title="Discover" onSearch={onSearch} />);

    await user.type(screen.getByLabelText("Search templates"), "frontend systems{Enter}");

    expect(onSearch).toHaveBeenCalledWith("frontend systems");
  });

  it("renders clickable non-current breadcrumbs", async () => {
    const user = userEvent.setup();
    const onDiscover = vi.fn();

    render(
      <Topbar
        crumb={[{ label: "Discover", onClick: onDiscover }, "Engineering"]}
        hideSearch
      />
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
      />
    );

    await user.click(screen.getByRole("button", { name: /notifications/i }));
    await user.click(screen.getByRole("button", { name: /view sessions/i }));
    expect(onOpenSessions).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: /notifications/i }));
    await user.click(screen.getByRole("button", { name: /discover templates/i }));
    expect(onDiscoverTemplates).toHaveBeenCalledTimes(1);
  });
});
