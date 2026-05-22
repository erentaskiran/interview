import Fastify from "fastify";
import cors from "@fastify/cors";
import { env } from "./config/env.js";
import { prismaPlugin } from "./plugins/prisma.js";
import { authPlugin } from "./plugins/auth.js";
import { createAiProvider } from "./providers/ai/index.js";
import { SpeechServiceClient } from "./clients/speech-service-client.js";
import { authRoutes } from "./routes/auth-routes.js";
import { templateRoutes } from "./routes/template-routes.js";
import { userRoutes } from "./routes/user-routes.js";
import { sessionRoutes } from "./routes/session-routes.js";

export const buildApp = () => {
  const app = Fastify({
    logger: env.NODE_ENV !== "test",
    bodyLimit: env.BODY_LIMIT_MB * 1024 * 1024,
  });

  app.decorate("aiProvider", createAiProvider(env));
  app.decorate("speechClient", new SpeechServiceClient({ baseUrl: env.SPEECH_SERVICE_URL }));

  void app.register(cors, {
    origin: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
    allowedHeaders: ["Authorization", "Content-Type", "Accept"],
    exposedHeaders: ["Content-Type"],
    optionsSuccessStatus: 204,
  });
  void app.register(prismaPlugin);
  void app.register(authPlugin, { jwtSecret: env.JWT_SECRET });

  app.get("/health", async () => ({ ok: true }));

  void app.register(authRoutes);
  void app.register(templateRoutes);
  void app.register(userRoutes);
  void app.register(sessionRoutes);

  return app;
};
