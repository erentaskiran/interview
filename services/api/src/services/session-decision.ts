export type DecisionInput = {
  answeredCount: number;
  minQuestionCount: number;
  maxQuestionCount: number;
  aiDecision: "continue" | "finish";
};

export type DecisionOutcome = "finish_by_max_guard" | "finish_by_ai" | "continue";

export const decideAdaptiveTransition = (input: DecisionInput): DecisionOutcome => {
  if (input.answeredCount >= input.maxQuestionCount) {
    return "finish_by_max_guard";
  }

  if (input.aiDecision === "finish" && input.answeredCount >= input.minQuestionCount) {
    return "finish_by_ai";
  }

  return "continue";
};
