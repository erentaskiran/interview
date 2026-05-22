import type { Prisma } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { z } from "zod";
import type { FastifyPluginAsync } from "fastify";
import { DEFAULT_TEMPLATE_VOICE } from "@ainterview/shared";
import { getAuthUserId } from "../utils/auth.js";

const hasPrismaCode = (error: unknown, code: string) =>
  (error instanceof PrismaClientKnownRequestError && error.code === code) ||
  (typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === code);

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Unknown error";

const CreateTemplateSchema = z.object({
  title: z.string().min(3).max(140),
  category: z.string().min(2).max(80),
  description: z.string().min(10).max(1500),
  systemInstruction: z.string().min(10).max(8000),
  voiceModel: z.string().min(1).max(120).optional(),
});

export const templateRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post("/templates", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const parsed = CreateTemplateSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ message: "Invalid payload" });
    }

    const userId = getAuthUserId(request);
    const template = await fastify.prisma.interviewTemplate.create({
      data: {
        authorId: userId,
        title: parsed.data.title,
        category: parsed.data.category,
        description: parsed.data.description,
        systemInstruction: parsed.data.systemInstruction,
        voiceModel: parsed.data.voiceModel ?? DEFAULT_TEMPLATE_VOICE,
        isPublic: true,
      },
      include: {
        author: { select: { id: true, displayName: true } },
        _count: { select: { likes: true } },
      },
    });
    return reply.code(201).send(template);
  });

  fastify.post(
    "/templates/generate",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const body = z.object({ prompt: z.string().min(5).max(2000) }).safeParse(request.body);
      if (!body.success) {
        return reply.code(400).send({ message: "Invalid payload" });
      }

      try {
        const generated = await fastify.aiProvider.generateTemplate(body.data.prompt);
        return reply.code(200).send(generated);
      } catch (error) {
        const detail = getErrorMessage(error);
        request.log.error({ err: error }, "AI template generation failed");

        if (detail.includes("could not connect") || detail.includes("fetch failed")) {
          return reply.code(503).send({
            message:
              "AI service unavailable. Check OPENCODE_API_URL and make sure the AI server is running.",
            detail,
          });
        }

        return reply.code(502).send({ message: "AI generation failed", detail });
      }
    }
  );

  fastify.get("/templates", async (request) => {
    const query = z
      .object({
        category: z.string().optional(),
        q: z.string().optional(),
      })
      .safeParse(request.query);

    const where: Prisma.InterviewTemplateWhereInput = { isPublic: true };
    if (query.success && query.data.category) {
      where.category = query.data.category;
    }
    if (query.success && query.data.q) {
      where.OR = [
        { title: { contains: query.data.q, mode: "insensitive" } },
        { category: { contains: query.data.q, mode: "insensitive" } },
        {
          description: {
            contains: query.data.q,
            mode: "insensitive",
          },
        },
      ];
    }

    const templates = await fastify.prisma.interviewTemplate.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, displayName: true } },
        _count: { select: { likes: true } },
      },
    });
    return { templates };
  });

  fastify.get("/templates/:id", async (request, reply) => {
    const params = z.object({ id: z.string().min(1) }).safeParse(request.params);
    if (!params.success) {
      return reply.code(400).send({ message: "Invalid template id" });
    }

    const template = await fastify.prisma.interviewTemplate.findUnique({
      where: { id: params.data.id },
      include: {
        author: { select: { id: true, displayName: true } },
        _count: { select: { likes: true } },
      },
    });
    if (!template || !template.isPublic) {
      return reply.code(404).send({ message: "Template not found" });
    }

    return { template };
  });

  fastify.post(
    "/templates/:id/like",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const params = z.object({ id: z.string().min(1) }).safeParse(request.params);
      if (!params.success) {
        return reply.code(400).send({ message: "Invalid template id" });
      }
      const userId = getAuthUserId(request);

      const template = await fastify.prisma.interviewTemplate.findUnique({
        where: { id: params.data.id },
        select: { id: true, isPublic: true },
      });
      if (!template || !template.isPublic) {
        return reply.code(404).send({ message: "Template not found" });
      }

      try {
        await fastify.prisma.templateLike.create({
          data: {
            userId,
            templateId: template.id,
          },
        });
      } catch (error) {
        if (hasPrismaCode(error, "P2002")) {
          return { success: true };
        }
        throw error;
      }

      return reply.code(201).send({ success: true });
    }
  );

  fastify.delete(
    "/templates/:id/like",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const params = z.object({ id: z.string().min(1) }).safeParse(request.params);
      if (!params.success) {
        return reply.code(400).send({ message: "Invalid template id" });
      }
      const userId = getAuthUserId(request);

      await fastify.prisma.templateLike.deleteMany({
        where: {
          userId,
          templateId: params.data.id,
        },
      });

      return { success: true };
    }
  );
};
