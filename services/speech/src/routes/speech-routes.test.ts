import { describe, expect, it, beforeAll, afterAll, vi } from "vitest";
import { buildTestSpeechApp } from "../test/helpers.js";
import { DeepgramClient } from "../clients/deepgram-client.js";

describe("speech routes", () => {
  let app: Awaited<ReturnType<typeof buildTestSpeechApp>>;

  beforeAll(async () => {
    app = await buildTestSpeechApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("GET /health", () => {
    it("returns ok", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/health",
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual({ ok: true });
    });
  });

  describe("POST /tts", () => {
    it("returns audio payload on success", async () => {
      const mockClient = new DeepgramClient({
        apiKey: "test-key",
        ttsModel: "aura-2-thalia-en",
        sttModel: "nova-3",
      });
      vi.spyOn(mockClient, "textToSpeech").mockResolvedValue({
        audioBase64: "mock-audio-data",
        mimeType: "audio/mpeg",
      });

      const mockApp = await buildTestSpeechApp(mockClient);

      const response = await mockApp.inject({
        method: "POST",
        url: "/tts",
        payload: { text: "Hello world" },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.audioBase64).toBe("mock-audio-data");
      expect(body.mimeType).toBe("audio/mpeg");

      await mockApp.close();
    });

    it("returns 400 for invalid payload", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/tts",
        payload: { text: "" },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.message).toBe("Invalid payload");
    });

    it("returns 400 for missing text", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/tts",
        payload: {},
      });

      expect(response.statusCode).toBe(400);
    });

    it("returns 400 for text too long", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/tts",
        payload: { text: "a".repeat(5001) },
      });

      expect(response.statusCode).toBe(400);
    });

    it("returns 503 when deepgram not configured", async () => {
      const unconfiguredApp = await buildTestSpeechApp(
        new DeepgramClient({
          ttsModel: "aura-2-thalia-en",
          sttModel: "nova-3",
        })
      );

      const response = await unconfiguredApp.inject({
        method: "POST",
        url: "/tts",
        payload: { text: "Hello" },
      });

      expect(response.statusCode).toBe(503);
      const body = JSON.parse(response.body);
      expect(body.message).toBe("Deepgram is not configured");

      await unconfiguredApp.close();
    });

    it("returns 502 on deepgram failure", async () => {
      const failingClient = new DeepgramClient({
        apiKey: "test-key",
        ttsModel: "aura-2-thalia-en",
        sttModel: "nova-3",
      });

      vi.spyOn(failingClient, "textToSpeech").mockRejectedValue(
        new Error("DEEPGRAM_TTS_FAILED_500")
      );

      const failingApp = await buildTestSpeechApp(failingClient);

      const response = await failingApp.inject({
        method: "POST",
        url: "/tts",
        payload: { text: "Hello" },
      });

      expect(response.statusCode).toBe(502);
      const body = JSON.parse(response.body);
      expect(body.message).toBe("TTS failed");

      await failingApp.close();
    });

    it("uses custom voice model when provided", async () => {
      const customClient = new DeepgramClient({
        apiKey: "test-key",
        ttsModel: "aura-2-thalia-en",
        sttModel: "nova-3",
      });

      const spy = vi
        .spyOn(customClient, "textToSpeech")
        .mockResolvedValue({ audioBase64: "abc", mimeType: "audio/mp3" });

      const customApp = await buildTestSpeechApp(customClient);

      await customApp.inject({
        method: "POST",
        url: "/tts",
        payload: { text: "Hello", voiceModel: "custom-voice" },
      });

      expect(spy).toHaveBeenCalledWith("Hello", "custom-voice");

      await customApp.close();
    });
  });

  describe("POST /stt", () => {
    it("returns transcript on success", async () => {
      const mockClient = new DeepgramClient({
        apiKey: "test-key",
        ttsModel: "aura-2-thalia-en",
        sttModel: "nova-3",
      });
      vi.spyOn(mockClient, "speechToText").mockResolvedValue("Hello world");

      const mockApp = await buildTestSpeechApp(mockClient);

      const response = await mockApp.inject({
        method: "POST",
        url: "/stt",
        payload: { audioBase64: "base64data", mimeType: "audio/wav" },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.transcript).toBe("Hello world");

      await mockApp.close();
    });

    it("returns 400 for invalid payload", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/stt",
        payload: { audioBase64: "" },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.message).toBe("Invalid payload");
    });

    it("returns 400 for missing audioBase64", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/stt",
        payload: { mimeType: "audio/wav" },
      });

      expect(response.statusCode).toBe(400);
    });

    it("returns 400 for missing mimeType", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/stt",
        payload: { audioBase64: "base64data" },
      });

      expect(response.statusCode).toBe(400);
    });

    it("returns 503 when deepgram not configured", async () => {
      const unconfiguredApp = await buildTestSpeechApp(
        new DeepgramClient({
          ttsModel: "aura-2-thalia-en",
          sttModel: "nova-3",
        })
      );

      const response = await unconfiguredApp.inject({
        method: "POST",
        url: "/stt",
        payload: { audioBase64: "base64data", mimeType: "audio/wav" },
      });

      expect(response.statusCode).toBe(503);
      const body = JSON.parse(response.body);
      expect(body.message).toBe("Deepgram is not configured");

      await unconfiguredApp.close();
    });

    it("returns 502 on deepgram failure", async () => {
      const failingClient = new DeepgramClient({
        apiKey: "test-key",
        ttsModel: "aura-2-thalia-en",
        sttModel: "nova-3",
      });

      vi.spyOn(failingClient, "speechToText").mockRejectedValue(
        new Error("DEEPGRAM_STT_FAILED_500")
      );

      const failingApp = await buildTestSpeechApp(failingClient);

      const response = await failingApp.inject({
        method: "POST",
        url: "/stt",
        payload: { audioBase64: "base64data", mimeType: "audio/wav" },
      });

      expect(response.statusCode).toBe(502);
      const body = JSON.parse(response.body);
      expect(body.message).toBe("STT failed");

      await failingApp.close();
    });
  });
});
