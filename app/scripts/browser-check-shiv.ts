import { chromium } from "@playwright/test";

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(`[pageerror] ${err.message}`));

  await page.goto("http://localhost:3000/lol/damage-calc", { waitUntil: "networkidle" });

  // 攻撃側: エイトロックス
  await page.locator("text=チャンピオンを検索...").first().click();
  await page.locator("input[placeholder='チャンピオンを検索...']").first().fill("エイトロックス");
  await page.waitForTimeout(400);
  await page.locator("text=エイトロックス").first().click();
  await page.waitForTimeout(800);

  // スタティックシブを追加（アイテム検索）
  await page.locator("text=アイテムを検索...").first().click();
  await page.locator("input[placeholder='アイテムを検索...']").first().fill("スタティック");
  await page.waitForTimeout(400);
  await page.screenshot({ path: "/tmp/shiv-search.png" });

  await page.locator("text=スタティック シヴ").first().click();
  await page.waitForTimeout(800);

  // 防御側: アーリ
  await page.locator("text=チャンピオンを検索...").first().click();
  await page.locator("input[placeholder='チャンピオンを検索...']").first().fill("アーリ");
  await page.waitForTimeout(400);
  await page.locator("text=アーリ").first().click();
  await page.waitForTimeout(1500);

  await page.screenshot({ path: "/tmp/shiv-result.png", fullPage: true });

  // テーブルの中身を取得
  const rows = await page.locator("table tbody tr td:first-child").allTextContents();
  console.log("=== TABLE ROWS ===");
  rows.forEach(r => console.log(r));

  console.log("\n=== ERRORS ===");
  errors.forEach(e => console.log(e));
  console.log(`errors: ${errors.length}`);

  await browser.close();
}

main();
