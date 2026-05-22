import { test, expect } from "@playwright/test";
import { apiRegister, apiCreateTemplate, uniqueEmail, login, gotoPage } from "./helpers";

test.describe("Profile", () => {
  test("displays own profile", async ({ page, request }) => {
    const email = uniqueEmail();
    const { user } = await apiRegister(request, email, "Password123!", "Profile User");

    await login(page, email, "Password123!");
    await gotoPage(page, `/profile/${user.id}`);

    await expect(page.getByText("Profile User").first()).toBeVisible();
    await expect(page.getByText("Templates 0")).toBeVisible();
    await expect(page.getByText("Followers 0")).toBeVisible();
    await expect(page.getByText("Following 0")).toBeVisible();
  });

  test("can follow and unfollow another user", async ({ page, request }) => {
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

    // Click Follow
    await page.getByRole("button", { name: "Follow" }).click();
    await expect(page.getByRole("button", { name: "Following" })).toBeVisible();

    // Click Following to unfollow
    await page.getByRole("button", { name: "Following" }).click();
    await expect(page.getByRole("button", { name: "Follow" })).toBeVisible();
  });

  test("shows own templates in profile templates tab", async ({ page, request }) => {
    const email = uniqueEmail();
    const { token, user } = await apiRegister(request, email, "Password123!", "Templates Tab User");
    await apiCreateTemplate(request, token, {
      title: "Profile Template A",
      category: "Engineering",
      description: "A template for profile.",
      systemInstruction: "You are an interviewer.",
    });
    await apiCreateTemplate(request, token, {
      title: "Profile Template B",
      category: "Design",
      description: "Another template for profile.",
      systemInstruction: "You are a design interviewer.",
    });

    await login(page, email, "Password123!");
    await gotoPage(page, `/profile/${user.id}`);

    // Templates tab is default selected
    await expect(page.locator("text=Profile Template A").first()).toBeVisible();
    await expect(page.locator("text=Profile Template B").first()).toBeVisible();

    // Counts should show 2 templates
    await expect(page.getByText("Templates 2")).toBeVisible();
  });

  test("can switch to liked tab on profile", async ({ page, request }) => {
    const email = uniqueEmail();
    const { token, user } = await apiRegister(request, email, "Password123!", "Tab Switch User");
    const template = await apiCreateTemplate(request, token, {
      title: "To Be Liked Template",
      category: "Engineering",
      description: "A template to like.",
      systemInstruction: "You are an interviewer.",
    });

    // Like the template first
    await request.post(`http://127.0.0.1:4000/templates/${template.id}/like`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    await login(page, email, "Password123!");
    await gotoPage(page, `/profile/${user.id}`);

    // Click Liked tab
    await page.locator("button.chip").filter({ hasText: "Liked" }).click();

    // The liked template should appear
    await expect(page.locator("text=To Be Liked Template").first()).toBeVisible();
  });

  test("own profile does not show follow button", async ({ page, request }) => {
    const email = uniqueEmail();
    const { user } = await apiRegister(request, email, "Password123!", "Self Profile User");

    await login(page, email, "Password123!");
    await gotoPage(page, `/profile/${user.id}`);

    // Own profile should NOT have Follow/Following button
    await expect(page.getByRole("button", { name: "Follow" })).not.toBeVisible();
  });
});
