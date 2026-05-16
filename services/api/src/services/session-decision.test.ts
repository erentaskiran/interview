import { describe, expect, it } from "vitest";
import { decideAdaptiveTransition } from "./session-decision.js";

describe("decideAdaptiveTransition", () => {
  it("finishes by max question guard", () => {
    expect(
      decideAdaptiveTransition({
        answeredCount: 12,
        minQuestionCount: 3,
        maxQuestionCount: 12,
        aiDecision: "continue"
      })
    ).toBe("finish_by_max_guard");
  });

  it("continues when AI tries to finish before minimum", () => {
    expect(
      decideAdaptiveTransition({
        answeredCount: 2,
        minQuestionCount: 3,
        maxQuestionCount: 12,
        aiDecision: "finish"
      })
    ).toBe("continue");
  });

  it("finishes by AI after minimum question threshold", () => {
    expect(
      decideAdaptiveTransition({
        answeredCount: 4,
        minQuestionCount: 3,
        maxQuestionCount: 12,
        aiDecision: "finish"
      })
    ).toBe("finish_by_ai");
  });
});
