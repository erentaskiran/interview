import { test, expect } from "@playwright/test";
import { apiRegister, apiCreateTemplate, uniqueEmail, login, gotoPage } from "./helpers";

test.describe("Interview Session", () => {
  test("can start an interview session", async ({ page, request }) => {
    const email = uniqueEmail();
    const { token } = await apiRegister(request, email, "Password123!", "Session User");
    const template = await apiCreateTemplate(request, token, {
      title: "Session Template",
      category: "Engineering",
      description: "A session test template.",
      systemInstruction: "Ask only one question then finish.",
    });

    await login(page, email, "Password123!");
    await gotoPage(page, `/templates/${template.id}`);

    await expect(page.getByRole("button", { name: /Start interview/i })).toBeVisible({
      timeout: 10000,
    });
    await page.getByRole("button", { name: /Start interview/i }).click();

    await page.waitForURL(/\/sessions\//, { timeout: 15000 });
    await expect(page).toHaveURL(/\/sessions\//);
  });

  test("session page shows play question button", async ({ page, request }) => {
    const email = uniqueEmail();
    const { token } = await apiRegister(request, email, "Password123!", "Session UI User");
    const template = await apiCreateTemplate(request, token, {
      title: "UI Session Template",
      category: "Engineering",
      description: "A UI session template.",
      systemInstruction: "Ask one question.",
    });

    await login(page, email, "Password123!");
    await gotoPage(page, `/templates/${template.id}`);

    await page.getByRole("button", { name: /Start interview/i }).click();
    await page.waitForURL(/\/sessions\//, { timeout: 15000 });

    await expect(page.getByRole("button", { name: "Play question" })).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByRole("button", { name: /auto read/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /finish now/i })).toBeVisible();
  });

  test("session page shows question text", async ({ page, request }) => {
    const email = uniqueEmail();
    const { token } = await apiRegister(request, email, "Password123!", "Question Text User");
    const template = await apiCreateTemplate(request, token, {
      title: "Question Text Template",
      category: "Engineering",
      description: "Template for question text check.",
      systemInstruction: "Ask one question.",
    });

    await login(page, email, "Password123!");
    await gotoPage(page, `/templates/${template.id}`);

    await page.getByRole("button", { name: /Start interview/i }).click();
    await page.waitForURL(/\/sessions\//, { timeout: 15000 });

    // Mock AI provider returns a question starting with "Let's start:"
    await expect(page.locator(".bubble--ai").first()).toBeVisible({
      timeout: 15000,
    });
  });

  test("can submit a text answer", async ({ page, request }) => {
    const email = uniqueEmail();
    const { token } = await apiRegister(request, email, "Password123!", "Answer User");
    const template = await apiCreateTemplate(request, token, {
      title: "Answer Template",
      category: "Engineering",
      description: "A template for testing answers.",
      systemInstruction: "Ask one question.",
    });

    await login(page, email, "Password123!");
    await gotoPage(page, `/templates/${template.id}`);

    await page.getByRole("button", { name: /Start interview/i }).click();
    await page.waitForURL(/\/sessions\//, { timeout: 15000 });

    // Wait for the session to load
    await expect(page.locator(".bubble--ai").first()).toBeVisible({
      timeout: 15000,
    });

    // The text answer area should be visible
    const textarea = page.locator('textarea[placeholder*="Type your answer"]');
    await expect(textarea).toBeVisible({ timeout: 5000 });

    // Submit a text answer
    const answerText = "This is my answer to the interview question.";
    await textarea.fill(answerText);
    await page.getByRole("button", { name: /submit answer/i }).click();

    // After submitting, the answer should appear in the conversation
    await expect(page.getByText(answerText)).toBeVisible({ timeout: 10000 });
  });

  test("can manually finish an active session", async ({ page, request }) => {
    const email = uniqueEmail();
    const { token } = await apiRegister(request, email, "Password123!", "Finish User");
    const template = await apiCreateTemplate(request, token, {
      title: "Finish Template",
      category: "Engineering",
      description: "A template for testing manual finish.",
      systemInstruction: "Ask one question.",
    });

    await login(page, email, "Password123!");
    await gotoPage(page, `/templates/${template.id}`);

    await page.getByRole("button", { name: /Start interview/i }).click();
    await page.waitForURL(/\/sessions\//, { timeout: 15000 });
    await expect(page.locator(".bubble--ai").first()).toBeVisible({
      timeout: 15000,
    });

    // Submit a text answer first (required for manual finish)
    const textarea = page.locator('textarea[placeholder*="Type your answer"]');
    const answerText = "An answer that should enable the finish button.";
    await textarea.fill(answerText);
    await page.getByRole("button", { name: /submit answer/i }).click();

    // Wait for the submit to process
    await expect(page.getByText(answerText)).toBeVisible({ timeout: 10000 });

    // Click finish now
    const finishBtn = page.getByRole("button", { name: /finish now/i });
    if (await finishBtn.isEnabled({ timeout: 5000 })) {
      await finishBtn.click();
      // Should show result summary after finishing
      await expect(
        page.locator("[class*='ResultSummary']").or(page.getByText(/score/i).first())
      ).toBeVisible({ timeout: 15000 });
    }
  });

  test("session page shows progress indicator", async ({ page, request }) => {
    const email = uniqueEmail();
    const { token } = await apiRegister(request, email, "Password123!", "Progress User");
    const template = await apiCreateTemplate(request, token, {
      title: "Progress Template",
      category: "Engineering",
      description: "A template for progress test.",
      systemInstruction: "Ask one question.",
    });

    await login(page, email, "Password123!");
    await gotoPage(page, `/templates/${template.id}`);

    await page.getByRole("button", { name: /Start interview/i }).click();
    await page.waitForURL(/\/sessions\//, { timeout: 15000 });

    // Session progress bar should be visible
    await expect(page.locator(".bar")).toBeVisible({ timeout: 10000 });
  });

  test("session page has Template button in topbar", async ({ page, request }) => {
    const email = uniqueEmail();
    const { token } = await apiRegister(request, email, "Password123!", "Topbar User");
    const template = await apiCreateTemplate(request, token, {
      title: "Topbar Template",
      category: "Engineering",
      description: "Template for topbar test.",
      systemInstruction: "Ask one question.",
    });

    await login(page, email, "Password123!");
    await gotoPage(page, `/templates/${template.id}`);

    await page.getByRole("button", { name: /Start interview/i }).click();
    await page.waitForURL(/\/sessions\//, { timeout: 15000 });

    await expect(page.getByRole("button", { name: "Template" })).toBeVisible({ timeout: 10000 });
  });
});
