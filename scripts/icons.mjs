// Rasterises the favicons that scripts/logo.py writes as SVG, for browsers that do not use app/icon.svg:
//   app/favicon.ico     16, 32 and 48px PNGs of the blue mark on transparent (built with ffmpeg)
//   app/apple-icon.png  180px, the mark on Abyss
// Usage: node scripts/icons.mjs   (run after npm run logo; needs Google Chrome and ffmpeg)
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright-core";

const tmp = mkdtempSync(join(tmpdir(), "borr-icons-"));
const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const shoot = async (svgFile, size, out) => {
  const page = await browser.newPage({ viewport: { width: size, height: size } });
  const src = `data:image/svg+xml;base64,${readFileSync(svgFile).toString("base64")}`;
  await page.setContent(`<style>html,body{margin:0;background:transparent}</style><img src="${src}" width="${size}" height="${size}" style="display:block">`);
  await page.screenshot({ path: out, omitBackground: true });
  await page.close();
};
const sizes = [16, 32, 48];
for (const s of sizes) await shoot("app/icon.svg", s, join(tmp, `i${s}.png`));
await shoot("_scrape/apple-icon.svg", 180, "app/apple-icon.png");
await browser.close();
execFileSync("ffmpeg", ["-v", "error", "-y", ...sizes.flatMap((s) => ["-i", join(tmp, `i${s}.png`)]),
  ...sizes.flatMap((_, i) => ["-map", String(i)]), "app/favicon.ico"]);
console.log("app/favicon.ico (16, 32, 48) and app/apple-icon.png (180) written");
