import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import SessionsPage from "./Sessions";
import type { Session, User } from "../types";

const user: User = {
  id: "user-1",
  email: "user@example.com",
  displayName: "Ari User"
};

const session: Session = {
  id: "session-1",
  userId: "user-1",
  templateId: "template-1",
  status: "active",
  minQuestionCount: 3,
  maxQuestionCount: 12,
  plannedQuestionCount: 5,
  rubric: {},
  plannedCoverage: [],
  score: null,
  feedback: null,
  completionReason: null,
  createdAt: "2026-05-20T10:00:00.000Z",
  updatedAt: "2026-05-20T10:00:00.000Z",
  completedAt: null,
  template: {
    id: "template-1",
    title: "Engineering Loop",
    category: "Engineering"
  },
  _count: { turns: 1 },
  turns: []
};

const baseProps = {
  user,
  sessions: [session],
  loading: false,
  onRefresh: vi.fn(),
  onOpenProfile: vi.fn(),
  onOpenLiked: vi.fn(),
  onOpenSessions: vi.fn(),
  onOpenSettings: vi.fn(),
  onLogout: vi.fn()
};

describe("SessionsPage", () => {
  it("opens a session from row click and keyboard", async () => {
    const userEventApi = userEvent.setup();
    const onOpenSession = vi.fn();

    render(
      <MemoryRouter>
        <SessionsPage {...baseProps} onOpenSession={onOpenSession} />
      </MemoryRouter>
    );

    const row = screen.getByRole("button", { name: /engineering loop/i });
    await userEventApi.click(row);
    row.focus();
    await userEventApi.keyboard("{Enter}");
    await userEventApi.keyboard(" ");

    expect(onOpenSession).toHaveBeenCalledTimes(3);
    expect(onOpenSession).toHaveBeenCalledWith("session-1");
  });

  it("marks active sessions as resumable and opens once from the row action", async () => {
    const userEventApi = userEvent.setup();
    const onOpenSession = vi.fn();

    render(
      <MemoryRouter>
        <SessionsPage {...baseProps} onOpenSession={onOpenSession} />
      </MemoryRouter>
    );

    expect(screen.getByText("In progress")).toBeInTheDocument();
    const resumeButton = screen.getByRole("button", { name: "Resume" });
    await userEventApi.click(resumeButton);

    expect(onOpenSession).toHaveBeenCalledTimes(1);
    expect(onOpenSession).toHaveBeenCalledWith("session-1");
  });
});
