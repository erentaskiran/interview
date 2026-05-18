import { describe, expect, it } from "vitest";
import { z } from "zod";

describe("env config validation", () => {
  it("validates correct environment", () => {
    const schema = z.object({
      NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
      PORT: z.coerce.number().int().positive().default(4001),
      BODY_LIMIT_MB: z.coerce.number().int().min(1).max(200).default(50),
      DEEPGRAM_API_KEY: z.string().optional(),
      DEEPGRAM_TTS_MODEL: z.string().default("aura-2-thalia-en"),
      DEEPGRAM_STT_MODEL: z.string().default("nova-3")
    });

    const result = schema.safeParse({
      NODE_ENV: "test",
      PORT: "4001",
      BODY_LIMIT_MB: "50",
      DEEPGRAM_API_KEY: "test-key",
      DEEPGRAM_TTS_MODEL: "aura-2-thalia-en",
      DEEPGRAM_STT_MODEL: "nova-3"
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.PORT).toBe(4001);
      expect(result.data.BODY_LIMIT_MB).toBe(50);
      expect(result.data.DEEPGRAM_API_KEY).toBe("test-key");
    }
  });

  it("rejects invalid NODE_ENV", () => {
    const schema = z.object({
      NODE_ENV: z.enum(["development", "test", "production"]).default("development")
    });

    const result = schema.safeParse({ NODE_ENV: "invalid" });
    expect(result.success).toBe(false);
  });

  it("applies defaults when optional fields omitted", () => {
    const schema = z.object({
      NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
      PORT: z.coerce.number().int().positive().default(4001),
      DEEPGRAM_TTS_MODEL: z.string().default("aura-2-thalia-en"),
      DEEPGRAM_STT_MODEL: z.string().default("nova-3")
    });

    const result = schema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.NODE_ENV).toBe("development");
      expect(result.data.PORT).toBe(4001);
      expect(result.data.DEEPGRAM_TTS_MODEL).toBe("aura-2-thalia-en");
      expect(result.data.DEEPGRAM_STT_MODEL).toBe("nova-3");
    }
  });

  it("allows optional DEEPGRAM_API_KEY", () => {
    const schema = z.object({
      DEEPGRAM_API_KEY: z.string().optional()
    });

    const result = schema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.DEEPGRAM_API_KEY).toBeUndefined();
    }
  });
});
