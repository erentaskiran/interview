import { afterEach, describe, expect, it, vi } from "vitest";

const loadApp = async () => {
  vi.resetModules();
  vi.stubEnv("NODE_ENV", "test");
  vi.stubEnv("DATABASE_URL", "postgresql://test:test@localhost:5432/test");
  vi.stubEnv("JWT_SECRET", "test-secret-with-enough-length");
  vi.stubEnv("OPENCODE_API_URL", "http://localhost:9999/v1/chat/completions");
  vi.stubEnv("OPENCODE_API_KEY", "test-key");
  vi.stubEnv("SPEECH_SERVICE_URL", "http://localhost:4001");
  vi.doMock("./plugins/prisma.js", async () => {
    const fp = (await import("fastify-plugin")).default;

    return {
      prismaPlugin: fp(async (fastify) => {
        fastify.decorate("prisma", {});
      })
    };
  });

  const { buildApp } = await import("./app.js");
  return buildApp();
};

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("buildApp", () => {
  it("allows DELETE preflight requests for unlike actions", async () => {
    const app = await loadApp();

    try {
      const response = await app.inject({
        method: "OPTIONS",
        url: "/templates/template-1/like",
        headers: {
          origin: "http://localhost:5173",
          "access-control-request-method": "DELETE",
          "access-control-request-headers": "authorization"
        }
      });

      expect(response.statusCode).toBe(204);
      expect(response.headers["access-control-allow-methods"]).toContain("DELETE");
      expect(String(response.headers["access-control-allow-headers"]).toLowerCase()).toContain(
        "authorization"
      );
    } finally {
      await app.close();
    }
  });
});
