import { chromium } from "@playwright/test";

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  const errors: string[] = [];
  const warnings: string[] = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
    if (msg.type() === "warning") warnings.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(`[pageerror] ${err.message}`));

  await page.goto("http://localhost:3000/lol/damage-calc", { waitUntil: "networkidle" });

  // 攻撃側チャンピオン選択：トリガーをクリック→input出現→入力→選択
  const atkTrigger = page.locator("text=チャンピオンを検索...").first();
  await atkTrigger.click();
  await page.locator("input[placeholder='チャンピオンを検索...']").first().fill("エイトロックス");
  await page.waitForTimeout(400);
  await page.locator("text=エイトロックス").first().click();
  await page.waitForTimeout(1000);

  // 防御側チャンピオン選択
  const defTrigger = page.locator("text=チャンピオンを検索...").first();
  await defTrigger.click();
  await page.locator("input[placeholder='チャンピオンを検索...']").first().fill("アーリ");
  await page.waitForTimeout(400);
  await page.locator("text=アーリ").first().click();
  await page.waitForTimeout(2000);

  await page.screenshot({ path: "/tmp/screenshot-aatrox-ahri.png", fullPage: false });

  console.log("=== ERRORS ===");
  errors.forEach(e => console.log(e));
  console.log("=== WARNINGS ===");
  warnings.forEach(w => console.log(w));
  console.log(`errors: ${errors.length}, warnings: ${warnings.length}`);

  await browser.close();
}

main();
