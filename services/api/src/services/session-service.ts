import type { SessionCompletionReason } from "@ainterview/shared";
import type {
  InterviewSession,
  InterviewTemplate,
  InterviewTurn,
  Prisma,
  PrismaClient,
} from "@prisma/client";
import type { AiInterviewProvider } from "../providers/ai/types.js";
import type { SpeechServiceClient } from "../clients/speech-service-client.js";
import { decideAdaptiveTransition } from "./session-decision.js";

export const MIN_QUESTIONS = 3;
export const MAX_QUESTIONS = 12;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const answeredTurns = (turns: InterviewTurn[]) =>
  turns
    .filter((turn) => Boolean(turn.answerTranscript))
    .sort((a, b) => a.turnIndex - b.turnIndex)
    .map((turn) => ({
      turnIndex: turn.turnIndex,
      questionText: turn.questionText,
      answerTranscript: turn.answerTranscript ?? "",
    }));

const synthesizeQuestionAudio = async (
  speechClient: SpeechServiceClient,
  questionText: string,
  voiceModel: string
) => {
  try {
    return await speechClient.textToSpeech(questionText, voiceModel);
  } catch {
    return undefined;
  }
};

const finalizeSession = async ({
  prisma,
  aiProvider,
  session,
  turns,
  completionReason,
}: {
  prisma: PrismaClient;
  aiProvider: AiInterviewProvider;
  session: InterviewSession;
  turns: InterviewTurn[];
  completionReason: SessionCompletionReason;
}) => {
  const contextTurns = answeredTurns(turns);
  const result = await aiProvider.finalizeInterview({
    completionReason,
    turns: contextTurns,
  });

  const updated = await prisma.interviewSession.update({
    where: { id: session.id },
    data: {
      status: "completed",
      completionReason,
      score: result.score,
      feedback: result.feedback as unknown as Prisma.InputJsonValue,
      completedAt: new Date(),
    },
    include: {
      turns: { orderBy: { turnIndex: "asc" } },
      template: true,
    },
  });

  return updated;
};

const markSessionFailed = async (prisma: PrismaClient, sessionId: string) => {
  await prisma.interviewSession.update({
    where: { id: sessionId },
    data: {
      status: "failed",
      completionReason: "failed",
      completedAt: new Date(),
    },
  });
};

export const startAdaptiveSession = async ({
  prisma,
  aiProvider,
  speechClient,
  userId,
  template,
}: {
  prisma: PrismaClient;
  aiProvider: AiInterviewProvider;
  speechClient: SpeechServiceClient;
  userId: string;
  template: InterviewTemplate;
}) => {
  const plan = await aiProvider.startInterview({
    templateTitle: template.title,
    templateCategory: template.category,
    templateDescription: template.description,
    systemInstruction: template.systemInstruction,
    minQuestionCount: MIN_QUESTIONS,
    maxQuestionCount: MAX_QUESTIONS,
  });

  const boundedPlannedCount = clamp(plan.plannedQuestionCount, MIN_QUESTIONS, MAX_QUESTIONS);

  const ttsPayload = await synthesizeQuestionAudio(
    speechClient,
    plan.firstQuestion,
    template.voiceModel
  );

  const session = await prisma.interviewSession.create({
    data: {
      userId,
      templateId: template.id,
      status: "active",
      minQuestionCount: MIN_QUESTIONS,
      maxQuestionCount: MAX_QUESTIONS,
      plannedQuestionCount: boundedPlannedCount,
      rubric: plan.rubric as Prisma.InputJsonValue,
      plannedCoverage: plan.plannedCoverage as Prisma.InputJsonValue,
      turns: {
        create: {
          turnIndex: 1,
          questionText: plan.firstQuestion,
          questionAudioRef: ttsPayload ? "inline-generated" : null,
        },
      },
    },
    include: {
      turns: { orderBy: { turnIndex: "asc" } },
      template: true,
    },
  });

  return { session, firstQuestionAudio: ttsPayload };
};

