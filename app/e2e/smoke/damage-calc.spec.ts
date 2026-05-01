import { test, expect } from "@playwright/test";

test("damage-calc page loads without console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });

  await page.goto("/damage-calc");
  await expect(page.locator("text=ダメけい").first()).toBeVisible();
  expect(errors).toHaveLength(0);
});

test("login page loads", async ({ page }) => {
  await page.goto("/auth/login");
  await expect(page.locator("input[placeholder='メールアドレス']")).toBeVisible();
});
