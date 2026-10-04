// Checks every link on the rendered homepage: borrdrilling.com URLs must be in the live sitemap and answer 200; other
// external URLs must answer (2xx/3xx; some social sites refuse bots, reported as "blocked"); every outbound link
// must open in a new tab with rel="noopener"; "#" links must point at an element on the page.
// Usage: node scripts/check-links.mjs [http://127.0.0.1:3041/]
const page = process.argv[2] ?? "http://127.0.0.1:3041/";
const UA = { "user-agent": "Mozilla/5.0 (Macintosh) Chrome/130" };
const html = await (await fetch(page)).text();
const sitemap = new Set([...(await (await fetch("https://www.borrdrilling.com/sitemap-0.xml", { headers: UA })).text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/\/$/, "")));
const anchors = [...html.matchAll(/<a\b[^>]*>/g)].map((m) => m[0]);
const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
const problems = [], seen = new Map();
for (const a of anchors) {
  const href = (a.match(/href="([^"]*)"/) ?? [])[1];
  if (!href) continue;
  const h = href.replace(/&amp;/g, "&");
  if (h.startsWith("#")) { if (h !== "#top" && h !== "#" && !ids.has(h.slice(1))) problems.push(`missing anchor ${h}`); if (h === "#") problems.push("bare # link"); continue; }
  if (h.startsWith("tel:") || h.startsWith("mailto:")) { seen.set(h, "ok"); continue; }
  if (!/target="_blank"/.test(a) || !/rel="noopener"/.test(a)) problems.push(`not new-tab/noopener: ${h}`);
  seen.set(h, null);
}
for (const h of seen.keys()) {
  if (seen.get(h)) continue;
  const u = new URL(h);
  if (u.hostname === "www.borrdrilling.com" && !u.search && !sitemap.has((u.origin + u.pathname).replace(/\/$/, ""))) problems.push(`not in sitemap: ${h}`);
  let status;
  try { status = (await fetch(h, { headers: UA, redirect: "follow", signal: AbortSignal.timeout(15000) })).status; } catch (e) { status = "error " + e.message; }
  seen.set(h, status);
  if (!(typeof status === "number" && status < 400)) problems.push(`${status}: ${h}`);
}
console.log(`${seen.size} unique destinations, ${anchors.length} links`);
for (const [h, s] of seen) console.log(String(s).padEnd(6), h);
console.log(problems.length ? "\nPROBLEMS\n" + problems.join("\n") : "\nAll links OK");
