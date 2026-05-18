import { describe, expect, it } from "vitest";
import { getAuthUserId, getAuthUser } from "./auth.js";
import type { FastifyRequest } from "fastify";

describe("auth utils", () => {
  describe("getAuthUser", () => {
    it("returns user from request", () => {
      const request = {
        user: { sub: "user-123", email: "test@example.com" },
      } as unknown as FastifyRequest;

      const user = getAuthUser(request);
      expect(user.sub).toBe("user-123");
      expect(user.email).toBe("test@example.com");
    });
  });

  describe("getAuthUserId", () => {
    it("returns sub from request user", () => {
      const request = {
        user: { sub: "user-456" },
      } as unknown as FastifyRequest;

      const userId = getAuthUserId(request);
      expect(userId).toBe("user-456");
    });
  });
});
