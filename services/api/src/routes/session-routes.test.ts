import { describe, expect, it, beforeAll, afterAll, beforeEach } from "vitest";
import {
  buildTestApp,
  cleanDatabase,
  createTestUser,
  createTestTemplate,
  prisma,
} from "../test/helpers.js";

describe("session routes", () => {
  let app: Awaited<ReturnType<typeof buildTestApp>>;
  let authToken: string;
  let userId: string;
  let templateId: string;

  beforeAll(async () => {
    app = await buildTestApp();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await cleanDatabase();
    const userResult = await createTestUser(app, {
      email: "session@example.com",
      displayName: "Session User",
      password: "password123",
    });
    authToken = userResult.token;
    userId = userResult.user.id;

    const templateResult = await createTestTemplate(app, authToken, {
      title: "Interview Template",
      category: "Engineering",
    });
    templateId = templateResult.id;
  });

  describe("POST /sessions", () => {
    it("starts a new interview session", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/sessions",
        headers: { authorization: `Bearer ${authToken}` },
        payload: { templateId },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.session.id).toBeTruthy();
      expect(body.session.userId).toBe(userId);
      expect(body.session.templateId).toBe(templateId);
      expect(body.session.status).toBe("active");
      expect(body.session.turns.length).toBe(1);
      expect(body.firstQuestionAudio).toBeDefined();
    });

    it("returns 404 for non-existent template", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/sessions",
        headers: { authorization: `Bearer ${authToken}` },
        payload: { templateId: "non-existent-id" },
      });

      expect(response.statusCode).toBe(404);
    });

    it("returns 400 for missing templateId", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/sessions",
        headers: { authorization: `Bearer ${authToken}` },
        payload: {},
      });

      expect(response.statusCode).toBe(400);
    });

    it("returns 401 without token", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/sessions",
        payload: { templateId },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("GET /sessions", () => {
    it("lists user sessions", async () => {
      await app.inject({
        method: "POST",
        url: "/sessions",
        headers: { authorization: `Bearer ${authToken}` },
        payload: { templateId },
      });

      const response = await app.inject({
        method: "GET",
        url: "/sessions",
        headers: { authorization: `Bearer ${authToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.sessions.length).toBe(1);
      expect(body.totalCount).toBe(1);
      expect(body.sessions[0].template).toBeDefined();
    });

    it("filters by status", async () => {
      await app.inject({
        method: "POST",
        url: "/sessions",
        headers: { authorization: `Bearer ${authToken}` },
        payload: { templateId },
      });

      const response = await app.inject({
        method: "GET",
        url: "/sessions?status=completed",
        headers: { authorization: `Bearer ${authToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.sessions.length).toBe(0);
    });

    it("returns 401 without token", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/sessions",
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("GET /sessions/:id", () => {
    it("returns session details", async () => {
      const createResponse = await app.inject({
        method: "POST",
        url: "/sessions",
        headers: { authorization: `Bearer ${authToken}` },
        payload: { templateId },
      });
      const { session } = JSON.parse(createResponse.body);

      const response = await app.inject({
        method: "GET",
        url: `/sessions/${session.id}`,
        headers: { authorization: `Bearer ${authToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.session.id).toBe(session.id);
      expect(body.session.turns).toBeInstanceOf(Array);
    });

    it("returns 404 for non-existent session", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/sessions/non-existent-id",
        headers: { authorization: `Bearer ${authToken}` },
      });

      expect(response.statusCode).toBe(404);
    });

    it("returns 401 without token", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/sessions/some-id",
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("POST /sessions/:id/answer", () => {
    it("submits an answer and gets next question", async () => {
      const createResponse = await app.inject({
        method: "POST",
        url: "/sessions",
        headers: { authorization: `Bearer ${authToken}` },
        payload: { templateId },
      });
      const { session } = JSON.parse(createResponse.body);

      const response = await app.inject({
        method: "POST",
        url: `/sessions/${session.id}/answer`,
        headers: { authorization: `Bearer ${authToken}` },
        payload: { answerTranscript: "This is my answer." },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.nextTurn).toBeDefined();
      expect(body.nextTurn.questionText).toBeTruthy();
      expect(body.transition).toBe("continued");
    });

    it("finishes session when planned question count is reached", async () => {
      const createResponse = await app.inject({
        method: "POST",
        url: "/sessions",
        headers: { authorization: `Bearer ${authToken}` },
        payload: { templateId },
      });
      let { session } = JSON.parse(createResponse.body);

      for (let i = 0; i < 6; i++) {
        const answerResponse = await app.inject({
          method: "POST",
          url: `/sessions/${session.id}/answer`,
          headers: { authorization: `Bearer ${authToken}` },
          payload: { answerTranscript: `Answer ${i + 1}` },
        });
        const body = JSON.parse(answerResponse.body);
        if (body.session) {
          session = body.session;
        }
      }

      expect(session.status).toBe("completed");
    });

    it("returns 409 for inactive session", async () => {
      const createResponse = await app.inject({
        method: "POST",
        url: "/sessions",
        headers: { authorization: `Bearer ${authToken}` },
        payload: { templateId },
      });
      let { session } = JSON.parse(createResponse.body);

      for (let i = 0; i < 12; i++) {
        const res = await app.inject({
          method: "POST",
          url: `/sessions/${session.id}/answer`,
          headers: { authorization: `Bearer ${authToken}` },
          payload: { answerTranscript: `Answer ${i + 1}` },
        });
        const body = JSON.parse(res.body);
        if (body.session) session = body.session;
      }

      const response = await app.inject({
        method: "POST",
        url: `/sessions/${session.id}/answer`,
        headers: { authorization: `Bearer ${authToken}` },
        payload: { answerTranscript: "Extra answer" },
      });

      expect(response.statusCode).toBe(409);
    });

    it("returns 400 for missing answer", async () => {
      const createResponse = await app.inject({
        method: "POST",
        url: "/sessions",
        headers: { authorization: `Bearer ${authToken}` },
        payload: { templateId },
      });
      const { session } = JSON.parse(createResponse.body);

      const response = await app.inject({
        method: "POST",
        url: `/sessions/${session.id}/answer`,
        headers: { authorization: `Bearer ${authToken}` },
        payload: {},
      });

      expect(response.statusCode).toBe(400);
    });

    it("returns 404 for non-existent session", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/sessions/non-existent-id/answer",
        headers: { authorization: `Bearer ${authToken}` },
        payload: { answerTranscript: "Answer" },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe("POST /sessions/:id/finish", () => {
    it("manually finishes an active session", async () => {
      const createResponse = await app.inject({
        method: "POST",
        url: "/sessions",
        headers: { authorization: `Bearer ${authToken}` },
        payload: { templateId },
      });
      const { session } = JSON.parse(createResponse.body);

      await app.inject({
        method: "POST",
        url: `/sessions/${session.id}/answer`,
        headers: { authorization: `Bearer ${authToken}` },
        payload: { answerTranscript: "My answer." },
      });

      const response = await app.inject({
        method: "POST",
        url: `/sessions/${session.id}/finish`,
        headers: { authorization: `Bearer ${authToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.session.status).toBe("completed");
      expect(body.session.completionReason).toBe("user_stopped");
      expect(body.session.score).toBeDefined();
    });

    it("returns 400 when no answers submitted", async () => {
      const createResponse = await app.inject({
        method: "POST",
        url: "/sessions",
        headers: { authorization: `Bearer ${authToken}` },
        payload: { templateId },
      });
      const { session } = JSON.parse(createResponse.body);

      const response = await app.inject({
        method: "POST",
        url: `/sessions/${session.id}/finish`,
        headers: { authorization: `Bearer ${authToken}` },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.message).toContain("At least one answered question");
    });

    it("returns 404 for non-existent session", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/sessions/non-existent-id/finish",
        headers: { authorization: `Bearer ${authToken}` },
      });

      expect(response.statusCode).toBe(404);
    });

    it("returns 401 without token", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/sessions/some-id/finish",
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("GET /sessions/:id/question-audio", () => {
    it("returns question audio", async () => {
      const createResponse = await app.inject({
        method: "POST",
        url: "/sessions",
        headers: { authorization: `Bearer ${authToken}` },
        payload: { templateId },
      });
      const { session } = JSON.parse(createResponse.body);

      const response = await app.inject({
        method: "GET",
        url: `/sessions/${session.id}/question-audio`,
        headers: { authorization: `Bearer ${authToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.audio).toBeDefined();
      expect(body.turnIndex).toBe(1);
    });

    it("returns 404 for non-existent session", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/sessions/non-existent-id/question-audio",
        headers: { authorization: `Bearer ${authToken}` },
      });

      expect(response.statusCode).toBe(404);
    });

    it("returns 401 without token", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/sessions/some-id/question-audio",
      });

      expect(response.statusCode).toBe(401);
    });
  });
});
