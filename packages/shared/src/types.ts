export type SessionCompletionReason = "ai_completed" | "user_stopped" | "failed";

export type SessionStatus = "active" | "completed" | "failed";

export type AiDecision = "continue" | "finish";

export const DEFAULT_TEMPLATE_VOICE = "aura-2-thalia-en";

export const TEMPLATE_VOICE_OPTIONS = [
  { value: "aura-2-thalia-en", label: "Thalia" },
  { value: "aura-2-andromeda-en", label: "Andromeda" },
  { value: "aura-2-helena-en", label: "Helena" },
  { value: "aura-2-apollo-en", label: "Apollo" }
] as const;

export type TemplateVoiceModel = (typeof TEMPLATE_VOICE_OPTIONS)[number]["value"];

export interface SessionResultFeedback {
  strengths: string[];
  weakAreas: string[];
  suggestions: string[];
  summary: string;
}

export interface SessionResult {
  score: number;
  feedback: SessionResultFeedback;
}
