import { test, expect } from "@playwright/test";

/** canvas 経由で color 文字列を RGB に変換し、輝度(0〜255平均)を返す */
async function getBrightness(page: import("@playwright/test").Page, colorStr: string): Promise<number> {
  return page.evaluate((color) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return (r + g + b) / 3;
  }, colorStr);
}

test("login page placeholder text is dark (not light gray)", async ({ page }) => {
  await page.goto("/auth/login");
  const input = page.locator("input[placeholder='メールアドレス']");
  await expect(input).toBeVisible();

  const colorStr = await input.evaluate((el) =>
    window.getComputedStyle(el, "::placeholder").color
  );

  const brightness = await getBrightness(page, colorStr);
  // zinc-900 の輝度は約 24 (暗い)。zinc-400 は約 161 (明るい)。
  // 128 未満 = 十分に暗い色であることを確認
  expect(brightness).toBeLessThan(128);
});

test("range input track shows gradient fill (not solid black)", async ({ page }) => {
  await page.goto("/damage-calc");
  await expect(page.locator("input.sp-slider").first()).toBeVisible();

  // コンポーネントが <style> タグを注入し、linear-gradient と zinc-200 が設定されているか確認
  const hasGradientStyle = await page.evaluate(() => {
    const styles = Array.from(document.querySelectorAll("style"));
    return styles.some(
      (s) =>
        s.textContent?.includes("sp-slider") &&
        s.textContent?.includes("linear-gradient") &&
        s.textContent?.includes("#e4e4e7")
    );
  });
  expect(hasGradientStyle).toBe(true);

  // --sp-fill CSS カスタムプロパティがスライダー要素に設定されているか確認
  const hasFillVar = await page.evaluate(() => {
    const el = document.querySelector("input.sp-slider");
    return el?.getAttribute("style")?.includes("--sp-fill") ?? false;
  });
  expect(hasFillVar).toBe(true);
});

test("save dialog appears below top of viewport", async ({ page }) => {
  const email = process.env.PLAYWRIGHT_USER_EMAIL;
  const password = process.env.PLAYWRIGHT_USER_PASSWORD;

  if (!email || !password) {
    test.skip(
      true,
      "PLAYWRIGHT_USER_EMAIL / PLAYWRIGHT_USER_PASSWORD を設定するとこのテストが実行されます"
    );
    return;
  }

  // ログイン
  await page.goto("/auth/login");
  await page.fill("input[placeholder='メールアドレス']", email);
  await page.fill("input[placeholder='パスワード']", password);
  await page.click("button[type='submit']");
  await page.waitForURL("**/my-builds", { timeout: 10000 });

  // damage-calc へ移動して保存ダイアログを開く
  await page.goto("/damage-calc");
  await page.click("button:has-text('保存')");

  const overlay = page.locator(".fixed.inset-0");
  await expect(overlay).toBeVisible();

  // ダイアログ本体の位置確認 — viewport の上端に張り付いていないこと
  const dialog = overlay.locator("> div");
  const box = await dialog.boundingBox();
  expect(box).not.toBeNull();
  // pt-[30vh] 配置のため y は viewport 高さの約 30% 以上になるはず
  const viewportHeight = page.viewportSize()!.height;
  expect(box!.y).toBeGreaterThan(viewportHeight * 0.2);
});
