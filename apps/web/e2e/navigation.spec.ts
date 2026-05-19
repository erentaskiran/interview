import { test, expect } from "@playwright/test";
import { apiRegister, uniqueEmail, login } from "./helpers";

test.describe("Navigation", () => {
  test("sidebar links navigate between pages", async ({ page, request }) => {
    const email = uniqueEmail();
    await apiRegister(request, email, "Password123!", "Nav User");
    await login(page, email, "Password123!");

    // Navigate via sidebar links
    await page.locator(".side__item").filter({ hasText: "Liked" }).click();
    await expect(page.getByText("Liked Templates", { exact: true })).toBeVisible();

    await page.locator(".side__item").filter({ hasText: "Sessions" }).click();
    await expect(page.getByText("My Sessions")).toBeVisible();

    await page.locator(".side__item").filter({ hasText: "Settings" }).click();
    await expect(page.getByText("Account")).toBeVisible();

    await page.locator(".side__item").filter({ hasText: "Discover" }).click();
    await expect(page).toHaveURL(/\/discover/);
  });

  test("sidebar displays user info", async ({ page, request }) => {
    const email = uniqueEmail();
    await apiRegister(request, email, "Password123!", "Sidebar User");
    await login(page, email, "Password123!");

    await expect(page.locator(".side__user__name")).toContainText("Sidebar User");
  });

  test("quick interview page loads", async ({ page, request }) => {
    const email = uniqueEmail();
    await apiRegister(request, email, "Password123!", "Quick Nav User");
    await login(page, email, "Password123!");

    await page.locator(".side__item").filter({ hasText: "Quick interview" }).click();
    await expect(page).toHaveURL(/\/quick-interview/);

    // Topbar renders title "Quick Interview" inside an h3 class span
    await expect(page.locator(".h3").filter({ hasText: "Quick Interview" })).toBeVisible();
    await expect(page.getByText("Start in one click")).toBeVisible();
  });

  test("create template link navigates to create page", async ({ page, request }) => {
    const email = uniqueEmail();
    await apiRegister(request, email, "Password123!", "Create Nav User");
    await login(page, email, "Password123!");

    await page.locator(".side__item").filter({ hasText: "Create template" }).click();
    await expect(page).toHaveURL(/\/templates\/new/);
    await expect(page.getByText("Template details")).toBeVisible();
  });

  test("user menu contains navigation items", async ({ page, request }) => {
    const email = uniqueEmail();
    await apiRegister(request, email, "Password123!", "Menu User");
    await login(page, email, "Password123!");

    // Open user menu
    await page.locator(".top__avatarBtn").click();

    // Use specific button role selectors to avoid Text matching both sidebar and menu
    const menu = page.locator(".top__menu");
    await expect(menu.getByRole("button", { name: "Profile" })).toBeVisible();
    await expect(menu.getByRole("button", { name: "Liked" })).toBeVisible();
    await expect(menu.getByRole("button", { name: "Sessions" })).toBeVisible();
    await expect(menu.getByRole("button", { name: "Settings" })).toBeVisible();
    await expect(menu.getByRole("button", { name: "Logout" })).toBeVisible();
  });

  test("unauthorized redirect works for all protected routes", async ({ page }) => {
    const protectedPaths = [
      "/discover",
      "/liked",
      "/sessions",
      "/settings",
      "/templates/new",
      "/quick-interview",
    ];

    for (const path of protectedPaths) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/login/);
    }
  });

  test("home redirects to login when not authenticated", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
  });
});
