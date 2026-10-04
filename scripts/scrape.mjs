// Refreshes lib/data.json from the live site, so the homepage can be rebuilt with current content:
//   home     the homepage's WordPress fields (from __NEXT_DATA__ on www.borrdrilling.com)
//   news     the press releases the homepage's Euroland feed shows (the list renders client-side, so it is read in
//            headless Chrome), each with its date and opening paragraph fetched from the release page
//   shares   both share tickers (NYSE in USD, Euronext Oslo Børs in NOK): last price, change, high, low, volume and
//            six months of closing prices, from the same public JSON endpoints the live tickers call
// Usage: npm run scrape   (needs Google Chrome installed; uses playwright-core)
import { writeFileSync } from "node:fs";
import { chromium } from "playwright-core";

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36";
const get = async (url, init = {}) => {
  const r = await fetch(url, { ...init, headers: { "user-agent": UA, ...(init.headers ?? {}) } });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r;
};
const text = (html) => html.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/g, "").replace(/<[^>]+>/g, "\n")
  .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#8217;|&rsquo;/g, "’").replace(/&#8220;|&ldquo;/g, "“").replace(/&#8221;|&rdquo;/g, "”")
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").split("\n").map((l) => l.trim()).filter(Boolean);

// 1. Homepage fields
const homeHtml = await (await get("https://www.borrdrilling.com/")).text();
const next = JSON.parse(homeHtml.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)[1]);
const acf = next.props.pageProps.data.acf;
const home = {
  video: acf.home_video,
  intro: { title: acf.about_us_title, text: text(acf.about_us_content).join(" "), cta: acf.about_us_button },
  about: { title: acf.about_title, image: acf.about_image.url, cta: acf.about_link },
  careers: { title: acf.join_our_team_title, image: acf.join_our_team_image.url, cta: acf.join_our_team_button },
  sustainability: { title: acf.taking_major_steps_title, image: acf.taking_major_steps_image.url, cta: acf.taking_major_steps_button },
  news: { title: acf.news_title, cta: acf.news_button },
  shares: { title: acf.graph_title },
  presence: acf.map_listing.map((r) => ({ region: r.region_name, count: Number(r.location_pin_number), rigs: r.sub_location.map((s) => s.location_name.trim()), cta: r.region_link })),
};

// 2. News: read the rendered Euroland list the homepage embeds, then each release.
const FEED = "https://tools.eurolandir.com/tools/pressreleases/?companycode=bm-bdrill&v=Tick&lang=en-GB";
const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
const page = await browser.newPage({ userAgent: UA });
await page.goto(FEED, { waitUntil: "networkidle" });
const list = await page.$$eval("a[href*='GetPressRelease']", (as) => as.map((a) => ({ title: a.textContent.trim(), href: a.href })).filter((a) => a.title.length > 10));
await browser.close();
const news = [];
for (const item of list) {
  const lines = text(await (await get(item.href)).text());
  const i = lines.findIndex((l) => /^Hamilton, Bermuda,/.test(l));
  const date = lines[i].replace(/^Hamilton, Bermuda,\s*/, "");
  // The body runs until the boilerplate "About Borr Drilling Limited".
  const end = lines.findIndex((l, k) => k > i && /^About Borr Drilling/.test(l));
  const body = lines.slice(i + 1, end).join(" ").replace(/^[-–]\s*/, "");
  news.push({ title: item.title, href: item.href, date, body });
}

// 3. Shares
const tickers = { nyse: { id: 112620, v: "nyse-r2024", tz: "Eastern Standard Time" }, ose: { id: 110261, v: "osl-r2024", tz: "W. Europe Standard Time" } };
const shares = {};
const start = new Date(Date.now() - 183 * 864e5);
const mdy = `${String(start.getMonth() + 1).padStart(2, "0")}/${String(start.getDate()).padStart(2, "0")}/${start.getFullYear()}`;
for (const [k, t] of Object.entries(tickers)) {
  const referer = `https://tools.eurolandir.com/tools/ticker/html/?companycode=bm-bdrill&v=${t.v}&lang=en-GB`;
  const q = new URLSearchParams({ instrumentID: t.id, lang: "en-GB", decimalMarket: ".", thousandGroupMarker: ",", timeZone: t.tz, defaultNumberFormat: "#,##0.00", companycode: "bm-bdrill", getCleanData: "false", IsCard: "false", PeriodJumpValue: "3", CurrencyConvert: "", v: t.v });
  const data = await (await get(`https://tools.eurolandir.com/tools/ticker/Scrolling/GetInstrumentData/?${q}`, { headers: { referer } })).json();
  const val = (n) => data.Values.find((v) => v.name === n);
  const extra = Object.fromEntries(data.ExtraData.map((e) => [e.Key, e.Value]));
  const tickerHtml = await (await get(referer)).text();
  const currency = (tickerHtml.match(/\b(USD|NOK)\b/) ?? [])[1] ?? (k === "nyse" ? "USD" : "NOK");
  const hist = await (await get(`https://tools.eurolandir.com/tools/ticker/Scrolling/GetGraphHistoricalData/?instrumentID=${t.id}&strStartDate=${encodeURIComponent(mdy)}&timezone=${encodeURIComponent(t.tz)}&isRealTime=false`, { headers: { referer } })).json();
  shares[k] = {
    currency,
    last: val("last").Formats[0].rawValue,
    change: val("change").Formats[0].rawValue,
    changePct: val("changePer").Formats[0].rawValue,
    high: val("high").Formats[0].rawValue,
    low: val("low").Formats[0].rawValue,
    volume: val("volume").Formats[0].rawValue,
    date: val("date").Formats[0].rawValue,
    shares: extra.numberOfShares,
    history: hist.Data.map((d) => [d.timestamp, d.value]),
  };
}

writeFileSync("lib/data.json", JSON.stringify({ scraped: new Date().toISOString(), home, news, shares }, null, 1) + "\n");
console.log(`home ok, ${news.length} releases, NYSE ${shares.nyse.last} ${shares.nyse.currency} (${shares.nyse.history.length} closes), OSE ${shares.ose.last} ${shares.ose.currency} (${shares.ose.history.length} closes)`);
