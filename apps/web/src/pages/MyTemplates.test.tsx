import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import MyTemplatesPage from "./MyTemplates";
import type { Template, User } from "../types";

const user: User = {
  id: "user-1",
  email: "ari@example.com",
  displayName: "Ari User"
};

const template: Template = {
  id: "template-1",
  title: "Senior Frontend Systems",
  category: "Engineering",
  description: "Practice frontend architecture and tradeoff questions.",
  systemInstruction: "Ask adaptive frontend engineering questions.",
  voiceModel: "aura-2-thalia-en",
  authorId: "user-1",
  isPublic: true,
  createdAt: "2026-05-20T10:00:00.000Z",
  updatedAt: "2026-05-20T10:00:00.000Z",
  author: {
    id: "user-1",
    displayName: "Ari User"
  },
  _count: { likes: 3 }
};

const baseProps = {
  user,
  templates: [template],
  loading: false,
  likedTemplateIds: new Set<string>(),
  onToggleLike: vi.fn(async () => undefined),
  onRefresh: vi.fn(),
  onCreateTemplate: vi.fn(),
  onOpenProfile: vi.fn(),
  onOpenLiked: vi.fn(),
  onOpenSessions: vi.fn(),
  onOpenSettings: vi.fn(),
  onLogout: vi.fn()
};

describe("MyTemplatesPage", () => {
  it("renders as a separate My Templates page and opens templates", async () => {
    const user = userEvent.setup();
    const onOpenTemplate = vi.fn();

    render(
      <MemoryRouter>
        <MyTemplatesPage {...baseProps} onOpenTemplate={onOpenTemplate} />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: "My Templates" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /open senior frontend systems/i }));

    expect(onOpenTemplate).toHaveBeenCalledWith("template-1");
  });

  it("starts template creation from the topbar action", async () => {
    const user = userEvent.setup();
    const onCreateTemplate = vi.fn();

    render(
      <MemoryRouter>
        <MyTemplatesPage
          {...baseProps}
          onOpenTemplate={vi.fn()}
          onCreateTemplate={onCreateTemplate}
        />
      </MemoryRouter>
    );

    await user.click(screen.getByRole("button", { name: /new template/i }));

    expect(onCreateTemplate).toHaveBeenCalledTimes(1);
  });
});
