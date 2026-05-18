import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password-service.js";

describe("password-service", () => {
  describe("hashPassword", () => {
    it("returns a non-empty hashed string", async () => {
      const hash = await hashPassword("password123");
      expect(hash).toBeTruthy();
      expect(hash.length).toBeGreaterThan(20);
    });

    it("produces different hashes for the same password", async () => {
      const hash1 = await hashPassword("password123");
      const hash2 = await hashPassword("password123");
      expect(hash1).not.toBe(hash2);
    });
  });

  describe("verifyPassword", () => {
    it("returns true for matching password", async () => {
      const hash = await hashPassword("password123");
      const result = await verifyPassword("password123", hash);
      expect(result).toBe(true);
    });

    it("returns false for non-matching password", async () => {
      const hash = await hashPassword("password123");
      const result = await verifyPassword("wrongpassword", hash);
      expect(result).toBe(false);
    });
  });
});
