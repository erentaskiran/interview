import { describe, expect, it } from "vitest";
import type { AppEnv } from "../../config/env.js";
import { OpenCodeAiProvider } from "./opencode-ai-provider.js";
import { createAiProvider } from "./index.js";

const baseEnv: AppEnv = {
  NODE_ENV: "test",
  PORT: 4000,
  BODY_LIMIT_MB: 50,
  DATABASE_URL: "postgresql://test:test@localhost:5432/test",
  JWT_SECRET: "test-secret-with-enough-length",
  OPENCODE_API_URL: "http://localhost:9999/v1/chat/completions",
  OPENCODE_API_KEY: "test-key",
  SPEECH_SERVICE_URL: "http://localhost:4001"
};

describe("createAiProvider", () => {
  it("creates the OpenCode provider when runtime config is complete", () => {
    expect(createAiProvider(baseEnv)).toBeInstanceOf(OpenCodeAiProvider);
  });

  it("fails fast when OpenCode URL is missing", () => {
    expect(() =>
      createAiProvider({
        ...baseEnv,
        OPENCODE_API_URL: ""
      })
    ).toThrow("Runtime AI requires OPENCODE_API_URL and OPENCODE_API_KEY");
  });

  it("fails fast when OpenCode API key is missing", () => {
    expect(() =>
      createAiProvider({
        ...baseEnv,
        OPENCODE_API_KEY: ""
      })
    ).toThrow("Runtime AI requires OPENCODE_API_URL and OPENCODE_API_KEY");
  });
});
