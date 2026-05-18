import { test, expect } from "@playwright/test";
import { apiRegister, apiCreateTemplate, uniqueEmail, login, gotoPage } from "./helpers";

test.describe("Template Detail", () => {
  test.fixme("displays template details", async ({ page, request }) => {
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

    await expect(page.locator("h1").filter({ hasText: "Detail Template" })).toBeVisible();
    await expect(page.getByText("Product").first()).toBeVisible();
  });

  test.fixme("can like and unlike a template", async ({ page, request }) => {
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

    const likeButton = page.getByText(/Like · \d+/);
    await likeButton.click();

    await expect(page.getByText(/Unlike · \d+/)).toBeVisible();

    const unlikeButton = page.getByText(/Unlike · \d+/);
    await unlikeButton.click();

    await expect(page.getByText(/Like · \d+/)).toBeVisible();
  });

  test.fixme("can navigate to start interview from template", async ({ page, request }) => {
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

    await expect(page.getByText("Start interview")).toBeVisible();
  });
});
