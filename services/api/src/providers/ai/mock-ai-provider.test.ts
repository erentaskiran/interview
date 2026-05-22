import { describe, expect, it } from "vitest";
import { MockAiProvider } from "./mock-ai-provider.js";

describe("MockAiProvider", () => {
  const provider = new MockAiProvider();

  it("creates a bounded initial plan", async () => {
    const result = await provider.startInterview({
      templateTitle: "Backend Interview",
      templateCategory: "Node.js",
      templateDescription: "General backend interview",
      systemInstruction: "Ask adaptive questions",
      minQuestionCount: 3,
      maxQuestionCount: 5
    });

    expect(result.plannedQuestionCount).toBeGreaterThanOrEqual(3);
    expect(result.plannedQuestionCount).toBeLessThanOrEqual(5);
    expect(result.firstQuestion.length).toBeGreaterThan(5);
  });

  it("finishes when target count reached", async () => {
    const result = await provider.continueInterview({
      templateTitle: "Backend Interview",
      templateCategory: "Engineering",
      templateDescription: "General backend interview",
      systemInstruction: "Ask adaptive questions",
      minQuestionCount: 3,
      maxQuestionCount: 12,
      plannedQuestionCount: 4,
      rubric: {},
      plannedCoverage: ["depth"],
      turns: [
        { turnIndex: 1, questionText: "Q1", answerTranscript: "A1" },
        { turnIndex: 2, questionText: "Q2", answerTranscript: "A2" },
        { turnIndex: 3, questionText: "Q3", answerTranscript: "A3" },
        { turnIndex: 4, questionText: "Q4", answerTranscript: "A4" }
      ]
    });
    expect(result.decision).toBe("finish");
  });

  it("generates scoring payload", async () => {
    const result = await provider.finalizeInterview({
      completionReason: "user_stopped",
      turns: [{ turnIndex: 1, questionText: "Q1", answerTranscript: "A1" }]
    });

    expect(result.score).toBeGreaterThan(0);
    expect(result.feedback.summary.length).toBeGreaterThan(0);
  });
});
