import data from "@/lib/data.json";

/* Every word on the page. Live fields come from lib/data.json (refreshed by `npm run scrape`); the rest is quoted from
   the live pages named beside it. House rule for these demos: no em or en dashes anywhere, so live titles that use
   one are rewritten with a colon (undash). */
const undash = (s: string) => s.replace(/\s*[–—]\s*/g, ": ").replace(/\s+-\s+/g, ": ");

const SITE = "https://www.borrdrilling.com";
export const live = (path: string) => (path.startsWith("http") ? path : `${SITE}${path.startsWith("/") ? "" : "/"}${path}`);

export type Link = { label: string; href: string };
const link = (l: { title: string; url: string }): Link => ({ label: l.title, href: live(l.url.replace("/sustainability/#", "/sustainability#")) });

const h = data.home;

// Header and menu: the live navigation, every group and child in its live order.
export const nav: (Link & { children: Link[] })[] = [
  { label: "About Us", href: live("/about"), children: [
    { label: "Our Vision", href: live("/about#vision") },
    { label: "Our Story", href: live("/about#ourstory") },
    { label: "Our Values", href: live("/about#ourvalue") },
    { label: "Corporate Responsibility", href: live("/about#corporate-responsibility") },
    { label: "Board of Directors", href: live("/about#directors") },
    { label: "Executive Management", href: live("/about#executive-management") },
  ] },
  { label: "Our Fleet", href: live("/our-fleet"), children: [] },
  { label: "Our Business", href: live("/qhse"), children: [
    { label: "QHSE", href: live("/qhse") },
    { label: "Operations", href: live("/operations") },
    { label: "Sustainability", href: live("/sustainability") },
    { label: "Supply Chain", href: live("/supply-chain") },
  ] },
  { label: "Careers", href: live("/careers"), children: [] },
  { label: "Investors", href: live("/investor-relations"), children: [
    { label: "Investor Relations", href: live("/investor-relations") },
    { label: "News", href: live("/news") },
    { label: "Reports and Presentations", href: live("/reports-and-presentations") },
    { label: "SEC Filings", href: live("/sec-filings") },
    { label: "Stock Information", href: live("/stock-information") },
    { label: "Dividend Information", href: live("/dividend-information") },
    { label: "Fact Sheet", href: live("/fact-sheet") },
    { label: "Key Interactive Figures", href: live("/key-interactive-figures") },
    { label: "Prospectus", href: live("/prospectus") },
    { label: "Financial Calendar", href: live("/financial-calendar") },
    { label: "Fleet Status Report", href: live("/fleet-status-report") },
  ] },
];

// The homepage chapters, for the menu's "On this page" list.
export const sections: Link[] = [
  { label: "About Borr Drilling", href: "#about" },
  { label: "Global Presence", href: "#presence" },
  { label: "News", href: "#news" },
  { label: "Careers", href: "#careers" },
  { label: "Sustainability", href: "#sustainability" },
  { label: "Share Information", href: "#shares" },
];

// Hero: the live home film with the homepage's opening block ("Built To Make a Difference").
export const hero = {
  title: h.intro.title,
  text: h.intro.text,
  cta: link(h.intro.cta),
  label: "NYSE and Euronext Oslo Børs: BORR", // from every release's dateline, "(NYSE and OSE: BORR)"
  video: { src: "/media/hero.mp4", small: "/media/hero-960.mp4", poster: "/media/hero-poster.jpg" },
};

/* About: the live block's title, photograph and link. The live block carries no copy, so the words are the About
   page's own (borrdrilling.com/about: vision_description and company_details). The facts are from the same page and
   from the releases' "About Borr Drilling Limited" paragraph. */
export const about = {
  title: h.about.title,
  vision: "To be the Leading Offshore Drilling Company",
  text: [
    "Borr Drilling Limited is a premier offshore shallow-water drilling contractor dedicated to providing exceptional drilling services to the global oil and gas industry. Our expertise lies in operating modern jack-up rigs, specifically designed to perform efficiently in water depths of up to approximately 400 feet.",
    "We cater to a wide range of client needs including exploration, production, workover, plug and abandonment, and Carbon Capture and Storage (CCS) services.",
  ],
  facts: [
    { value: 2016, suffix: "", label: "Incorporated in Bermuda" },
    { value: h.presence.reduce((n, r) => n + r.count, 0), suffix: "", label: "Jack-up rigs worldwide" },
    { value: 400, suffix: " ft", label: "Water depths of up to approximately" },
  ],
  image: { src: "/media/about.webp", small: "/media/about-800.webp", alt: "A Borr Drilling jack-up rig standing in open water under a blue sky" },
  cta: link(h.about.cta),
};

