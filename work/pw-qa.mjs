import { createRequire } from "node:module";
import { writeFile } from "node:fs/promises";

const require = createRequire(new URL("../frontend/package.json", import.meta.url));
const { chromium } = require("playwright");
const root = process.cwd().replaceAll("\\", "/");
const out = `${root}/outputs`;
const url = "http://127.0.0.1:8000/";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
const messages = [];

page.on("console", (message) => {
  if (["error", "warning"].includes(message.type())) {
    messages.push({ type: message.type(), text: message.text() });
  }
});
page.on("pageerror", (error) => messages.push({ type: "pageerror", text: error.message }));

await page.goto(url, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(700);

const homeChecks = {
  title: await page.title(),
  url: page.url(),
  recipesVisible: await page.getByText("Рецепты кофе").isVisible(),
  v60Visible: (await page.locator('[data-testid^="recipe-card-"]').filter({ has: page.locator("h2", { hasText: "V60" }) }).count()) > 0,
  addVisible: await page.getByLabel("Добавить карточку").isVisible(),
  hasHorizontalOverflow: await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth),
};
await page.screenshot({ path: `${out}/trud-mobile-home.png`, fullPage: false });

await page.locator('[data-testid^="recipe-card-"]').filter({ has: page.locator("h2", { hasText: "V60" }) }).click();
await page.waitForTimeout(250);
const detailChecks = {
  detailVisible: await page.getByText("технологическая карта").isVisible(),
  detailTitleVisible: await page.locator(".sheet h2").filter({ hasText: "V60" }).isVisible(),
  timerVisible: await page.locator(".timer-ring").isVisible(),
  extractionVisible: await page.locator(".extraction-tool").isVisible(),
};
await page.screenshot({ path: `${out}/trud-mobile-detail.png`, fullPage: false });

await page.getByLabel("Закрыть").click();
await page.waitForTimeout(200);
await page.getByTestId("add-card").click();
await page.waitForTimeout(250);
const createChecks = {
  createVisible: await page.getByText("Новая карточка").isVisible(),
  titleInputVisible: await page.getByPlaceholder("Например, Фокачча").isVisible(),
};
await page.screenshot({ path: `${out}/trud-mobile-create.png`, fullPage: false });

await page.setViewportSize({ width: 1280, height: 900 });
await page.goto(url, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(500);
const desktopChecks = {
  recipesVisible: await page.getByText("Рецепты кофе").isVisible(),
  centeredFrame: await page.evaluate(() => {
    const frame = document.querySelector(".phone-frame");
    if (!frame) return false;
    const rect = frame.getBoundingClientRect();
    return rect.width <= 432 && rect.left > 300 && rect.right < window.innerWidth - 300;
  }),
};
await page.screenshot({ path: `${out}/trud-desktop.png`, fullPage: false });

await writeFile(
  `${out}/trud-qa.json`,
  JSON.stringify({ homeChecks, detailChecks, createChecks, desktopChecks, messages }, null, 2),
  "utf8",
);

await browser.close();
