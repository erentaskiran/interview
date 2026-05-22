import { describe, expect, it, vi } from "vitest";
import { DeepgramClient } from "./deepgram-client.js";

describe("DeepgramClient", () => {
  describe("textToSpeech", () => {
    it("returns audio payload on success", async () => {
      const client = new DeepgramClient({
        apiKey: "test-key",
        ttsModel: "aura-2-thalia-en",
        sttModel: "nova-3",
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Map([["content-type", "audio/mpeg"]]),
        arrayBuffer: () => Promise.resolve(Buffer.from("fake-audio").buffer),
      } as unknown as Response);

      const result = await client.textToSpeech("Hello world");

      expect(result.audioBase64).toBeTruthy();
      expect(result.mimeType).toBe("audio/mpeg");
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("https://api.deepgram.com/v1/speak"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Token test-key",
            "Content-Type": "application/json",
          }),
        })
      );
    });

    it("uses custom voice model when provided", async () => {
      const client = new DeepgramClient({
        apiKey: "test-key",
        ttsModel: "aura-2-thalia-en",
        sttModel: "nova-3",
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Map([["content-type", "audio/mpeg"]]),
        arrayBuffer: () => Promise.resolve(Buffer.from("fake-audio").buffer),
      } as unknown as Response);

      await client.textToSpeech("Hello", "custom-voice");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("model=custom-voice"),
        expect.anything()
      );
    });

    it("throws when not configured", async () => {
      const client = new DeepgramClient({
        ttsModel: "aura-2-thalia-en",
        sttModel: "nova-3",
      });

      await expect(client.textToSpeech("Hello")).rejects.toThrow("DEEPGRAM_NOT_CONFIGURED");
    });

    it("throws on non-ok response", async () => {
      const client = new DeepgramClient({
        apiKey: "test-key",
        ttsModel: "aura-2-thalia-en",
        sttModel: "nova-3",
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      } as Response);

      await expect(client.textToSpeech("Hello")).rejects.toThrow("DEEPGRAM_TTS_FAILED_500");
    });
  });

  describe("speechToText", () => {
    it("returns transcript on success", async () => {
      const client = new DeepgramClient({
        apiKey: "test-key",
        ttsModel: "aura-2-thalia-en",
        sttModel: "nova-3",
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            results: {
              channels: [
                {
                  alternatives: [{ transcript: "Hello world" }],
                },
              ],
            },
          }),
      } as Response);

      const result = await client.speechToText("base64audio", "audio/wav");

      expect(result).toBe("Hello world");
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("https://api.deepgram.com/v1/listen"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Token test-key",
            "Content-Type": "audio/wav",
          }),
        })
      );
    });

    it("throws when transcript is empty", async () => {
      const client = new DeepgramClient({
        apiKey: "test-key",
        ttsModel: "aura-2-thalia-en",
        sttModel: "nova-3",
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            results: {
              channels: [{ alternatives: [{ transcript: "" }] }],
            },
          }),
      } as Response);

      await expect(client.speechToText("base64audio", "audio/wav")).rejects.toThrow(
        "DEEPGRAM_EMPTY_TRANSCRIPT"
      );
    });

    it("throws when not configured", async () => {
      const client = new DeepgramClient({
        ttsModel: "aura-2-thalia-en",
        sttModel: "nova-3",
      });

      await expect(client.speechToText("base64audio", "audio/wav")).rejects.toThrow(
        "DEEPGRAM_NOT_CONFIGURED"
      );
    });

    it("throws on non-ok response", async () => {
      const client = new DeepgramClient({
        apiKey: "test-key",
        ttsModel: "aura-2-thalia-en",
        sttModel: "nova-3",
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
      } as Response);

      await expect(client.speechToText("base64audio", "audio/wav")).rejects.toThrow(
        "DEEPGRAM_STT_FAILED_400"
      );
    });
  });
});
