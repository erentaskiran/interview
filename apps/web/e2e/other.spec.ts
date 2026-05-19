import { test, expect } from "@playwright/test";
import { apiRegister, apiCreateTemplate, uniqueEmail, login, gotoPage } from "./helpers";

test.describe("Liked Templates", () => {
  test("displays liked templates", async ({ page, request }) => {
    const email = uniqueEmail();
    const { token } = await apiRegister(request, email, "Password123!", "Liked User");
    const template = await apiCreateTemplate(request, token, {
      title: "Liked Template",
      category: "Engineering",
      description: "A template to like.",
      systemInstruction: "You are an interviewer.",
    });

    await request.post(`http://127.0.0.1:4000/templates/${template.id}/like`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    await login(page, email, "Password123!");
    await gotoPage(page, "/liked");

    // Liked page should show the template
    await expect(page.locator("text=Liked Template").first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator(".h3").filter({ hasText: "Liked Templates" })).toBeVisible();
  });

  test("shows empty state when no liked templates", async ({ page, request }) => {
    const email = uniqueEmail();
    await apiRegister(request, email, "Password123!", "No Liked User");

    await login(page, email, "Password123!");
    await gotoPage(page, "/liked");

    await expect(page.getByText("No liked templates")).toBeVisible({
      timeout: 10000,
    });
  });

  test("can unlike a template from liked page", async ({ page, request }) => {
    const email = uniqueEmail();
    const { token } = await apiRegister(request, email, "Password123!", "Unlike User");
    const template = await apiCreateTemplate(request, token, {
      title: "To Be Unliked Template",
      category: "Engineering",
      description: "A template to unlike.",
      systemInstruction: "You are an interviewer.",
    });

    await request.post(`http://127.0.0.1:4000/templates/${template.id}/like`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    await login(page, email, "Password123!");
    await gotoPage(page, "/liked");

    await expect(page.locator("text=To Be Unliked Template").first()).toBeVisible({
      timeout: 10000,
    });

    // Click the like icon in the template card (heart area is the last mono span)
    const card = page.locator(".card").filter({ hasText: "To Be Unliked Template" });
    // Click the heart icon by targeting the SVG inside the card
    await card.locator("svg").first().click();

    // After unliking, the template should disappear from liked page
    await expect(page.locator("text=To Be Unliked Template").first()).not.toBeVisible({
      timeout: 10000,
    });
  });
});

test.describe("Sessions History", () => {
  test("displays sessions page with heading", async ({ page, request }) => {
    const email = uniqueEmail();
    await apiRegister(request, email, "Password123!", "History User");

    await login(page, email, "Password123!");
    await gotoPage(page, "/sessions");

    // Topbar renders title in an h3 class span
    await expect(page.locator(".h3").filter({ hasText: "My Sessions" })).toBeVisible();
  });

  test("shows empty state when no sessions", async ({ page, request }) => {
    const email = uniqueEmail();
    await apiRegister(request, email, "Password123!", "No Sessions User");

    await login(page, email, "Password123!");
    await gotoPage(page, "/sessions");

    await expect(page.getByText("No sessions yet")).toBeVisible({
      timeout: 10000,
    });
  });
});

test.describe("Settings", () => {
  test("displays settings page", async ({ page, request }) => {
    const email = uniqueEmail();
    await apiRegister(request, email, "Password123!", "Settings User");

    await login(page, email, "Password123!");
    await gotoPage(page, "/settings");

    // Topbar title is rendered in h3 class span
    await expect(page.locator(".h3").filter({ hasText: "Settings" })).toBeVisible();
  });

  test("shows account information", async ({ page, request }) => {
    const email = uniqueEmail();
    await apiRegister(request, email, "Password123!", "Account Info User");

    await login(page, email, "Password123!");
    await gotoPage(page, "/settings");

    await expect(page.getByText("Account")).toBeVisible();
    // Disabled input fields show the display name and email
    await expect(page.locator("input[disabled]").first()).toBeVisible();
    await expect(page.getByText("Session Defaults")).toBeVisible();
  });

  test("has logout button on settings page", async ({ page, request }) => {
    const email = uniqueEmail();
    await apiRegister(request, email, "Password123!", "Settings Logout User");

    await login(page, email, "Password123!");
    await gotoPage(page, "/settings");

    await expect(page.getByRole("button", { name: "Logout" })).toBeVisible();
  });
});
