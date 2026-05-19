import { describe, expect, it } from "vitest";
import { z } from "zod";

describe("env config validation", () => {
  it("validates correct environment", () => {
    const schema = z.object({
      NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
      PORT: z.coerce.number().int().positive().default(4000),
      BODY_LIMIT_MB: z.coerce.number().int().min(1).max(200).default(50),
      DATABASE_URL: z.string().min(1),
      JWT_SECRET: z.string().min(16),
      AI_PROVIDER: z.enum(["mock", "opencode"]).default("mock"),
      SPEECH_SERVICE_URL: z.string().url().default("http://localhost:4001"),
    });

    const result = schema.safeParse({
      NODE_ENV: "test",
      PORT: "4000",
      BODY_LIMIT_MB: "50",
      DATABASE_URL: "postgresql://localhost/test",
      JWT_SECRET: "test-secret-key-12345",
      AI_PROVIDER: "mock",
      SPEECH_SERVICE_URL: "http://localhost:4001",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.PORT).toBe(4000);
      expect(result.data.BODY_LIMIT_MB).toBe(50);
      expect(result.data.AI_PROVIDER).toBe("mock");
    }
  });

  it("rejects invalid NODE_ENV", () => {
    const schema = z.object({
      NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    });

    const result = schema.safeParse({ NODE_ENV: "invalid" });
    expect(result.success).toBe(false);
  });

  it("rejects short JWT_SECRET", () => {
    const schema = z.object({
      JWT_SECRET: z.string().min(16),
    });

    const result = schema.safeParse({ JWT_SECRET: "short" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid URL", () => {
    const schema = z.object({
      SPEECH_SERVICE_URL: z.string().url(),
    });

    const result = schema.safeParse({ SPEECH_SERVICE_URL: "not-a-url" });
    expect(result.success).toBe(false);
  });

  it("applies defaults when optional fields omitted", () => {
    const schema = z.object({
      NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
      PORT: z.coerce.number().int().positive().default(4000),
      AI_PROVIDER: z.enum(["mock", "opencode"]).default("mock"),
    });

    const result = schema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.NODE_ENV).toBe("development");
      expect(result.data.PORT).toBe(4000);
      expect(result.data.AI_PROVIDER).toBe("mock");
    }
  });
});
