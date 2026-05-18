import { test, expect } from "@playwright/test";
import { apiRegister, apiCreateTemplate, uniqueEmail } from "./helpers";
import { login } from "./helpers";

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
});
