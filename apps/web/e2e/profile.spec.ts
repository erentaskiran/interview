import { test, expect } from "@playwright/test";
import { apiRegister, apiCreateTemplate, uniqueEmail, login, gotoPage } from "./helpers";

test.describe("Profile", () => {
  test.fixme("displays own profile", async ({ page, request }) => {
    const email = uniqueEmail();
    const { user } = await apiRegister(request, email, "Password123!", "Profile User");

    await login(page, email, "Password123!");
    await gotoPage(page, `/profile/${user.id}`);

    await expect(page.getByText("Profile User").first()).toBeVisible();
  });

  test.fixme("can follow and unfollow another user", async ({ page, request }) => {
    const userA = uniqueEmail();
    const userB = uniqueEmail();

    const { token: tokenA, user: accountA } = await apiRegister(
      request,
      userA,
      "Password123!",
      "User A"
    );
    await apiCreateTemplate(request, tokenA, {
      title: "Follow Test Template",
      category: "Engineering",
      description: "A template by user A.",
      systemInstruction: "You are an interviewer.",
    });
    const { user: accountB } = await apiRegister(request, userB, "Password123!", "User B");

    await login(page, userB, "Password123!");
    await gotoPage(page, `/profile/${accountA.id}`);

    await page.getByRole("button", { name: "Follow" }).click();
    await expect(page.getByText("Following")).toBeVisible();

    await page.getByText("Following").click();
    await expect(page.getByText("Follow")).toBeVisible();
  });
});
