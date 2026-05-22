import { afterEach, describe, expect, it, vi } from "vitest";
import { OpenCodeAiProvider } from "./opencode-ai-provider.js";

describe("OpenCodeAiProvider", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("rejects malformed continue responses instead of falling back", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  decision: "continue",
                  reasoning: "Needs another question"
                })
              }
            }
          ]
        })
      })
    );

    const provider = new OpenCodeAiProvider({
      apiUrl: "http://localhost:9999/v1/chat/completions",
      apiKey: "test-key"
    });

    await expect(
      provider.continueInterview({
        templateTitle: "Backend Interview",
        templateCategory: "Engineering",
        templateDescription: "Backend systems interview",
        systemInstruction: "Ask grounded adaptive questions",
        minQuestionCount: 3,
        maxQuestionCount: 12,
        plannedQuestionCount: 5,
        rubric: { depth: "specific examples" },
        plannedCoverage: ["architecture", "tradeoffs"],
        turns: [
          {
            turnIndex: 1,
            questionText: "Tell me about a system you designed.",
            answerTranscript: "I designed a queue-backed workflow."
          }
        ]
      })
    ).rejects.toThrow("AI requested continue without next question");
  });

  it("passes template, rubric, and coverage context to the model", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                decision: "continue",
                reasoning: "Probe tradeoffs",
                nextQuestion: "What tradeoffs did you make in the queue design?"
              })
            }
          }
        ]
      })
    });
    vi.stubGlobal("fetch", fetchMock);

    const provider = new OpenCodeAiProvider({
      apiUrl: "http://localhost:9999/v1/chat/completions",
      apiKey: "test-key"
    });

    await provider.continueInterview({
      templateTitle: "Backend Interview",
      templateCategory: "Engineering",
      templateDescription: "Backend systems interview",
      systemInstruction: "Ask grounded adaptive questions",
      minQuestionCount: 3,
      maxQuestionCount: 12,
      plannedQuestionCount: 5,
      rubric: { depth: "specific examples" },
      plannedCoverage: ["architecture", "tradeoffs"],
      turns: [
        {
          turnIndex: 1,
          questionText: "Tell me about a system you designed.",
          answerTranscript: "I designed a queue-backed workflow."
        }
      ]
    });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string) as {
      messages: Array<{ role: string; content: string }>;
    };
    const prompt = body.messages.find((message) => message.role === "user")?.content ?? "";

    expect(prompt).toContain("Template title: Backend Interview");
    expect(prompt).toContain("Rubric:");
    expect(prompt).toContain("specific examples");
    expect(prompt).toContain("Planned coverage:");
    expect(prompt).toContain("tradeoffs");
  });
});
