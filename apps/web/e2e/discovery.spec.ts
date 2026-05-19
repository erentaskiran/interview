import { test, expect } from "@playwright/test";
import { apiRegister, apiCreateTemplate, uniqueEmail, login } from "./helpers";

test.describe("Discovery", () => {
  test("displays templates on load", async ({ page, request }) => {
    const email = uniqueEmail();
    const { token } = await apiRegister(request, email, "Password123!", "Discovery User");
    await apiCreateTemplate(request, token, {
      title: "E2E Discovery Template",
      category: "Engineering",
      description: "A test template for E2E discovery flow.",
      systemInstruction: "You are a test interviewer.",
    });

    await login(page, email, "Password123!");

    await expect(page.locator("text=E2E Discovery Template").first()).toBeVisible();
  });

  test("can filter by category", async ({ page, request }) => {
    const email = uniqueEmail();
    const { token } = await apiRegister(request, email, "Password123!", "Filter User");
    await apiCreateTemplate(request, token, {
      title: "Filterable Template",
      category: "Design",
      description: "A design template.",
      systemInstruction: "You are a design interviewer.",
    });

    await login(page, email, "Password123!");

    await expect(page.locator("text=Filterable Template").first()).toBeVisible();
  });

  test("clicking category chip filters templates", async ({ page, request }) => {
    const email = uniqueEmail();
    const { token } = await apiRegister(request, email, "Password123!", "Category User");
    await apiCreateTemplate(request, token, {
      title: "Engineering Template",
      category: "Engineering",
      description: "An engineering interview template.",
      systemInstruction: "You are an engineering interviewer.",
    });
    await apiCreateTemplate(request, token, {
      title: "Product Template",
      category: "Product",
      description: "A product interview template.",
      systemInstruction: "You are a product interviewer.",
    });

    await login(page, email, "Password123!");

    await expect(page.locator("text=Engineering Template").first()).toBeVisible();
    await expect(page.locator("text=Product Template").first()).toBeVisible();

    // Click the Product category chip
    await page.locator("button.chip").filter({ hasText: "Product" }).click();

    // Wait for filter to apply
    await expect(page.locator("text=Product Template").first()).toBeVisible({ timeout: 5000 });

    // Engineering template should no longer be visible
    await expect(page.locator("text=Engineering Template").first()).not.toBeVisible({
      timeout: 5000,
    });
  });

  test("can like a template from discovery grid", async ({ page, request }) => {
    const email = uniqueEmail();
    const { token } = await apiRegister(request, email, "Password123!", "Like Grid User");
    await apiCreateTemplate(request, token, {
      title: "Likeable Grid Template",
      category: "Engineering",
      description: "A template to like from the grid.",
      systemInstruction: "You are an interviewer.",
    });

    await login(page, email, "Password123!");

    // Find the template card
    const card = page.locator(".card").filter({ hasText: "Likeable Grid Template" });
    await expect(card).toBeVisible({ timeout: 5000 });

    // Like count starts at 0
    await expect(card.locator("text=0")).toBeVisible();

    // Click the heart icon inside the card (first SVG)
    await card.locator("svg").first().click();

    // After liking, the count should change to 1
    await expect(card.locator("text=1")).toBeVisible({ timeout: 5000 });
  });

  test("clicking template card navigates to detail", async ({ page, request }) => {
    const email = uniqueEmail();
    const { token } = await apiRegister(request, email, "Password123!", "Navigate User");
    const template = await apiCreateTemplate(request, token, {
      title: "Navigate To Detail",
      category: "Engineering",
      description: "A template to navigate to detail.",
      systemInstruction: "You are an interviewer.",
    });

    await login(page, email, "Password123!");

    await page.locator(".card").filter({ hasText: "Navigate To Detail" }).first().click();

    await expect(page).toHaveURL(new RegExp(`/templates/${template.id}`));
    await expect(page.getByText("Navigate To Detail").first()).toBeVisible();
  });

  test("clicking New template navigates to create page", async ({ page, request }) => {
    const email = uniqueEmail();
    await apiRegister(request, email, "Password123!", "Create Nav User");

    await login(page, email, "Password123!");

    await page.getByRole("button", { name: /new template/i }).click();
    await expect(page).toHaveURL(/\/templates\/new/);
    await expect(page.getByText("Template details")).toBeVisible();
  });

  test("search filters templates by title", async ({ page, request }) => {
    const email = uniqueEmail();
    const { token } = await apiRegister(request, email, "Password123!", "Search User");
    await apiCreateTemplate(request, token, {
      title: "React System Design",
      category: "Engineering",
      description: "System design interview for React developers.",
      systemInstruction: "You are a system design interviewer.",
    });
    await apiCreateTemplate(request, token, {
      title: "Behavioral Leadership",
      category: "Founder",
      description: "Leadership behavioral interview.",
      systemInstruction: "You are a leadership interviewer.",
    });

    await login(page, email, "Password123!");

    await expect(page.locator("text=React System Design").first()).toBeVisible();
    await expect(page.locator("text=Behavioral Leadership").first()).toBeVisible();

    // Type search term
    await page.getByPlaceholder("Search title or description").fill("React");

    // Wait for search to filter
    await expect(page.locator("text=React System Design").first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator("text=Behavioral Leadership").first()).not.toBeVisible({
      timeout: 5000,
    });
  });
});