export const answerAdaptiveSession = async ({
  prisma,
  aiProvider,
  speechClient,
  sessionId,
  userId,
  answerTranscript,
  answerAudioBase64,
  answerAudioMimeType,
  answerAudioRef,
}: {
  prisma: PrismaClient;
  aiProvider: AiInterviewProvider;
  speechClient: SpeechServiceClient;
  sessionId: string;
  userId: string;
  answerTranscript?: string;
  answerAudioBase64?: string;
  answerAudioMimeType?: string;
  answerAudioRef?: string;
}) => {
  const session = await prisma.interviewSession.findFirst({
    where: { id: sessionId, userId },
    include: {
      turns: { orderBy: { turnIndex: "asc" } },
      template: true,
    },
  });

  if (!session) {
    throw new Error("SESSION_NOT_FOUND");
  }
  if (session.status !== "active") {
    throw new Error("SESSION_NOT_ACTIVE");
  }

  const pendingTurn = session.turns.find((turn) => !turn.answerTranscript);
  if (!pendingTurn) {
    throw new Error("NO_PENDING_QUESTION");
  }

  let transcript = answerTranscript;
  if (!transcript) {
    if (!answerAudioBase64 || !answerAudioMimeType) {
      throw new Error("TRANSCRIPT_OR_AUDIO_REQUIRED");
    }
    transcript = await speechClient.speechToText(answerAudioBase64, answerAudioMimeType);
  }

  await prisma.interviewTurn.update({
    where: { id: pendingTurn.id },
    data: {
      answerTranscript: transcript,
      answerAudioRef: answerAudioRef ?? null,
    },
  });

  const refreshedTurns = await prisma.interviewTurn.findMany({
    where: { sessionId: session.id },
    orderBy: { turnIndex: "asc" },
  });

  const contextTurns = answeredTurns(refreshedTurns);
  const answeredCount = contextTurns.length;

  if (answeredCount >= session.maxQuestionCount) {
    try {
      return {
        session: await finalizeSession({
          prisma,
          aiProvider,
          session,
          turns: refreshedTurns,
          completionReason: "ai_completed",
        }),
        transition: "finished_max_guard" as const,
      };
    } catch (error) {
      await markSessionFailed(prisma, session.id);
      throw error;
    }
  }

  let decision: Awaited<ReturnType<AiInterviewProvider["continueInterview"]>>;
  try {
    decision = await aiProvider.continueInterview({
      minQuestionCount: session.minQuestionCount,
      maxQuestionCount: session.maxQuestionCount,
      plannedQuestionCount: session.plannedQuestionCount,
      turns: contextTurns,
    });
  } catch (error) {
    await markSessionFailed(prisma, session.id);
    throw error;
  }

  const transition = decideAdaptiveTransition({
    answeredCount,
    minQuestionCount: session.minQuestionCount,
    maxQuestionCount: session.maxQuestionCount,
    aiDecision: decision.decision,
  });

  if (transition === "finish_by_max_guard" || transition === "finish_by_ai") {
    try {
      return {
        session: await finalizeSession({
          prisma,
          aiProvider,
          session,
          turns: refreshedTurns,
          completionReason: "ai_completed",
        }),
        transition:
          transition === "finish_by_max_guard"
            ? ("finished_max_guard" as const)
            : ("finished_by_ai" as const),
      };
    } catch (error) {
      await markSessionFailed(prisma, session.id);
      throw error;
    }
  }

  const nextQuestion =
    decision.nextQuestion ?? "Can you expand on your previous answer with a concrete example?";

  const nextQuestionAudio = await synthesizeQuestionAudio(
    speechClient,
    nextQuestion,
    session.template.voiceModel
  );

  const nextTurn = await prisma.interviewTurn.create({
    data: {
      sessionId: session.id,
      turnIndex: refreshedTurns.length + 1,
      questionText: nextQuestion,
      questionAudioRef: nextQuestionAudio ? "inline-generated" : null,
      aiDecisionMetadata: {
        reasoning: decision.reasoning,
        forcedContinueByMinGuard:
          answeredCount < session.minQuestionCount && decision.decision === "finish",
      } as Prisma.InputJsonValue,
    },
  });

  return {
    session: await prisma.interviewSession.findUniqueOrThrow({
      where: { id: session.id },
      include: {
        turns: { orderBy: { turnIndex: "asc" } },
        template: true,
      },
    }),
    nextTurn,
    nextQuestionAudio,
    transition: "continued" as const,
  };
};

export const manualFinishSession = async ({
  prisma,
  aiProvider,
  sessionId,
  userId,
}: {
  prisma: PrismaClient;
  aiProvider: AiInterviewProvider;
  sessionId: string;
  userId: string;
}) => {
  const session = await prisma.interviewSession.findFirst({
    where: { id: sessionId, userId },
    include: { turns: { orderBy: { turnIndex: "asc" } }, template: true },
  });
  if (!session) {
    throw new Error("SESSION_NOT_FOUND");
  }
  if (session.status !== "active") {
    throw new Error("SESSION_NOT_ACTIVE");
  }

  const answeredCount = answeredTurns(session.turns).length;
  if (answeredCount < 1) {
    throw new Error("AT_LEAST_ONE_ANSWER_REQUIRED");
  }

  try {
    return await finalizeSession({
      prisma,
      aiProvider,
      session,
      turns: session.turns,
      completionReason: "user_stopped",
    });
  } catch (error) {
    await markSessionFailed(prisma, session.id);
    throw error;
  }
};
