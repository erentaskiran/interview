import { z } from "zod";
import type { FastifyPluginAsync } from "fastify";
import { hashPassword, verifyPassword } from "../services/password-service.js";
import { getAuthUserId } from "../utils/auth.js";

const RegisterSchema = z.object({
  email: z.string().email(),
  displayName: z.string().min(2).max(60),
  password: z.string().min(8).max(100)
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100)
});

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post("/auth/register", async (request, reply) => {
    const parsed = RegisterSchema.safeParse(request.body);
    if (!parsed.success) {
      const detail = parsed.error.issues
        .map((issue) => `${issue.path.join(".") || "body"}: ${issue.message}`)
        .join("; ");
      return reply.code(400).send({ message: `Invalid payload. ${detail}` });
    }

    const exists = await fastify.prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() }
    });
    if (exists) {
      return reply.code(409).send({ message: "Email already registered" });
    }

    const user = await fastify.prisma.user.create({
      data: {
        email: parsed.data.email.toLowerCase(),
        displayName: parsed.data.displayName,
        passwordHash: await hashPassword(parsed.data.password)
      }
    });

    const token = await reply.jwtSign({ sub: user.id, email: user.email });
    return reply.code(201).send({
      token,
      user: { id: user.id, email: user.email, displayName: user.displayName }
    });
  });

  fastify.post("/auth/login", async (request, reply) => {
    const parsed = LoginSchema.safeParse(request.body);
    if (!parsed.success) {
      const detail = parsed.error.issues
        .map((issue) => `${issue.path.join(".") || "body"}: ${issue.message}`)
        .join("; ");
      return reply.code(400).send({ message: `Invalid payload. ${detail}` });
    }

    const user = await fastify.prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() }
    });
    if (!user) {
      return reply.code(401).send({ message: "Invalid credentials" });
    }

    const isValid = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!isValid) {
      return reply.code(401).send({ message: "Invalid credentials" });
    }

    const token = await reply.jwtSign({ sub: user.id, email: user.email });
    return {
      token,
      user: { id: user.id, email: user.email, displayName: user.displayName }
    };
  });

  fastify.get(
    "/auth/me",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const userId = getAuthUserId(request);
      const user = await fastify.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          displayName: true,
          createdAt: true
        }
      });
      if (!user) {
        return reply.code(404).send({ message: "User not found" });
      }
      return { user };
    }
  );
};
