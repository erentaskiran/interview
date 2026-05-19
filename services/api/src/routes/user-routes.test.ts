import { describe, expect, it, beforeAll, afterAll, beforeEach } from "vitest";
import { buildTestApp, cleanDatabase, createTestUser, prisma } from "../test/helpers.js";

describe("user routes", () => {
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

  describe("GET /users/:id/profile", () => {
    it("returns user profile without auth", async () => {
      const { user } = await createTestUser(app, {
        email: "profile@example.com",
        displayName: "Profile User",
        password: "password123",
      });

      const response = await app.inject({
        method: "GET",
        url: `/users/${user.id}/profile`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.user.id).toBe(user.id);
      expect(body.user.displayName).toBe("Profile User");
      expect(body.templates).toBeInstanceOf(Array);
      expect(body.likedTemplates).toBeInstanceOf(Array);
      expect(body.viewer).toBeUndefined();
    });

    it("returns profile with viewer info when authenticated", async () => {
      const { user: targetUser } = await createTestUser(app, {
        email: "target@example.com",
        displayName: "Target User",
        password: "password123",
      });

      const { token: viewerToken } = await createTestUser(app, {
        email: "viewer@example.com",
        displayName: "Viewer User",
        password: "password123",
      });

      const response = await app.inject({
        method: "GET",
        url: `/users/${targetUser.id}/profile`,
        headers: { authorization: `Bearer ${viewerToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.viewer.isSelf).toBe(false);
      expect(body.viewer.isFollowing).toBe(false);
    });

    it("returns isSelf=true for own profile", async () => {
      const { token, user } = await createTestUser(app, {
        email: "self@example.com",
        displayName: "Self User",
        password: "password123",
      });

      const response = await app.inject({
        method: "GET",
        url: `/users/${user.id}/profile`,
        headers: { authorization: `Bearer ${token}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.viewer.isSelf).toBe(true);
      expect(body.viewer.isFollowing).toBe(false);
    });

    it("returns 404 for non-existent user", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/users/non-existent-id/profile",
      });

      expect(response.statusCode).toBe(404);
    });

    it("returns 400 for invalid user id", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/users//profile",
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("POST /users/:id/follow", () => {
    it("follows a user", async () => {
      const { user: targetUser } = await createTestUser(app, {
        email: "target2@example.com",
        displayName: "Target User",
        password: "password123",
      });

      const { token: followerToken } = await createTestUser(app, {
        email: "follower@example.com",
        displayName: "Follower User",
        password: "password123",
      });

      const response = await app.inject({
        method: "POST",
        url: `/users/${targetUser.id}/follow`,
        headers: { authorization: `Bearer ${followerToken}` },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
    });

    it("returns success for duplicate follow", async () => {
      const { user: targetUser } = await createTestUser(app, {
        email: "target3@example.com",
        displayName: "Target User",
        password: "password123",
      });

      const { token: followerToken } = await createTestUser(app, {
        email: "follower2@example.com",
        displayName: "Follower User",
        password: "password123",
      });

      await app.inject({
        method: "POST",
        url: `/users/${targetUser.id}/follow`,
        headers: { authorization: `Bearer ${followerToken}` },
      });

      const response = await app.inject({
        method: "POST",
        url: `/users/${targetUser.id}/follow`,
        headers: { authorization: `Bearer ${followerToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
    });

    it("returns 400 for self-follow", async () => {
      const { token, user } = await createTestUser(app, {
        email: "self2@example.com",
        displayName: "Self User",
        password: "password123",
      });

      const response = await app.inject({
        method: "POST",
        url: `/users/${user.id}/follow`,
        headers: { authorization: `Bearer ${token}` },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.message).toBe("Cannot follow yourself");
    });

    it("returns 404 for non-existent user", async () => {
      const { token } = await createTestUser(app, {
        email: "follower3@example.com",
        displayName: "Follower User",
        password: "password123",
      });

      const response = await app.inject({
        method: "POST",
        url: "/users/non-existent-id/follow",
        headers: { authorization: `Bearer ${token}` },
      });

      expect(response.statusCode).toBe(404);
    });

    it("returns 401 without token", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/users/some-id/follow",
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("DELETE /users/:id/follow", () => {
    it("unfollows a user", async () => {
      const { user: targetUser } = await createTestUser(app, {
        email: "target4@example.com",
        displayName: "Target User",
        password: "password123",
      });

      const { token: followerToken } = await createTestUser(app, {
        email: "follower4@example.com",
        displayName: "Follower User",
        password: "password123",
      });

      await app.inject({
        method: "POST",
        url: `/users/${targetUser.id}/follow`,
        headers: { authorization: `Bearer ${followerToken}` },
      });

      const response = await app.inject({
        method: "DELETE",
        url: `/users/${targetUser.id}/follow`,
        headers: { authorization: `Bearer ${followerToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
    });

    it("returns success even if not following", async () => {
      const { user: targetUser } = await createTestUser(app, {
        email: "target5@example.com",
        displayName: "Target User",
        password: "password123",
      });

      const { token: followerToken } = await createTestUser(app, {
        email: "follower5@example.com",
        displayName: "Follower User",
        password: "password123",
      });

      const response = await app.inject({
        method: "DELETE",
        url: `/users/${targetUser.id}/follow`,
        headers: { authorization: `Bearer ${followerToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
    });

    it("returns 401 without token", async () => {
      const response = await app.inject({
        method: "DELETE",
        url: "/users/some-id/follow",
      });

      expect(response.statusCode).toBe(401);
    });
  });
});
