import { env } from "./config/env.js";
import { buildSpeechApp } from "./app.js";

const app = buildSpeechApp();

const start = async () => {
  try {
    await app.listen({ host: "0.0.0.0", port: env.PORT });
    app.log.info(`Speech service running on port ${env.PORT}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

void start();
