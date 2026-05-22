import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { z } from "zod";
import type { FastifyPluginAsync } from "fastify";
import { getAuthUserId } from "../utils/auth.js";

const hasPrismaCode = (error: unknown, code: string) =>
  (error instanceof PrismaClientKnownRequestError && error.code === code) ||
  (typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === code);

export const userRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/users/:id/profile", async (request, reply) => {
    const params = z.object({ id: z.string().min(1) }).safeParse(request.params);
    if (!params.success) {
      return reply.code(400).send({ message: "Invalid user id" });
    }

    const user = await fastify.prisma.user.findUnique({
      where: { id: params.data.id },
      select: {
        id: true,
        displayName: true,
        createdAt: true,
        _count: {
          select: {
            followers: true,
            following: true,
            templates: true,
          },
        },
      },
    });
    if (!user) {
      return reply.code(404).send({ message: "User not found" });
    }

    let viewerId: string | null = null;
    if (request.headers.authorization) {
      try {
        await request.jwtVerify();
        viewerId = getAuthUserId(request);
      } catch {
        viewerId = null;
      }
    }

    const [templates, likedTemplates, followRecord] = await Promise.all([
      fastify.prisma.interviewTemplate.findMany({
        where: { authorId: user.id, isPublic: true },
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { likes: true } },
        },
      }),
      fastify.prisma.templateLike.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        include: {
          template: {
            include: {
              author: { select: { id: true, displayName: true } },
              _count: { select: { likes: true } },
            },
          },
        },
      }),
      viewerId && viewerId !== user.id
        ? fastify.prisma.userFollow.findUnique({
            where: {
              followerId_followingId: {
                followerId: viewerId,
                followingId: user.id,
              },
            },
            select: { id: true },
          })
        : Promise.resolve(null),
    ]);

    return {
      user,
      templates,
      likedTemplates: likedTemplates.map((entry) => entry.template),
      viewer: viewerId
        ? {
            isSelf: viewerId === user.id,
            isFollowing: Boolean(followRecord),
          }
        : undefined,
    };
  });

  fastify.post(
    "/users/:id/follow",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const params = z.object({ id: z.string().min(1) }).safeParse(request.params);
      if (!params.success) {
        return reply.code(400).send({ message: "Invalid user id" });
      }

      const followerId = getAuthUserId(request);
      const followingId = params.data.id;
      if (followerId === followingId) {
        return reply.code(400).send({ message: "Cannot follow yourself" });
      }

      const targetUser = await fastify.prisma.user.findUnique({
        where: { id: followingId },
        select: { id: true },
      });
      if (!targetUser) {
        return reply.code(404).send({ message: "User not found" });
      }

      try {
        await fastify.prisma.userFollow.create({
          data: { followerId, followingId },
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

  fastify.delete("/users/:id/follow", { preHandler: [fastify.authenticate] }, async (request) => {
    const params = z.object({ id: z.string().min(1) }).safeParse(request.params);
    if (!params.success) {
      return { success: false };
    }

    await fastify.prisma.userFollow.deleteMany({
      where: {
        followerId: getAuthUserId(request),
        followingId: params.data.id,
      },
    });
    return { success: true };
  });
};
