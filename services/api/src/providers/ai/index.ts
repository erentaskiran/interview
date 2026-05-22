import type { AppEnv } from "../../config/env.js";
import { OpenCodeAiProvider } from "./opencode-ai-provider.js";
import type { AiInterviewProvider } from "./types.js";

export const createAiProvider = (env: AppEnv): AiInterviewProvider => {
  if (env.AI_PROVIDER === "opencode") {
    if (!env.OPENCODE_API_URL || !env.OPENCODE_API_KEY) {
      throw new Error("AI_PROVIDER=opencode requires OPENCODE_API_URL and OPENCODE_API_KEY");
    }
    const opencode = new OpenCodeAiProvider({
      apiUrl: env.OPENCODE_API_URL,
      apiKey: env.OPENCODE_API_KEY,
      ...(env.OPENCODE_MODEL ? { model: env.OPENCODE_MODEL } : {}),
    });
    const fallback = new MockAiProvider();

    return {
      async startInterview(input) {
        try {
          return await opencode.startInterview(input);
        } catch {
          return fallback.startInterview(input);
        }
      },
      async continueInterview(input) {
        try {
          return await opencode.continueInterview(input);
        } catch {
          return fallback.continueInterview(input);
        }
      },
      async finalizeInterview(input) {
        try {
          return await opencode.finalizeInterview(input);
        } catch {
          return fallback.finalizeInterview(input);
        }
      },
      async generateTemplate(prompt) {
        try {
          return await opencode.generateTemplate(prompt);
        } catch {
          return fallback.generateTemplate(prompt);
        }
      },
    };
  }

  return new OpenCodeAiProvider({
    apiUrl: env.OPENCODE_API_URL,
    apiKey: env.OPENCODE_API_KEY,
    ...(env.OPENCODE_MODEL ? { model: env.OPENCODE_MODEL } : {})
  });
};

export type * from "./types.js";
