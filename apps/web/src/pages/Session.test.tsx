import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import SessionPage from "./Session";
import type { Session, User } from "../types";

const user: User = {
  id: "user-1",
  email: "user@example.com",
  displayName: "Ari User"
};

const activeSessionWithTranscript: Session = {
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

const activeSessionWithoutAnswers: Session = {
  ...activeSessionWithTranscript,
  turns: [
    {
      ...activeSessionWithTranscript.turns[0]!,
      answerTranscript: null
    }
  ]
};

const completedSessionWithFeedback: Session = {
  ...activeSessionWithTranscript,
  status: "completed",
  score: 78,
  feedback: {
    summary: "Strong signal with two thin spots.",
    strengths: ["Clear tradeoff framing", "Concrete ownership examples"],
    weakAreas: ["Outcomes need numbers"],
    suggestions: ["Add before/after metrics"]
  },
  completionReason: "ai_completed",
  updatedAt: "2026-05-20T10:12:00.000Z",
  completedAt: "2026-05-20T10:12:00.000Z",
  turns: activeSessionWithTranscript.turns.map((turn) => ({
    ...turn,
    answerTranscript: turn.answerTranscript ?? "I would quantify the impact more clearly."
  }))
};

const noopAsync = vi.fn(async () => undefined);

const audioPayload = {
  mimeType: "audio/mpeg",
  audioBase64: "ZmFrZS1hdWRpbw=="
};

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

const installAudioMock = () => {
  const instances: Array<{
    src: string;
    currentTime: number;
    pause: ReturnType<typeof vi.fn>;
    play: ReturnType<typeof vi.fn>;
    onended: (() => void) | null;
  }> = [];

  class MockAudio {
    src: string;
    currentTime = 0;
    pause = vi.fn();
    play = vi.fn(async () => undefined);
    onended: (() => void) | null = null;

    constructor(src: string) {
      this.src = src;
      instances.push(this);
    }
  }

  vi.stubGlobal("Audio", MockAudio);
  return instances;
};

const baseProps = {
  user,
  session: activeSessionWithTranscript,
  loading: false,
  busy: false,
  onSubmitAnswer: noopAsync,
  onManualFinish: noopAsync,
  onRefresh: noopAsync,
  onRetryFromTemplate: noopAsync,
  onOpenTemplate: vi.fn(),
  onOpenProfile: vi.fn(),
  onOpenLiked: vi.fn(),
  onOpenSessions: vi.fn(),
  onOpenSettings: vi.fn(),
  onDiscoverTemplates: vi.fn(),
  onLogout: vi.fn()
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("SessionPage", () => {
  it("hides the sidebar while an interview is active", () => {
    render(
      <MemoryRouter>
        <SessionPage {...baseProps} />
      </MemoryRouter>
    );

    expect(screen.queryByRole("link", { name: /discover/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /sessions/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: /search templates/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /play question/i })).toBeInTheDocument();
    expect(screen.getByText(/answer by text/i)).toBeInTheDocument();
    expect(screen.getByText("Tell me about a technical tradeoff.")).toBeInTheDocument();
  });

  it("does not show interview controls once the session is completed", () => {
    const speak = vi.fn();
    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: {
        cancel: vi.fn(),
        speak
      }
    });

    render(
      <MemoryRouter>
        <SessionPage {...baseProps} session={completedSessionWithFeedback} />
      </MemoryRouter>
    );

    expect(speak).not.toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: /play question/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/answer by text/i)).not.toBeInTheDocument();
    expect(screen.getByText(/result · session complete/i)).toBeInTheDocument();
    expect(screen.getByText("Transcript")).toBeInTheDocument();
    expect(screen.getByText("Tell me about a technical tradeoff.")).toBeInTheDocument();
    expect(screen.getByText("What would you do differently?")).toBeInTheDocument();
  });

  it("renders the completed session result with score, strengths, and improvement areas", () => {
    render(
      <MemoryRouter>
        <SessionPage {...baseProps} session={completedSessionWithFeedback} />
      </MemoryRouter>
    );

    expect(screen.getByText(/result · session complete/i)).toBeInTheDocument();
    expect(screen.getAllByText("78").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Strong signal with two thin spots.")).toBeInTheDocument();
    expect(screen.getByText(/what landed/i)).toBeInTheDocument();
    expect(screen.getByText("Clear tradeoff framing")).toBeInTheDocument();
    expect(screen.getAllByText(/what to sharpen/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Outcomes need numbers")).toBeInTheDocument();
    expect(screen.getByText("Add before/after metrics")).toBeInTheDocument();
  });

  it("does not start overlapping auto-read playback when question audio arrives during an in-flight load", async () => {
    const audioInstances = installAudioMock();
    const loadedAudio = deferred<typeof audioPayload>();
    const onLoadQuestionAudio = vi.fn(() => loadedAudio.promise);
    const { rerender } = render(
      <MemoryRouter>
        <SessionPage
          {...baseProps}
          onLoadQuestionAudio={onLoadQuestionAudio}
          questionAudioByTurn={{}}
        />
      </MemoryRouter>
    );

    await waitFor(() => expect(onLoadQuestionAudio).toHaveBeenCalledTimes(1));

    rerender(
      <MemoryRouter>
        <SessionPage
          {...baseProps}
          onLoadQuestionAudio={onLoadQuestionAudio}
          questionAudioByTurn={{ 2: audioPayload }}
        />
      </MemoryRouter>
    );

    loadedAudio.resolve(audioPayload);

    await waitFor(() => expect(audioInstances).toHaveLength(1));
    expect(audioInstances[0]!.play).toHaveBeenCalledTimes(1);
  });

  it("stops active question playback before finishing manually", async () => {
    const userEventClient = userEvent.setup();
    const audioInstances = installAudioMock();
    const onManualFinish = vi.fn(async () => undefined);

    render(
      <MemoryRouter>
        <SessionPage
          {...baseProps}
          questionAudioByTurn={{ 2: audioPayload }}
          onManualFinish={onManualFinish}
        />
      </MemoryRouter>
    );

    await waitFor(() => expect(audioInstances).toHaveLength(1));

    await userEventClient.click(screen.getByRole("button", { name: /finish now/i }));

    expect(audioInstances[0]!.pause).toHaveBeenCalledTimes(1);
    expect(audioInstances[0]!.currentTime).toBe(0);
    expect(onManualFinish).toHaveBeenCalledTimes(1);
  });

  it("stops auto-read and explains when finishing before the first answer", async () => {
    const userEventClient = userEvent.setup();
    const audioInstances = installAudioMock();
    const onManualFinish = vi.fn(async () => undefined);

    render(
      <MemoryRouter>
        <SessionPage
          {...baseProps}
          session={activeSessionWithoutAnswers}
          firstQuestionAudio={audioPayload}
          onManualFinish={onManualFinish}
        />
      </MemoryRouter>
    );

    await waitFor(() => expect(audioInstances).toHaveLength(1));
    await userEventClient.click(screen.getByRole("button", { name: /finish now/i }));

    expect(audioInstances[0]!.pause).toHaveBeenCalledTimes(1);
    expect(onManualFinish).not.toHaveBeenCalled();
    expect(screen.getByText(/submit at least one answer before finishing/i)).toBeInTheDocument();
  });

  it("submits a text answer only once while the request is in flight", async () => {
    const userEventClient = userEvent.setup();
    const pendingSubmit = deferred<void>();
    const onSubmitAnswer = vi.fn(() => pendingSubmit.promise);

    render(
      <MemoryRouter>
        <SessionPage {...baseProps} onSubmitAnswer={onSubmitAnswer} />
      </MemoryRouter>
    );

    await userEventClient.type(screen.getByRole("textbox"), "My typed answer");
    const submitButton = screen.getByRole("button", { name: /submit answer/i });

    await userEventClient.click(submitButton);
    await userEventClient.click(submitButton);

    expect(onSubmitAnswer).toHaveBeenCalledTimes(1);
    expect(onSubmitAnswer).toHaveBeenCalledWith({ answerTranscript: "My typed answer" });

    pendingSubmit.resolve();
  });
});
