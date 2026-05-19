import { z } from "zod";
import type { FastifyPluginAsync } from "fastify";
import {
  answerAdaptiveSession,
  manualFinishSession,
  startAdaptiveSession,
} from "../services/session-service.js";
import { getAuthUserId } from "../utils/auth.js";

const StartSessionSchema = z.object({
  templateId: z.string().min(1),
});

const AnswerSessionSchema = z.object({
  answerTranscript: z.string().min(1).optional(),
  answerAudioBase64: z.string().min(1).optional(),
  answerAudioMimeType: z.string().min(1).optional(),
  answerAudioRef: z.string().min(1).optional(),
});

const IdParamSchema = z.object({ id: z.string().min(1) });
const ListSessionsQuerySchema = z.object({
  status: z.enum(["active", "completed", "failed"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(30),
});
const QuestionAudioQuerySchema = z.object({
  turnIndex: z.coerce.number().int().min(1).optional(),
});

const mapSessionError = (error: unknown) => {
  const message = error instanceof Error ? error.message : "UNKNOWN";
  switch (message) {
    case "SESSION_NOT_FOUND":
      return { status: 404, message: "Session not found" };
    case "SESSION_NOT_ACTIVE":
      return { status: 409, message: "Session is not active" };
    case "NO_PENDING_QUESTION":
      return { status: 409, message: "No pending question in session" };
    case "TRANSCRIPT_OR_AUDIO_REQUIRED":
      return { status: 400, message: "Either answerTranscript or audio payload is required" };
    case "AT_LEAST_ONE_ANSWER_REQUIRED":
      return { status: 400, message: "At least one answered question is required to finish" };
    default:
      return { status: 500, message: "Session processing failed" };
  }
};

export const sessionRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/sessions", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const parsed = ListSessionsQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      return reply.code(400).send({ message: "Invalid query params" });
    }

    const where = {
      userId: getAuthUserId(request),
      ...(parsed.data.status ? { status: parsed.data.status } : {}),
    };

    const [sessions, totalCount] = await Promise.all([
      fastify.prisma.interviewSession.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: parsed.data.limit,
        include: {
          template: {
            select: {
              id: true,
              title: true,
              category: true,
            },
          },
          _count: {
            select: {
              turns: true,
            },
          },
        },
      }),
      fastify.prisma.interviewSession.count({ where }),
    ]);

    return { sessions, totalCount };
  });

  fastify.post("/sessions", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const parsed = StartSessionSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ message: "Invalid payload" });
    }

    const template = await fastify.prisma.interviewTemplate.findUnique({
      where: { id: parsed.data.templateId },
    });
    if (!template || !template.isPublic) {
      return reply.code(404).send({ message: "Template not found" });
    }

    try {
      const started = await startAdaptiveSession({
        prisma: fastify.prisma,
        aiProvider: fastify.aiProvider,
        speechClient: fastify.speechClient,
        userId: getAuthUserId(request),
        template,
      });
      return reply.code(201).send(started);
    } catch (error) {
      request.log.error(error);
      return reply.code(502).send({ message: "Failed to initialize interview session" });
    }
  });

  fastify.post(
    "/sessions/:id/answer",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const params = IdParamSchema.safeParse(request.params);
      const payload = AnswerSessionSchema.safeParse(request.body);
      if (!params.success || !payload.success) {
        return reply.code(400).send({ message: "Invalid payload" });
      }

      const input: Parameters<typeof answerAdaptiveSession>[0] = {
        prisma: fastify.prisma,
        aiProvider: fastify.aiProvider,
        speechClient: fastify.speechClient,
        sessionId: params.data.id,
        userId: getAuthUserId(request),
      };
      if (payload.data.answerTranscript !== undefined) {
        input.answerTranscript = payload.data.answerTranscript;
      }
      if (payload.data.answerAudioBase64 !== undefined) {
        input.answerAudioBase64 = payload.data.answerAudioBase64;
      }
      if (payload.data.answerAudioMimeType !== undefined) {
        input.answerAudioMimeType = payload.data.answerAudioMimeType;
      }
      if (payload.data.answerAudioRef !== undefined) {
        input.answerAudioRef = payload.data.answerAudioRef;
      }

      try {
        const result = await answerAdaptiveSession(input);
        return result;
      } catch (error) {
        const mapped = mapSessionError(error);
        request.log.error(error);
        return reply.code(mapped.status).send({ message: mapped.message });
      }
    }
  );

  fastify.post(
    "/sessions/:id/finish",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const params = IdParamSchema.safeParse(request.params);
      if (!params.success) {
        return reply.code(400).send({ message: "Invalid session id" });
      }

      try {
        const session = await manualFinishSession({
          prisma: fastify.prisma,
          aiProvider: fastify.aiProvider,
          sessionId: params.data.id,
          userId: getAuthUserId(request),
        });
        return { session };
      } catch (error) {
        const mapped = mapSessionError(error);
        request.log.error(error);
        return reply.code(mapped.status).send({ message: mapped.message });
      }
    }
  );

  fastify.get(
    "/sessions/:id/question-audio",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const params = IdParamSchema.safeParse(request.params);
      const query = QuestionAudioQuerySchema.safeParse(request.query);
      if (!params.success || !query.success) {
        return reply.code(400).send({ message: "Invalid session query" });
      }

      const session = await fastify.prisma.interviewSession.findFirst({
        where: {
          id: params.data.id,
          userId: getAuthUserId(request),
        },
        include: {
          turns: { orderBy: { turnIndex: "asc" } },
          template: {
            select: {
              voiceModel: true,
            },
          },
        },
      });
      if (!session) {
        return reply.code(404).send({ message: "Session not found" });
      }

      const turn =
        query.data.turnIndex !== undefined
          ? session.turns.find((item) => item.turnIndex === query.data.turnIndex)
          : session.turns.find((item) => !item.answerTranscript);

      if (!turn) {
        return reply.code(404).send({ message: "Question turn not found" });
      }

      try {
        const audio = await fastify.speechClient.textToSpeech(
          turn.questionText,
          session.template.voiceModel
        );
        return { turnId: turn.id, turnIndex: turn.turnIndex, audio };
      } catch (error) {
        request.log.error(error);
        return reply.code(502).send({ message: "Question audio generation failed" });
      }
    }
  );

  fastify.get("/sessions/:id", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const params = IdParamSchema.safeParse(request.params);
    if (!params.success) {
      return reply.code(400).send({ message: "Invalid session id" });
    }

    const session = await fastify.prisma.interviewSession.findFirst({
      where: {
        id: params.data.id,
        userId: getAuthUserId(request),
      },
      include: {
        turns: { orderBy: { turnIndex: "asc" } },
        template: {
          select: {
            id: true,
            title: true,
            category: true,
            voiceModel: true,
          },
        },
      },
    });

    if (!session) {
      return reply.code(404).send({ message: "Session not found" });
    }
    return { session };
  });
};
