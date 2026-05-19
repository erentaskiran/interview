import { describe, expect, it, beforeAll, afterAll, beforeEach } from "vitest";
import {
  buildTestApp,
  cleanDatabase,
  createTestUser,
  createTestTemplate,
  prisma,
} from "../test/helpers.js";

describe("template routes", () => {
  let app: Awaited<ReturnType<typeof buildTestApp>>;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    app = await buildTestApp();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await cleanDatabase();
    const result = await createTestUser(app, {
      email: "template@example.com",
      displayName: "Template User",
      password: "password123",
    });
    authToken = result.token;
    userId = result.user.id;
  });

  describe("POST /templates", () => {
    it("creates a template with valid data", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/templates",
        headers: { authorization: `Bearer ${authToken}` },
        payload: {
          title: "New Template",
          category: "System Design",
          description:
            "A detailed description for testing purposes that is definitely long enough.",
          systemInstruction: "You are an expert system design interviewer.",
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.id).toBeTruthy();
      expect(body.title).toBe("New Template");
      expect(body.authorId).toBe(userId);
      expect(body._count.likes).toBe(0);
    });

    it("uses default voice model when not provided", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/templates",
        headers: { authorization: `Bearer ${authToken}` },
        payload: {
          title: "Template",
          category: "Engineering",
          description:
            "A detailed description for testing purposes that is definitely long enough.",
          systemInstruction: "Ask questions.",
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.voiceModel).toBe("aura-2-thalia-en");
    });

    it("returns 400 for invalid payload", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/templates",
        headers: { authorization: `Bearer ${authToken}` },
        payload: {
          title: "AB",
          category: "E",
          description: "short",
          systemInstruction: "short",
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it("returns 401 without token", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/templates",
        payload: {
          title: "Template",
          category: "Engineering",
          description:
            "A detailed description for testing purposes that is definitely long enough.",
          systemInstruction: "Ask questions.",
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("GET /templates", () => {
    it("lists public templates", async () => {
      await createTestTemplate(app, authToken, { title: "Template A" });
      await createTestTemplate(app, authToken, { title: "Template B" });

      const response = await app.inject({
        method: "GET",
        url: "/templates",
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.templates.length).toBe(2);
      expect(body.templates[0].title).toBe("Template B");
      expect(body.templates[1].title).toBe("Template A");
    });

    it("filters by category", async () => {
      await createTestTemplate(app, authToken, {
        title: "Frontend Interview",
        category: "Frontend",
      });
      await createTestTemplate(app, authToken, { title: "Backend Interview", category: "Backend" });

      const response = await app.inject({
        method: "GET",
        url: "/templates?category=Frontend",
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.templates.length).toBe(1);
      expect(body.templates[0].category).toBe("Frontend");
    });

    it("filters by search query", async () => {
      await createTestTemplate(app, authToken, { title: "React Patterns", category: "Frontend" });
      await createTestTemplate(app, authToken, { title: "Node.js Basics", category: "Backend" });

      const response = await app.inject({
        method: "GET",
        url: "/templates?q=React",
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.templates.length).toBe(1);
      expect(body.templates[0].title).toBe("React Patterns");
    });
  });

  describe("GET /templates/:id", () => {
    it("returns a public template by id", async () => {
      const template = await createTestTemplate(app, authToken);

      const response = await app.inject({
        method: "GET",
        url: `/templates/${template.id}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.template.id).toBe(template.id);
    });

    it("returns 404 for non-existent template", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/templates/non-existent-id",
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe("POST /templates/:id/like", () => {
    it("likes a template", async () => {
      const template = await createTestTemplate(app, authToken);

      const response = await app.inject({
        method: "POST",
        url: `/templates/${template.id}/like`,
        headers: { authorization: `Bearer ${authToken}` },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
    });

    it("returns success for duplicate like", async () => {
      const template = await createTestTemplate(app, authToken);

      await app.inject({
        method: "POST",
        url: `/templates/${template.id}/like`,
        headers: { authorization: `Bearer ${authToken}` },
      });

      const response = await app.inject({
        method: "POST",
        url: `/templates/${template.id}/like`,
        headers: { authorization: `Bearer ${authToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
    });

    it("returns 404 for non-existent template", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/templates/non-existent-id/like",
        headers: { authorization: `Bearer ${authToken}` },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe("DELETE /templates/:id/like", () => {
    it("unlikes a template", async () => {
      const template = await createTestTemplate(app, authToken);

      await app.inject({
        method: "POST",
        url: `/templates/${template.id}/like`,
        headers: { authorization: `Bearer ${authToken}` },
      });

      const response = await app.inject({
        method: "DELETE",
        url: `/templates/${template.id}/like`,
        headers: { authorization: `Bearer ${authToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
    });

    it("returns success even if not liked", async () => {
      const template = await createTestTemplate(app, authToken);

      const response = await app.inject({
        method: "DELETE",
        url: `/templates/${template.id}/like`,
        headers: { authorization: `Bearer ${authToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
    });
  });

  describe("POST /templates/generate", () => {
    it("generates a template with AI", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/templates/generate",
        headers: { authorization: `Bearer ${authToken}` },
        payload: { prompt: "Create a system design interview template" },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.title).toBeTruthy();
      expect(body.category).toBeTruthy();
      expect(body.systemInstruction).toBeTruthy();
    });

    it("returns 400 for short prompt", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/templates/generate",
        headers: { authorization: `Bearer ${authToken}` },
        payload: { prompt: "hi" },
      });

      expect(response.statusCode).toBe(400);
    });
  });
});
