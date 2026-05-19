import { describe, expect, it, vi } from "vitest";
import { SpeechServiceClient } from "./speech-service-client.js";

describe("SpeechServiceClient", () => {
  const client = new SpeechServiceClient({ baseUrl: "http://localhost:4001" });

  describe("textToSpeech", () => {
    it("returns audio payload on success", async () => {
      const mockResponse = { audioBase64: "abc123", mimeType: "audio/mp3" };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await client.textToSpeech("Hello", "voice-1");
      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:4001/tts",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: "Hello", voiceModel: "voice-1" }),
        })
      );
    });

    it("sends request without voiceModel when undefined", async () => {
      const mockResponse = { audioBase64: "abc123", mimeType: "audio/mp3" };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      await client.textToSpeech("Hello");
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:4001/tts",
        expect.objectContaining({
          body: JSON.stringify({ text: "Hello" }),
        })
      );
    });

    it("throws on non-ok response", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      } as Response);

      await expect(client.textToSpeech("Hello")).rejects.toThrow(
        "Speech TTS failed with status 500"
      );
    });
  });

  describe("speechToText", () => {
    it("returns transcript on success", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ transcript: "Hello world" }),
      } as Response);

      const result = await client.speechToText("base64audio", "audio/wav");
      expect(result).toBe("Hello world");
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:4001/stt",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ audioBase64: "base64audio", mimeType: "audio/wav" }),
        })
      );
    });

    it("throws on non-ok response", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
      } as Response);

      await expect(client.speechToText("base64audio", "audio/wav")).rejects.toThrow(
        "Speech STT failed with status 400"
      );
    });

    it("throws when transcript is empty", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ transcript: "" }),
      } as Response);

      await expect(client.speechToText("base64audio", "audio/wav")).rejects.toThrow(
        "Speech STT returned empty transcript"
      );
    });
  });
});
