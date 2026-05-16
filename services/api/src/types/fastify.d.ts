import type { PrismaClient } from "@prisma/client";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { AiInterviewProvider } from "../providers/ai/types.js";
import type { SpeechServiceClient } from "../clients/speech-service-client.js";

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
    aiProvider: AiInterviewProvider;
    speechClient: SpeechServiceClient;
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}
