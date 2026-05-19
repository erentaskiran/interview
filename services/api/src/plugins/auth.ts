import fp from "fastify-plugin";
import jwt from "@fastify/jwt";
import type { FastifyReply, FastifyRequest } from "fastify";

export const authPlugin = fp<{ jwtSecret: string }>(async (fastify, opts) => {
  await fastify.register(jwt as never, { secret: opts.jwtSecret });

  fastify.decorate("authenticate", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch {
      reply.code(401).send({ message: "Unauthorized" });
    }
  });
});
