import { describe, expect, it, beforeAll, afterAll, beforeEach } from "vitest";
import { buildTestApp, cleanDatabase, createTestUser, prisma } from "../test/helpers.js";

describe("auth routes", () => {
  let app: Awaited<ReturnType<typeof buildTestApp>>;

  beforeAll(async () => {
    app = await buildTestApp();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  describe("POST /auth/register", () => {
    it("registers a new user and returns token", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: {
          email: "test@example.com",
          displayName: "Test User",
          password: "password123",
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.token).toBeTruthy();
      expect(body.user.email).toBe("test@example.com");
      expect(body.user.displayName).toBe("Test User");
      expect(body.user.id).toBeTruthy();
    });

    it("returns 400 for invalid email", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: {
          email: "not-an-email",
          displayName: "Test",
          password: "password123",
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.message).toContain("Invalid payload");
    });

    it("returns 400 for short password", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: {
          email: "test@example.com",
          displayName: "Test",
          password: "short",
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it("returns 400 for short displayName", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: {
          email: "test@example.com",
          displayName: "T",
          password: "password123",
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it("returns 409 for duplicate email", async () => {
      await createTestUser(app, {
        email: "dup@example.com",
        displayName: "User One",
        password: "password123",
      });

      const response = await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: {
          email: "dup@example.com",
          displayName: "User Two",
          password: "password123",
        },
      });

      expect(response.statusCode).toBe(409);
      const body = JSON.parse(response.body);
      expect(body.message).toBe("Email already registered");
    });
  });

  describe("POST /auth/login", () => {
    it("logs in with valid credentials", async () => {
      const { user } = await createTestUser(app, {
        email: "login@example.com",
        displayName: "Login User",
        password: "password123",
      });

      const response = await app.inject({
        method: "POST",
        url: "/auth/login",
        payload: {
          email: "login@example.com",
          password: "password123",
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.token).toBeTruthy();
      expect(body.user.id).toBe(user.id);
    });

    it("returns 401 for non-existent user", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/auth/login",
        payload: {
          email: "noone@example.com",
          password: "password123",
        },
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body.message).toBe("Invalid credentials");
    });

    it("returns 401 for wrong password", async () => {
      await createTestUser(app, {
        email: "wrong@example.com",
        displayName: "Wrong User",
        password: "password123",
      });

      const response = await app.inject({
        method: "POST",
        url: "/auth/login",
        payload: {
          email: "wrong@example.com",
          password: "wrongpassword",
        },
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body.message).toBe("Invalid credentials");
    });

    it("returns 400 for invalid payload", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/auth/login",
        payload: {
          email: "not-an-email",
          password: "short",
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("GET /auth/me", () => {
    it("returns current user with valid token", async () => {
      const { token, user } = await createTestUser(app, {
        email: "me@example.com",
        displayName: "Me User",
        password: "password123",
      });

      const response = await app.inject({
        method: "GET",
        url: "/auth/me",
        headers: { authorization: `Bearer ${token}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.user.id).toBe(user.id);
      expect(body.user.email).toBe("me@example.com");
      expect(body.user.displayName).toBe("Me User");
      expect(body.user.createdAt).toBeTruthy();
    });

    it("returns 401 without token", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/auth/me",
      });

      expect(response.statusCode).toBe(401);
    });

    it("returns 401 with invalid token", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/auth/me",
        headers: { authorization: "Bearer invalid-token" },
      });

      expect(response.statusCode).toBe(401);
    });

    it("returns 404 for deleted user", async () => {
      const { token, user } = await createTestUser(app, {
        email: "deleted@example.com",
        displayName: "Deleted User",
        password: "password123",
      });

      await prisma.user.delete({ where: { id: user.id } });

      const response = await app.inject({
        method: "GET",
        url: "/auth/me",
        headers: { authorization: `Bearer ${token}` },
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.message).toBe("User not found");
    });
  });
});
