import { config as loadEnv } from "dotenv";
import { z } from "zod";

loadEnv();

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4001),
  BODY_LIMIT_MB: z.coerce.number().int().min(1).max(200).default(50),
  DEEPGRAM_API_KEY: z.string().optional(),
  DEEPGRAM_TTS_MODEL: z.string().default("aura-2-thalia-en"),
  DEEPGRAM_STT_MODEL: z.string().default("nova-3"),
});

export type SpeechEnv = z.infer<typeof EnvSchema>;

export const env: SpeechEnv = EnvSchema.parse(process.env);
