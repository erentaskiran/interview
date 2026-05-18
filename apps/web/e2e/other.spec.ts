import { test, expect } from "@playwright/test";
import { apiRegister, apiCreateTemplate, uniqueEmail, login, gotoPage } from "./helpers";

test.describe("Liked Templates", () => {
  test.fixme("displays liked templates", async ({ page, request }) => {
    const email = uniqueEmail();
    const { token } = await apiRegister(request, email, "Password123!", "Liked User");
    const template = await apiCreateTemplate(request, token, {
      title: "Liked Template",
      category: "Engineering",
      description: "A template to like.",
      systemInstruction: "You are an interviewer.",
    });

    await request.post(`http://localhost:4000/templates/${template.id}/like`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    await login(page, email, "Password123!");
    await gotoPage(page, "/liked");

    await expect(page.locator("text=Liked Template").first()).toBeVisible();
  });
});

test.describe("Sessions History", () => {
  test.fixme("displays sessions page", async ({ page, request }) => {
    const email = uniqueEmail();
    await apiRegister(request, email, "Password123!", "History User");

    await login(page, email, "Password123!");
    await gotoPage(page, "/sessions");

    await expect(page.getByRole("heading", { name: /sessions/i })).toBeVisible();
  });
});

test.describe("Settings", () => {
  test.fixme("displays settings page", async ({ page, request }) => {
    const email = uniqueEmail();
    await apiRegister(request, email, "Password123!", "Settings User");

    await login(page, email, "Password123!");
    await gotoPage(page, "/settings");

    await expect(page.getByRole("heading", { name: /settings/i })).toBeVisible();
  });
});
