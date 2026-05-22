import { describe, expect, it, vi } from "vitest";
import { answerAdaptiveSession } from "./session-service.js";
import type { AiInterviewProvider } from "../providers/ai/types.js";

describe("answerAdaptiveSession", () => {
  it("fails the session when AI continues without a next question", async () => {
    const now = new Date();
    const session = {
      id: "session-1",
      userId: "user-1",
      templateId: "template-1",
      status: "active",
      minQuestionCount: 3,
      maxQuestionCount: 12,
      plannedQuestionCount: 5,
      rubric: { depth: "specific examples" },
      plannedCoverage: ["scope", "tradeoffs"],
      createdAt: now,
      updatedAt: now,
      completedAt: null,
      completionReason: null,
      score: null,
      feedback: null,
      template: {
        id: "template-1",
        title: "Engineering Interview",
        category: "Engineering",
        description: "Backend engineering interview",
        systemInstruction: "Ask adaptive questions",
        voiceModel: "aura-2-thalia-en"
      },
      turns: [
        {
          id: "turn-1",
          sessionId: "session-1",
          turnIndex: 1,
          questionText: "Tell me about a backend system you designed.",
          answerTranscript: null,
          answerAudioRef: null,
          questionAudioRef: null,
          aiDecisionMetadata: null,
          createdAt: now,
          updatedAt: now
        }
      ]
    };

    const answeredTurn = {
      ...session.turns[0],
      answerTranscript: "I designed a queue-backed workflow."
    };

    const prisma = {
      interviewSession: {
        findFirst: vi.fn().mockResolvedValue(session),
        update: vi.fn().mockResolvedValue({ ...session, status: "failed" })
      },
      interviewTurn: {
        update: vi.fn().mockResolvedValue(answeredTurn),
        findMany: vi.fn().mockResolvedValue([answeredTurn]),
        create: vi.fn()
      }
    };

    const aiProvider = {
      continueInterview: vi.fn().mockResolvedValue({
        decision: "continue",
        reasoning: "Needs more depth"
      }),
      startInterview: vi.fn(),
      finalizeInterview: vi.fn(),
      generateTemplate: vi.fn()
    } as unknown as AiInterviewProvider;

    const speechClient = {
      speechToText: vi.fn(),
      textToSpeech: vi.fn()
    };

    await expect(
      answerAdaptiveSession({
        prisma: prisma as never,
        aiProvider,
        speechClient: speechClient as never,
        sessionId: "session-1",
        userId: "user-1",
        answerTranscript: "I designed a queue-backed workflow."
      })
    ).rejects.toThrow("AI_NEXT_QUESTION_REQUIRED");

    expect(prisma.interviewTurn.create).not.toHaveBeenCalled();
    expect(prisma.interviewSession.update).toHaveBeenCalledWith({
      where: { id: "session-1" },
      data: {
        status: "failed",
        completionReason: "failed",
        completedAt: expect.any(Date)
      }
    });
    expect(aiProvider.continueInterview).toHaveBeenCalledWith(
      expect.objectContaining({
        templateTitle: "Engineering Interview",
        rubric: { depth: "specific examples" },
        plannedCoverage: ["scope", "tradeoffs"]
      })
    );
  });
});
