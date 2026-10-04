// Visual check: loads the running page in headless Chrome at one width, scrolls the whole page slowly (so every reveal
// plays), then saves one screenshot per viewport and prints the page height, horizontal overflow, broken images and
// console errors as JSON.
// Usage: node scripts/shots.mjs <width> <outDir> [url] [--reduced]
import { chromium } from "playwright-core";

const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const [w = "1440", out = "shots", url = "http://127.0.0.1:3041/"] = args;
const reduced = process.argv.includes("--reduced");
const W = Number(w), H = W < 500 ? 812 : W < 1000 ? 1024 : 900;
const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
const page = await browser.newPage({ viewport: { width: W, height: H }, reducedMotion: reduced ? "reduce" : "no-preference" });
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push(String(e)));
await page.goto(url, { waitUntil: "load" });
await page.waitForTimeout(2600);
const total = await page.evaluate(() => document.documentElement.scrollHeight);
await page.mouse.move(W / 2, H / 2);
for (let y = 0; y < total; y += 150) { await page.mouse.wheel(0, 150); await page.waitForTimeout(35); }
await page.waitForTimeout(1500);
const height = await page.evaluate(() => document.documentElement.scrollHeight);
const hscroll = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
const broken = await page.evaluate(() => [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src));
let i = 0;
for (let y = 0; y < height; y += H) {
  await page.evaluate((y) => window.scrollTo(0, y), y);
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${out}/w${W}-${String(i++).padStart(2, "0")}.jpg`, type: "jpeg", quality: 70 });
}
console.log(JSON.stringify({ width: W, height, viewports: +(height / H).toFixed(1), hscroll, broken, errors }));
await browser.close();
