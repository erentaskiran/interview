import { PrismaClient } from "@prisma/client";
import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import { prismaPlugin } from "../plugins/prisma.js";
import { authPlugin } from "../plugins/auth.js";
import { authRoutes } from "../routes/auth-routes.js";
import { templateRoutes } from "../routes/template-routes.js";
import { userRoutes } from "../routes/user-routes.js";
import { sessionRoutes } from "../routes/session-routes.js";
import { MockAiProvider } from "../providers/ai/mock-ai-provider.js";
import { SpeechServiceClient } from "../clients/speech-service-client.js";

const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ||
  "postgresql://ainterview:ainterview@localhost:5432/ainterview_test";

export const prisma = new PrismaClient({
  datasources: { db: { url: TEST_DATABASE_URL } },
});

export async function cleanDatabase() {
  await prisma.$executeRawUnsafe(`SET CONSTRAINTS ALL DEFERRED`);
  await prisma.interviewTurn.deleteMany({});
  await prisma.interviewSession.deleteMany({});
  await prisma.templateLike.deleteMany({});
  await prisma.interviewTemplate.deleteMany({});
  await prisma.userFollow.deleteMany({});
  await prisma.user.deleteMany({});
}

export async function buildTestApp() {
  const app = Fastify({
    logger: false,
    bodyLimit: 50 * 1024 * 1024,
  });

  app.decorate("aiProvider", new MockAiProvider());
  app.decorate("speechClient", {
    textToSpeech: async () => ({ audioBase64: "mock-audio", mimeType: "audio/mp3" }),
    speechToText: async () => "mock transcript",
  } as unknown as SpeechServiceClient);

  await app.register(cors, {
    origin: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
  });
  app.decorate("prisma", prisma);
  await app.register(authPlugin, { jwtSecret: "test-secret-key-for-jwt-123" });

  app.get("/health", async () => ({ ok: true }));

  await app.register(authRoutes);
  await app.register(templateRoutes);
  await app.register(userRoutes);
  await app.register(sessionRoutes);

  return app;
}

export async function createTestUser(
  app: Awaited<ReturnType<typeof buildTestApp>>,
  data: { email: string; displayName: string; password: string }
) {
  const response = await app.inject({
    method: "POST",
    url: "/auth/register",
    payload: data,
  });
  return JSON.parse(response.body) as {
    token: string;
    user: { id: string; email: string; displayName: string };
  };
}

export async function createTestTemplate(
  app: Awaited<ReturnType<typeof buildTestApp>>,
  token: string,
  data?: Partial<{
    title: string;
    category: string;
    description: string;
    systemInstruction: string;
  }>
) {
  const payload = {
    title: data?.title || "Test Template",
    category: data?.category || "Engineering",
    description: data?.description || "A test template description that is long enough.",
    systemInstruction:
      data?.systemInstruction || "You are a test interviewer. Ask relevant questions.",
    voiceModel: "aura-2-thalia-en",
  };

  const response = await app.inject({
    method: "POST",
    url: "/templates",
    headers: { authorization: `Bearer ${token}` },
    payload,
  });
  const body = JSON.parse(response.body);
  if (response.statusCode !== 201) {
    throw new Error(`Failed to create template: ${response.statusCode} - ${JSON.stringify(body)}`);
  }
  return body as {
    id: string;
    title: string;
    category: string;
    authorId: string;
  };
}
