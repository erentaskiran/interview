import { test, expect } from "@playwright/test";
import { apiRegister, apiCreateTemplate, uniqueEmail, login, gotoPage } from "./helpers";

test.describe("Interview Session", () => {
  test.fixme("can start an interview session", async ({ page, request }) => {
    const email = uniqueEmail();
    const { token } = await apiRegister(request, email, "Password123!", "Session User");
    const template = await apiCreateTemplate(request, token, {
      title: "Session Template",
      category: "Engineering",
      description: "A session test template.",
      systemInstruction: "Ask only one question then finish.",
    });

    await login(page, email, "Password123!");
    await gotoPage(page, `/templates/${template.id}`);

    await page.getByText("Start interview").click();

    await page.waitForURL(/\/sessions\//);
  });

  test.fixme("session page shows finish button", async ({ page, request }) => {
    const email = uniqueEmail();
    const { token } = await apiRegister(request, email, "Password123!", "Session UI User");
    const template = await apiCreateTemplate(request, token, {
      title: "UI Session Template",
      category: "Engineering",
      description: "A UI session template.",
      systemInstruction: "Ask one question.",
    });

    await login(page, email, "Password123!");
    await gotoPage(page, `/templates/${template.id}`);

    await page.getByText("Start interview").click();
    await page.waitForURL(/\/sessions\//);

    await expect(page.getByText("Finish")).toBeVisible();
  });
});
