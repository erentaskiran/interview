import { config as loadEnv } from "dotenv";
import { z } from "zod";

loadEnv();

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  BODY_LIMIT_MB: z.coerce.number().int().min(1).max(200).default(50),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  OPENCODE_API_URL: z.string().url(),
  OPENCODE_API_KEY: z.string().min(1),
  OPENCODE_MODEL: z.string().optional(),
  SPEECH_SERVICE_URL: z.string().url().default("http://localhost:4001")
});

export type AppEnv = z.infer<typeof EnvSchema>;

export const env: AppEnv = EnvSchema.parse(process.env);
