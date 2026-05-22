import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { Sidebar } from "./Sidebar";

describe("Sidebar", () => {
  it("links My templates to its own page", () => {
    render(
      <MemoryRouter>
        <Sidebar user={{ name: "Ari User", sub: "ari@example.com" }} />
      </MemoryRouter>
    );

    expect(screen.getByRole("link", { name: /my templates/i })).toHaveAttribute(
      "href",
      "/my-templates"
    );
  });

  it("links the footer user area to the self profile route", () => {
    render(
      <MemoryRouter>
        <Sidebar user={{ name: "Ari User", sub: "ari@example.com" }} />
      </MemoryRouter>
    );

    expect(screen.getByRole("link", { name: /ari user/i })).toHaveAttribute("href", "/me");
  });
});
