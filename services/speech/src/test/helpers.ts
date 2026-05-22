import Fastify from "fastify";
import { DeepgramClient } from "../clients/deepgram-client.js";
import { speechRoutes } from "../routes/speech-routes.js";

export async function buildTestSpeechApp(deepgramClient?: DeepgramClient) {
  const app = Fastify({
    logger: false,
    bodyLimit: 50 * 1024 * 1024,
  });

  app.get("/health", async () => ({ ok: true }));

  const client =
    deepgramClient ??
    new DeepgramClient({
      apiKey: "test-key",
      ttsModel: "aura-2-thalia-en",
      sttModel: "nova-3",
    });

  await app.register(speechRoutes(client));

  return app;
}
