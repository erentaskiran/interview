export type User = {
  id: string;
  email: string;
  displayName: string;
};

export type Template = {
  id: string;
  title: string;
  category: string;
  description: string;
  systemInstruction: string;
  voiceModel?: string;
  authorId: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    displayName: string;
  };
  _count?: {
    likes: number;
  };
};

export type SessionCompletionReason = "ai_completed" | "user_stopped" | "failed";
export type SessionStatus = "active" | "completed" | "failed";

export type SessionTurn = {
  id: string;
  sessionId: string;
  turnIndex: number;
  questionText: string;
  questionAudioRef: string | null;
  answerAudioRef: string | null;
  answerTranscript: string | null;
  aiDecisionMetadata: unknown;
  createdAt: string;
  updatedAt: string;
};

export type SessionFeedback = {
  strengths?: string[];
  weakAreas?: string[];
  suggestions?: string[];
  summary?: string;
};

export type Session = {
  id: string;
  userId: string;
  templateId: string;
  status: SessionStatus;
  minQuestionCount: number;
  maxQuestionCount: number;
  plannedQuestionCount: number;
  rubric: unknown;
  plannedCoverage: unknown;
  score: number | null;
  feedback: SessionFeedback | null;
  completionReason: SessionCompletionReason | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  template?:
    | {
        id: string;
        title: string;
        category: string;
        voiceModel?: string;
      }
    | Template;
  _count?: {
    turns: number;
  };
  turns: SessionTurn[];
};

export type TtsPayload = {
  audioBase64: string;
  mimeType: string;
};
