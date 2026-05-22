import { z } from "zod";
import type { FastifyPluginAsync } from "fastify";
import { DeepgramClient } from "../clients/deepgram-client.js";

const TtsSchema = z.object({
  text: z.string().min(1).max(5000),
  voiceModel: z.string().min(1).max(120).optional(),
});

const SttSchema = z.object({
  audioBase64: z.string().min(1),
  mimeType: z.string().min(1),
});

export const speechRoutes =
  (deepgramClient: DeepgramClient): FastifyPluginAsync =>
  async (fastify) => {
    fastify.post("/tts", async (request, reply) => {
      const parsed = TtsSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ message: "Invalid payload" });
      }
      try {
        const audio = await deepgramClient.textToSpeech(parsed.data.text, parsed.data.voiceModel);
        return audio;
      } catch (error) {
        if (error instanceof Error && error.message === "DEEPGRAM_NOT_CONFIGURED") {
          return reply.code(503).send({ message: "Deepgram is not configured" });
        }
        request.log.error(error);
        return reply.code(502).send({ message: "TTS failed" });
      }
    });

    fastify.post("/stt", async (request, reply) => {
      const parsed = SttSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ message: "Invalid payload" });
      }
      try {
        const transcript = await deepgramClient.speechToText(
          parsed.data.audioBase64,
          parsed.data.mimeType
        );
        return { transcript };
      } catch (error) {
        if (error instanceof Error && error.message === "DEEPGRAM_NOT_CONFIGURED") {
          return reply.code(503).send({ message: "Deepgram is not configured" });
        }
        request.log.error(error);
        return reply.code(502).send({ message: "STT failed" });
      }
    });
  };
