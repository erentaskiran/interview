import { test, expect } from "@playwright/test";
import { apiRegister, uniqueEmail, login } from "./helpers";

test.describe("Authentication", () => {
  test("login page is displayed by default", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByText("Welcome back")).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("can switch to register mode", async ({ page }) => {
    await page.goto("/login");

    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page.getByText("Create your account")).toBeVisible();
    await expect(page.locator('input[type="text"]')).toBeVisible();
  });

  test("can register a new account", async ({ page, request }) => {
    const email = uniqueEmail();

    await page.goto("/login");
    await page.getByRole("button", { name: /create account/i }).click();

    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[type="password"]').fill("Password123!");
    await page.locator('input[type="text"]').fill("E2E Test User");

    await page
      .getByRole("button", { name: /create account/i })
      .nth(1)
      .click();

    await page.waitForURL(/\/discover/);
  });

  test("can login with existing account", async ({ page, request }) => {
    const email = uniqueEmail();
    const password = "Password123!";
    await apiRegister(request, email, password, "Login Test User");

    await login(page, email, password);

    await expect(page).toHaveURL(/\/discover/);
  });
});
