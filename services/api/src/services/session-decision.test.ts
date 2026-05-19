import { describe, expect, it } from "vitest";
import { decideAdaptiveTransition } from "./session-decision.js";

describe("decideAdaptiveTransition", () => {
  it("finishes by max question guard when answeredCount equals max", () => {
    const result = decideAdaptiveTransition({
      answeredCount: 12,
      minQuestionCount: 3,
      maxQuestionCount: 12,
      aiDecision: "continue",
    });
    expect(result).toBe("finish_by_max_guard");
  });

  it("finishes by max question guard when answeredCount exceeds max", () => {
    const result = decideAdaptiveTransition({
      answeredCount: 15,
      minQuestionCount: 3,
      maxQuestionCount: 12,
      aiDecision: "continue",
    });
    expect(result).toBe("finish_by_max_guard");
  });

  it("continues when AI tries to finish before minimum", () => {
    const result = decideAdaptiveTransition({
      answeredCount: 2,
      minQuestionCount: 3,
      maxQuestionCount: 12,
      aiDecision: "finish",
    });
    expect(result).toBe("continue");
  });

  it("finishes by AI after minimum question threshold", () => {
    const result = decideAdaptiveTransition({
      answeredCount: 4,
      minQuestionCount: 3,
      maxQuestionCount: 12,
      aiDecision: "finish",
    });
    expect(result).toBe("finish_by_ai");
  });

  it("continues when AI wants to continue and under max", () => {
    const result = decideAdaptiveTransition({
      answeredCount: 5,
      minQuestionCount: 3,
      maxQuestionCount: 12,
      aiDecision: "continue",
    });
    expect(result).toBe("continue");
  });

  it("continues at exactly minQuestionCount when AI says continue", () => {
    const result = decideAdaptiveTransition({
      answeredCount: 3,
      minQuestionCount: 3,
      maxQuestionCount: 12,
      aiDecision: "continue",
    });
    expect(result).toBe("continue");
  });

  it("finishes by AI at exactly minQuestionCount when AI says finish", () => {
    const result = decideAdaptiveTransition({
      answeredCount: 3,
      minQuestionCount: 3,
      maxQuestionCount: 12,
      aiDecision: "finish",
    });
    expect(result).toBe("finish_by_ai");
  });
});