/* Global Presence: the live map's five regions with their pin counts and rig names, in live order. Pin positions are
   placed on the triangle map (lib/map.ts, 1046 x 680) at each region's operating waters. */
const pins: Record<string, [number, number]> = {
  "Europe": [496, 262], // the North Sea
  "Americas": [228, 404], // the Gulf of Mexico
  "West Africa": [508, 470], // the Gulf of Guinea
  "Middle East and North Africa": [646, 380], // the Arabian Gulf
  "Southeast Asia": [788, 452], // the Gulf of Thailand
};
export const presence = {
  title: "Global Presence",
  text: "Borr Drilling owns and operates jack-up rigs of modern and high specification designs and provides services focused on the shallow-water segment to the offshore oil and gas industry worldwide.", // releases' boilerplate
  regions: h.presence.map((r) => ({ ...r, pin: pins[r.region] ?? [500, 340], id: r.region.toLowerCase().replace(/[^a-z]+/g, "-") })),
  cta: link(h.presence[0].cta),
};

/* News: the press releases the live homepage lists (its Euroland feed), newest first. Titles drop the repeated
   "Borr Drilling Limited -" prefix; the summary is each release's opening paragraph. */
const opening = (body: string) => {
  const s = body.replace(/\s*\((?:the\s+)?[“"]Company[”"]\)|\s*\([“"]Borr Drilling[”"] or the [“"]Company[”"]\)/g, "");
  // Sentences end at a full stop followed by a space and a capital (so "www.borrdrilling.com" stays whole).
  const sentences = s.split(/(?<=\.)\s+(?=[A-Z])/);
  return undash(sentences.slice(0, 2).join(" ").trim());
};
export const news = {
  title: h.news.title,
  cta: link(h.news.cta),
  items: data.news.map((n) => ({
    title: undash(n.title.replace(/^Borr Drilling Limited\s*[-–]\s*/, "")),
    date: n.date,
    text: opening(n.body),
    href: n.href,
  })),
};

// Careers: the live block's title, photograph and link, with the Careers page's own opening line (short_description).
export const careers = {
  title: h.careers.title,
  text: "We aim to be the sustainable leader in the offshore business to protect our common future and we will do this by investing in you and your career and provide you with the tools and the support to help you grow.",
  quote: "Cultivating Talent and Shaping Futures", // Careers page, people_content
  image: { src: "/media/careers.webp", small: "/media/careers-800.webp", alt: "The crew of the Borr Drilling rig Gerd on its helideck" },
  cta: link(h.careers.cta),
};

// Sustainability: the live block's title (undashed), photograph and link, with the Sustainability page's strapline and its three pillars.
export const sustainability = {
  title: undash(h.sustainability.title),
  strap: "Setting a new standard for sustainable offshore drilling",
  text: "Our ambition is to be a sustainability leader in the offshore drilling industry. The Borr Drilling sustainability strategy is built on three pillars:",
  pillars: [
    "Invest to reduce our environmental impact and to increase our positive effect on society",
    "Establish and integrate sustainability into our way of doing business",
    "Identify opportunities for adaption to the energy transition",
  ],
  image: { src: "/media/sustainability.webp", small: "/media/sustainability-800.webp", alt: "A Borr Drilling jack-up rig seen from above with two support vessels alongside" },
  cta: link(h.sustainability.cta),
};

// Share Information: both live tickers, snapshot taken by `npm run scrape`.
const s = data.shares;
export const shares = {
  title: h.shares.title,
  markets: [
    { id: "nyse", name: "New York Stock Exchange", short: "NYSE", tz: "EST", ...s.nyse },
    { id: "ose", name: "Euronext Oslo Børs", short: "OSE", tz: "CET", ...s.ose },
  ],
  cta: { label: "Stock Information", href: live("/stock-information") },
};

export const contact = {
  title: "Get in Touch!",
  href: live("/contact-us"),
  offices: { label: "Our offices", href: live("/contact-us#contact") },
};

export const socials = [{ name: "LinkedIn", href: "https://www.linkedin.com/company/borr-drilling/?viewAsMember=true", icon: "linkedin" as const }];

export const footer = {
  copyright: "© 2024 Borr Drilling All rights reserved",
  legal: [
    { label: "Privacy Statement", href: "https://api.borrdrilling.com/wp-content/uploads/2024/10/Privacy-Statement.pdf" },
    { label: "Cookie Policy", href: "https://api.borrdrilling.com/wp-content/uploads/2026/01/BorrDrilling_Cookie_Policy.pdf" },
  ],
};
