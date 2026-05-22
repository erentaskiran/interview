import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import type { Session, User } from "./types";

const user: User = {
  id: "user-1",
  email: "user@example.com",
  displayName: "Ari User"
};

const activeSession: Session = {
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
  turns: [
    {
      id: "turn-1",
      sessionId: "session-1",
      turnIndex: 1,
      questionText: "Tell me about a technical tradeoff.",
      questionAudioRef: null,
      answerAudioRef: null,
      answerTranscript: "I weighed delivery speed against maintainability.",
      aiDecisionMetadata: {},
      createdAt: "2026-05-20T10:00:00.000Z",
      updatedAt: "2026-05-20T10:01:00.000Z"
    },
    {
      id: "turn-2",
      sessionId: "session-1",
      turnIndex: 2,
      questionText: "What would you do differently?",
      questionAudioRef: null,
      answerAudioRef: null,
      answerTranscript: null,
      aiDecisionMetadata: {},
      createdAt: "2026-05-20T10:02:00.000Z",
      updatedAt: "2026-05-20T10:02:00.000Z"
    }
  ]
};

const refreshedSessionAfterConflict: Session = {
  ...activeSession,
  turns: [
    activeSession.turns[0]!,
    {
      ...activeSession.turns[1]!,
      answerTranscript: "I would add stronger metrics."
    },
    {
      id: "turn-3",
      sessionId: "session-1",
      turnIndex: 3,
      questionText: "What metric would you use next?",
      questionAudioRef: null,
      answerAudioRef: null,
      answerTranscript: null,
      aiDecisionMetadata: {},
      createdAt: "2026-05-20T10:03:00.000Z",
      updatedAt: "2026-05-20T10:03:00.000Z"
    }
  ]
};

const audioPayload = {
  mimeType: "audio/mpeg",
  audioBase64: "ZmFrZS1hdWRpbw=="
};

const jsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });

const installAudioMock = () => {
  const instances: Array<{
    pause: ReturnType<typeof vi.fn>;
    play: ReturnType<typeof vi.fn>;
  }> = [];

  class MockAudio {
    pause = vi.fn();
    play = vi.fn(async () => undefined);

    constructor() {
      instances.push(this);
    }
  }

  vi.stubGlobal("Audio", MockAudio);
  return instances;
};

const installLocalStorageMock = () => {
  const store = new Map<string, string>();
  const storage = {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(key);
    }),
    clear: vi.fn(() => {
      store.clear();
    })
  };
  vi.stubGlobal("localStorage", storage);
  return storage;
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("App session route", () => {
  it("does not remount the active interview after auto-read loads question audio", async () => {
    const audioInstances = installAudioMock();
    const storage = installLocalStorageMock();
    let sessionFetchCount = 0;
    let questionAudioFetchCount = 0;

    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const requestUrl = input instanceof Request ? input.url : String(input);
        const url = new URL(requestUrl);
        const path = `${url.pathname}${url.search}`;

        if (path === "/auth/me") {
          return jsonResponse({ user });
        }
        if (path === "/users/user-1/profile") {
          return jsonResponse({ user, templates: [], likedTemplates: [], viewer: null });
        }
        if (path === "/sessions?limit=1") {
          return jsonResponse({ sessions: [], totalCount: 1 });
        }
        if (path === "/sessions/session-1") {
          sessionFetchCount += 1;
          return jsonResponse({ session: activeSession });
        }
        if (path === "/sessions/session-1/question-audio?turnIndex=2") {
          questionAudioFetchCount += 1;
          return jsonResponse({ turnId: "turn-2", turnIndex: 2, audio: audioPayload });
        }

        return new Response(JSON.stringify({ message: `Unhandled ${path}` }), { status: 404 });
      })
    );

    storage.setItem("ainterview_token", "test-token");

    render(
      <MemoryRouter initialEntries={["/sessions/session-1"]}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByText("What would you do differently?")).toBeInTheDocument();
    await waitFor(() => expect(questionAudioFetchCount).toBe(1));
    await waitFor(() => expect(audioInstances).toHaveLength(1));

    await new Promise((resolve) => window.setTimeout(resolve, 0));

    expect(sessionFetchCount).toBe(1);
    expect(audioInstances).toHaveLength(1);
  });

  it("refreshes the session when answer submit returns a stale-state conflict", async () => {
    const audioInstances = installAudioMock();
    const storage = installLocalStorageMock();
    const userEventClient = userEvent.setup();
    let sessionFetchCount = 0;
    let answerFetchCount = 0;

    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const requestUrl = input instanceof Request ? input.url : String(input);
        const url = new URL(requestUrl);
        const path = `${url.pathname}${url.search}`;

        if (path === "/auth/me") {
          return jsonResponse({ user });
        }
        if (path === "/users/user-1/profile") {
          return jsonResponse({ user, templates: [], likedTemplates: [], viewer: null });
        }
        if (path === "/sessions?limit=1") {
          return jsonResponse({ sessions: [], totalCount: 1 });
        }
        if (path === "/sessions/session-1") {
          sessionFetchCount += 1;
          return jsonResponse({
            session: sessionFetchCount === 1 ? activeSession : refreshedSessionAfterConflict
          });
        }
        if (path === "/sessions/session-1/question-audio?turnIndex=2") {
          return jsonResponse({ turnId: "turn-2", turnIndex: 2, audio: audioPayload });
        }
        if (path === "/sessions/session-1/answer") {
          answerFetchCount += 1;
          return new Response(JSON.stringify({ message: "No pending question in session" }), {
            status: 409,
            headers: { "Content-Type": "application/json" }
          });
        }

        return new Response(JSON.stringify({ message: `Unhandled ${path}` }), { status: 404 });
      })
    );

    storage.setItem("ainterview_token", "test-token");

    render(
      <MemoryRouter initialEntries={["/sessions/session-1"]}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => expect(audioInstances).toHaveLength(1));
    const answerBox = await screen.findByRole("textbox");
    expect(answerBox).toBeEnabled();
    await userEventClient.type(answerBox, "I would add stronger metrics.");
    expect(answerBox).toHaveValue("I would add stronger metrics.");
    const submitButton = screen.getByRole("button", { name: /submit answer/i });
    expect(submitButton).toBeEnabled();
    await userEventClient.click(submitButton);

    await waitFor(() => expect(answerFetchCount).toBe(1));
    await waitFor(() => expect(sessionFetchCount).toBe(2));
    expect(screen.getByText("What metric would you use next?")).toBeInTheDocument();
    expect(screen.queryByText(/failed to submit text answer/i)).not.toBeInTheDocument();
  });
});
