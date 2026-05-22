import Fastify from "fastify";
import { env } from "./config/env.js";
import { DeepgramClient } from "./clients/deepgram-client.js";
import { speechRoutes } from "./routes/speech-routes.js";

export const buildSpeechApp = () => {
  const app = Fastify({
    logger: env.NODE_ENV !== "test",
    bodyLimit: env.BODY_LIMIT_MB * 1024 * 1024,
  });

  const deepgramClient = new DeepgramClient({
    ...(env.DEEPGRAM_API_KEY ? { apiKey: env.DEEPGRAM_API_KEY } : {}),
    ttsModel: env.DEEPGRAM_TTS_MODEL,
    sttModel: env.DEEPGRAM_STT_MODEL,
  });

  app.get("/health", async () => ({ ok: true }));
  void app.register(speechRoutes(deepgramClient));

  return app;
};
