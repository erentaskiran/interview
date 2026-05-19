import type { APIRequestContext } from "@playwright/test";

export const API_BASE_URL = "http://127.0.0.1:4000";

export async function apiRegister(
  request: APIRequestContext,
  email: string,
  password: string,
  displayName: string
) {
  const response = await request.post(`${API_BASE_URL}/auth/register`, {
    data: { email, password, displayName },
  });
  if (!response.ok()) {
    const body = await response.text();
    throw new Error(`Registration failed: ${response.status()} - ${body}`);
  }
  return (await response.json()) as { token: string; user: { id: string } };
}

export async function apiLogin(request: APIRequestContext, email: string, password: string) {
  const response = await request.post(`${API_BASE_URL}/auth/login`, {
    data: { email, password },
  });
  if (!response.ok()) {
    const body = await response.text();
    throw new Error(`Login failed: ${response.status()} - ${body}`);
  }
  return (await response.json()) as { token: string; user: { id: string } };
}

export async function apiCreateTemplate(
  request: APIRequestContext,
  token: string,
  data: {
    title: string;
    category: string;
    description: string;
    systemInstruction: string;
  }
) {
  const response = await request.post(`${API_BASE_URL}/templates`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { ...data, voiceModel: "aura-2-thalia-en" },
  });
  if (!response.ok()) {
    const body = await response.text();
    throw new Error(`Template creation failed: ${response.status()} - ${body}`);
  }
  return (await response.json()) as { id: string };
}

export function uniqueEmail() {
  return `test-${Date.now()}-${Math.random().toString(36).slice(2)}@e2e.local`;
}

export async function login(page: any, email: string, password: string) {
  await page.goto("/login");
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page
    .getByRole("button", { name: /sign in/i })
    .nth(1)
    .click();
  await page.waitForURL(/\/discover/);
}

export async function gotoPage(page: any, url: string) {
  await page.goto(url);

  // Wait for boot Loading... if present
  try {
    await page.waitForSelector("text=Loading...", { timeout: 3000 });
    await page.waitForSelector("text=Loading...", {
      state: "detached",
      timeout: 10000,
    });
  } catch {
    // Boot loading not present
  }

  // Handle redirect from bootLoading
  if (!page.url().includes(url.replace(/^\//, ""))) {
    await page.goto(url);
  }

  // Wait for page-level loading states to resolve
  try {
    await Promise.race([
      page.waitForSelector("text=Loading template...", { state: "detached", timeout: 15000 }),
      page.waitForSelector("text=Loading liked templates...", {
        state: "detached",
        timeout: 15000,
      }),
      page.waitForSelector("text=Loading sessions...", { state: "detached", timeout: 15000 }),
      page.waitForSelector("text=Loading profile...", { state: "detached", timeout: 15000 }),
      page.waitForSelector("text=Loading session...", { state: "detached", timeout: 15000 }),
    ]);
  } catch {
    // No loading state appeared
  }

  // Small extra wait for React renders
  await page.waitForTimeout(500);
}
