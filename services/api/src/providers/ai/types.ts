import type { SessionCompletionReason, SessionResult } from "@ainterview/shared";

export interface SessionTurnContext {
  turnIndex: number;
  questionText: string;
  answerTranscript: string;
}

export interface StartInterviewInput {
  templateTitle: string;
  templateCategory: string;
  templateDescription: string;
  systemInstruction: string;
  minQuestionCount: number;
  maxQuestionCount: number;
}

export interface StartInterviewResult {
  rubric: Record<string, unknown>;
  plannedCoverage: string[];
  plannedQuestionCount: number;
  firstQuestion: string;
}

export interface ContinueInterviewInput {
  templateTitle: string;
  templateCategory: string;
  templateDescription: string;
  systemInstruction: string;
  minQuestionCount: number;
  maxQuestionCount: number;
  plannedQuestionCount: number;
  rubric: unknown;
  plannedCoverage: unknown;
  turns: SessionTurnContext[];
}

export interface ContinueInterviewResult {
  decision: "continue" | "finish";
  nextQuestion?: string;
  reasoning: string;
}

export interface FinalizeInterviewInput {
  completionReason: SessionCompletionReason;
  turns: SessionTurnContext[];
}

export interface GenerateTemplateResult {
  title: string;
  category: string;
  description: string;
  systemInstruction: string;
}

export interface AiInterviewProvider {
  startInterview(input: StartInterviewInput): Promise<StartInterviewResult>;
  continueInterview(input: ContinueInterviewInput): Promise<ContinueInterviewResult>;
  finalizeInterview(input: FinalizeInterviewInput): Promise<SessionResult>;
  generateTemplate(prompt: string): Promise<GenerateTemplateResult>;
}
