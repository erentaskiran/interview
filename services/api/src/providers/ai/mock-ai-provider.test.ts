import { describe, expect, it } from "vitest";
import { MockAiProvider } from "./mock-ai-provider.js";

describe("MockAiProvider", () => {
  const provider = new MockAiProvider();

  describe("startInterview", () => {
    it("returns plannedQuestionCount within bounds", async () => {
      const result = await provider.startInterview({
        templateTitle: "Backend Interview",
        templateCategory: "Node.js",
        templateDescription: "General backend interview",
        systemInstruction: "Ask adaptive questions",
        minQuestionCount: 3,
        maxQuestionCount: 5,
      });

      expect(result.plannedQuestionCount).toBeGreaterThanOrEqual(3);
      expect(result.plannedQuestionCount).toBeLessThanOrEqual(5);
    });

    it("returns a non-empty first question", async () => {
      const result = await provider.startInterview({
        templateTitle: "Backend Interview",
        templateCategory: "Node.js",
        templateDescription: "General backend interview",
        systemInstruction: "Ask adaptive questions",
        minQuestionCount: 3,
        maxQuestionCount: 5,
      });

      expect(result.firstQuestion.length).toBeGreaterThan(5);
      expect(result.rubric).toBeDefined();
      expect(result.plannedCoverage).toBeInstanceOf(Array);
    });
  });

  describe("continueInterview", () => {
    it("finishes when turns reach planned count", async () => {
      const result = await provider.continueInterview({
        minQuestionCount: 3,
        maxQuestionCount: 12,
        plannedQuestionCount: 4,
        turns: [
          { turnIndex: 1, questionText: "Q1", answerTranscript: "A1" },
          { turnIndex: 2, questionText: "Q2", answerTranscript: "A2" },
          { turnIndex: 3, questionText: "Q3", answerTranscript: "A3" },
          { turnIndex: 4, questionText: "Q4", answerTranscript: "A4" },
        ],
      });
      expect(result.decision).toBe("finish");
      expect(result.reasoning).toBeTruthy();
    });

    it("continues when under planned count", async () => {
      const result = await provider.continueInterview({
        minQuestionCount: 3,
        maxQuestionCount: 12,
        plannedQuestionCount: 6,
        turns: [
          { turnIndex: 1, questionText: "Q1", answerTranscript: "A1" },
          { turnIndex: 2, questionText: "Q2", answerTranscript: "A2" },
        ],
      });
      expect(result.decision).toBe("continue");
      expect(result.nextQuestion).toBeTruthy();
    });

    it("finishes when turns reach maxQuestionCount", async () => {
      const result = await provider.continueInterview({
        minQuestionCount: 3,
        maxQuestionCount: 5,
        plannedQuestionCount: 10,
        turns: [
          { turnIndex: 1, questionText: "Q1", answerTranscript: "A1" },
          { turnIndex: 2, questionText: "Q2", answerTranscript: "A2" },
          { turnIndex: 3, questionText: "Q3", answerTranscript: "A3" },
          { turnIndex: 4, questionText: "Q4", answerTranscript: "A4" },
          { turnIndex: 5, questionText: "Q5", answerTranscript: "A5" },
        ],
      });
      expect(result.decision).toBe("finish");
    });
  });

  describe("finalizeInterview", () => {
    it("returns scoring payload for user_stopped", async () => {
      const result = await provider.finalizeInterview({
        completionReason: "user_stopped",
        turns: [{ turnIndex: 1, questionText: "Q1", answerTranscript: "A1" }],
      });

      expect(result.score).toBeGreaterThan(0);
      expect(result.feedback.summary.length).toBeGreaterThan(0);
      expect(result.feedback.strengths).toBeInstanceOf(Array);
      expect(result.feedback.weakAreas).toBeInstanceOf(Array);
    });

    it("returns different summary for ai_completed", async () => {
      const result = await provider.finalizeInterview({
        completionReason: "ai_completed",
        turns: [{ turnIndex: 1, questionText: "Q1", answerTranscript: "A1" }],
      });

      expect(result.score).toBeGreaterThan(0);
      expect(result.feedback.summary).toContain("Adaptive interview completed");
    });

    it("returns higher score with more turns", async () => {
      const fewTurns = await provider.finalizeInterview({
        completionReason: "ai_completed",
        turns: [{ turnIndex: 1, questionText: "Q1", answerTranscript: "A1" }],
      });

      const manyTurns = await provider.finalizeInterview({
        completionReason: "ai_completed",
        turns: Array.from({ length: 10 }, (_, i) => ({
          turnIndex: i + 1,
          questionText: `Q${i + 1}`,
          answerTranscript: `A${i + 1}`,
        })),
      });

      expect(manyTurns.score).toBeGreaterThan(fewTurns.score);
    });
  });

  describe("generateTemplate", () => {
    it("returns a template with title from prompt", async () => {
      const result = await provider.generateTemplate("A prompt about system design");
      expect(result.title).toContain("AI Generated:");
      expect(result.category).toBe("Engineering");
      expect(result.systemInstruction.length).toBeGreaterThan(10);
    });
  });
});
