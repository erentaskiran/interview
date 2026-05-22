import { test, expect } from "@playwright/test";
import { apiRegister, apiCreateTemplate, uniqueEmail, login, gotoPage } from "./helpers";

test.describe("Template Detail", () => {
  test("displays template details", async ({ page, request }) => {
    const email = uniqueEmail();
    const { token } = await apiRegister(request, email, "Password123!", "Detail User");
    const template = await apiCreateTemplate(request, token, {
      title: "Detail Template",
      category: "Product",
      description: "A template to test detail page.",
      systemInstruction: "You are a product interviewer.",
    });

    await login(page, email, "Password123!");
    await gotoPage(page, `/templates/${template.id}`);

    await expect(page.getByRole("heading", { name: "Detail Template" })).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText("Product").first()).toBeVisible();
    await expect(page.getByText("A template to test detail page.")).toBeVisible();
    await expect(page.getByText("You are a product interviewer.")).toBeVisible();
  });

  test("can like and unlike a template", async ({ page, request }) => {
    const email = uniqueEmail();
    const { token } = await apiRegister(request, email, "Password123!", "Like User");
    const template = await apiCreateTemplate(request, token, {
      title: "Likeable Template",
      category: "Engineering",
      description: "A likeable template.",
      systemInstruction: "You are an interviewer.",
    });

    await login(page, email, "Password123!");
    await gotoPage(page, `/templates/${template.id}`);

    // Wait for template content to render
    await expect(page.getByRole("heading", { name: "Likeable Template" })).toBeVisible({
      timeout: 10000,
    });

    // Find and click the Like button
    await expect(page.getByRole("button", { name: /Like · 0/ })).toBeVisible({ timeout: 5000 });
    await page.getByRole("button", { name: /Like · 0/ }).click();

    // Should show Unlike after clicking
    await expect(page.getByRole("button", { name: /Unlike · 1/ })).toBeVisible({ timeout: 5000 });

    // Click Unlike to revert
    await page.getByRole("button", { name: /Unlike · 1/ }).click();

    // After unliking, should show Like · 0 again
    await expect(page.getByRole("button", { name: /Like · 0/ })).toBeVisible({ timeout: 5000 });
  });

  test("can navigate to start interview from template", async ({ page, request }) => {
    const email = uniqueEmail();
    const { token } = await apiRegister(request, email, "Password123!", "Start User");
    const template = await apiCreateTemplate(request, token, {
      title: "Interview Template",
      category: "Engineering",
      description: "An interview template.",
      systemInstruction: "You are an interviewer.",
    });

    await login(page, email, "Password123!");
    await gotoPage(page, `/templates/${template.id}`);

    await expect(page.getByRole("button", { name: /Start interview/i })).toBeVisible({
      timeout: 10000,
    });
    await page.getByRole("button", { name: /Start interview/i }).click();

    await page.waitForURL(/\/sessions\//, { timeout: 15000 });
  });

  test("shows author name in detail page", async ({ page, request }) => {
    const email = uniqueEmail();
    const { token } = await apiRegister(request, email, "Password123!", "Author User");
    const template = await apiCreateTemplate(request, token, {
      title: "Author Template",
      category: "Engineering",
      description: "Template by author.",
      systemInstruction: "You are an interviewer.",
    });

    await login(page, email, "Password123!");
    await gotoPage(page, `/templates/${template.id}`);

    await expect(page.getByRole("heading", { name: "Author Template" })).toBeVisible({
      timeout: 10000,
    });
    // Author name is displayed in the template detail - check it's present
    await expect(page.getByText("Author User").first()).toBeVisible();
  });

  test("back button returns to discover", async ({ page, request }) => {
    const email = uniqueEmail();
    const { token } = await apiRegister(request, email, "Password123!", "Back User");
    const template = await apiCreateTemplate(request, token, {
      title: "Back Test Template",
      category: "Engineering",
      description: "A template for back button test.",
      systemInstruction: "You are an interviewer.",
    });

    await login(page, email, "Password123!");
    await gotoPage(page, `/templates/${template.id}`);

    await page.getByRole("button", { name: /Back/i }).click();
    await expect(page).toHaveURL(/\/discover/);
  });

  test("shows like count updates after toggling", async ({ page, request }) => {
    const email = uniqueEmail();
    const { token } = await apiRegister(request, email, "Password123!", "Like Count User");
    const template = await apiCreateTemplate(request, token, {
      title: "Like Count Template",
      category: "Engineering",
      description: "A template for like count test.",
      systemInstruction: "You are an interviewer.",
    });

    await login(page, email, "Password123!");
    await gotoPage(page, `/templates/${template.id}`);

    await expect(page.getByRole("heading", { name: "Like Count Template" })).toBeVisible({
      timeout: 10000,
    });

    // Initial state shows 0 likes
    await expect(page.getByRole("button", { name: /Like · 0/ })).toBeVisible({ timeout: 5000 });

    // Like it - should become 1
    await page.getByRole("button", { name: /Like · 0/ }).click();
    await expect(page.getByRole("button", { name: /Unlike · 1/ })).toBeVisible({ timeout: 5000 });

    // Unlike it - should become 0 again
    await page.getByRole("button", { name: /Unlike · 1/ }).click();
    await expect(page.getByRole("button", { name: /Like · 0/ })).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Template Create", () => {
  test("can create a template and navigate to its detail page", async ({ page, request }) => {
    const email = uniqueEmail();
    await apiRegister(request, email, "Password123!", "Create User");

    await login(page, email, "Password123!");
    await page.getByRole("button", { name: /new template/i }).click();
    await expect(page).toHaveURL(/\/templates\/new/);

    // Fill template form
    await page.getByPlaceholder(/Behavioral round/).fill("E2E Created Template");
    await page.getByPlaceholder("Engineering").fill("Engineering");
    await page
      .locator('textarea[placeholder*="Explain the interview"]')
      .fill("This is an E2E test template with enough chars for validation.");
    await page
      .locator('textarea[placeholder*="You are a calm interviewer"]')
      .fill("You are a technical interviewer. Ask detailed questions.");

    await page.getByRole("button", { name: /create template/i }).click();

    // Should navigate to the created template detail page
    await page.waitForURL(/\/templates\//, { timeout: 10000 });
    await expect(page.getByText("E2E Created Template").first()).toBeVisible();
  });

  test("cancel button returns to discover", async ({ page, request }) => {
    const email = uniqueEmail();
    await apiRegister(request, email, "Password123!", "Cancel User");

    await login(page, email, "Password123!");
    await page.getByRole("button", { name: /new template/i }).click();
    await expect(page).toHaveURL(/\/templates\/new/);

    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page).toHaveURL(/\/discover/);
  });

  test("AI template generation shows preview", async ({ page, request }) => {
    const email = uniqueEmail();
    await apiRegister(request, email, "Password123!", "AI Create User");
    await login(page, email, "Password123!");
    await page.getByRole("button", { name: /new template/i }).click();
    await expect(page).toHaveURL(/\/templates\/new/);

    // Fill AI prompt
    await page
      .locator('textarea[placeholder*="I want a behavioral interview"]')
      .fill("I want a technical interview for senior backend engineers focusing on system design.");

    // Click generate
    await page.getByRole("button", { name: /generate with ai/i }).click();

    // Should see the AI generated preview section
    await expect(page.getByText("AI generated preview")).toBeVisible({
      timeout: 10000,
    });
  });
});
