import type { AppEnv } from "../../config/env.js";
import { OpenCodeAiProvider } from "./opencode-ai-provider.js";
import type { AiInterviewProvider } from "./types.js";

export const createAiProvider = (env: AppEnv): AiInterviewProvider => {
  if (!env.OPENCODE_API_URL || !env.OPENCODE_API_KEY) {
    throw new Error("Runtime AI requires OPENCODE_API_URL and OPENCODE_API_KEY");
  }

  return new OpenCodeAiProvider({
    apiUrl: env.OPENCODE_API_URL,
    apiKey: env.OPENCODE_API_KEY,
    ...(env.OPENCODE_MODEL ? { model: env.OPENCODE_MODEL } : {})
  });
};

export type * from "./types.js";
