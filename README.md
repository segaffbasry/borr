# Borr Drilling: homepage demo

A private redesign of the [borrdrilling.com](https://www.borrdrilling.com/) homepage, built with Next.js 16, GSAP
(ScrollTrigger and CustomEase) and Lenis. It is one route (`/`), never indexed, and every outbound link is held on the
page.

```bash
npm install
npm run dev        # http://127.0.0.1:3041
npm run typecheck
npm run build      # static: / plus the framework's /_not-found (and the /icon.svg, /apple-icon.png icon routes)
npm run scrape     # refresh lib/data.json: homepage fields, the news feed, both share tickers (needs Chrome)
npm run media      # rebuild public/media from borrdrilling.com (curl, ffmpeg, cwebp)
npm run logo       # flatten the vector logo into lib/logo.ts, public/brand and app/icon.svg (python3, svgelements)
npm run icons      # rasterise app/favicon.ico and app/apple-icon.png (Chrome, ffmpeg)
npm run map        # vectorise the live triangle world map into lib/map.ts (python3, scipy)
node scripts/check-links.mjs [url]        # every link on the running page against the live sitemap
node scripts/shots.mjs <width> <dir> [url] [--reduced]   # scroll-through screenshots, page height, errors
```

## Recon (4 October 2026)

**Live homepage, in order:** a hero film (`HP.mp4`, 20s, aerial rigs with the brand's blue triangles), "Built To
Make a Difference" (one paragraph, Learn More), Global Presence (a triangle world map with five pins: Europe 3,
Americas 8, West Africa 5, Middle East and North Africa 5, Southeast Asia 8, each listing its rigs), News (a Euroland
press-release iframe showing 3 releases, All News), About Borr Drilling (photo, Learn More), Join Our Team (photo,
Learn More), Taking Major Steps (photo, sustainability report link), Share Information (NYSE and OSE ticker iframes),
footer (logo, Privacy Statement, Cookie Policy, copyright, Get in Touch!, contact pin, LinkedIn). Next.js pages app
over a WordPress API (`api.borrdrilling.com`), Poppins throughout.

**Navigation:** About Us (6 anchors), Our Fleet, Our Business (QHSE, Operations, Sustainability, Supply Chain),
Careers, Investors (11 pages). One social account: LinkedIn.

**References.** The brief named neo-rig.com as the look and motion reference. It now redirects to
bauer-equipment.com, and its last archived copy (2021) has no styles left, so there was nothing to measure. With the
client's go-ahead to "take your own inspo", the direction comes from Borr itself: the triangle tile of the logo, the
triangle world map, and the sea in the hero film. Those set the button, the labels, the preloader, the map and the
scene colours. The one copied-interaction slot became the house button (`TriButton`, below), with its timings as
CSS variables.

## Brand

- **Palette** (no other hue anywhere, including gradients, focus rings and the share charts): Blue `#0069FF` (logo,
  29 uses in the live CSS), Abyss `#082835` (live headings and body text), Petrol `#194D60` (live secondary text),
  Foam `#F6FCFF` (live light panels), plus white. Share moves are shown with the brand triangle turned up or down,
  not red and green.
- **Type:** UI and body in Poppins, the live site's face (400 and 500, self-hosted). Display in Schibsted Grotesk
  (variable, self-hosted), used for the hero, section titles, figures and the menu. It is a Norwegian grotesk, and
  Borr was founded by Norwegians and names its rigs after Norse gods.
- **Logo:** the live site serves only a 181 x 68 PNG. The vector comes from Wikimedia Commons ("Borr Drilling
  logo.svg", taken from the company's 2021 sustainability report). `scripts/logo.py` flattens it into absolute paths
  and splits it into the 18 triangles of the mark (ordered clockwise, with centres) and the two wordmark lines,
  written to `lib/logo.ts`. It also writes `public/brand/logo-{blue,white,abyss}.svg` (transparent) and the favicon.
- **Favicon:** like the live `favicon.ico`, it is the blue mark on transparent. It is cropped tight and square around
  the ring so the triangles still read at 16px: `app/icon.svg`, plus `app/favicon.ico` (16, 32, 48) and
  `app/apple-icon.png` (180, mark on Abyss) from `scripts/icons.mjs`.
- **Photography:** the homepage's own three photographs and its film, in natural colour at 85% saturation.

## Page

| # | Section | Scene | Live items | Here | Notes |
| --- | --- | --- | --- | --- | --- |
| 1 | Hero | Abyss | film + intro block | film + intro | The live opening block is folded into the hero |
| 2 | About Borr Drilling | Abyss | photo + link | photo, vision, 2 paragraphs, 3 figures, link | The live block has no copy, so the words are the About page's own (vision, company details) |
| 3 | Global Presence | Petrol | 5 regions, 29 rigs | 5 regions, 29 rigs | Vector triangle map; choosing a region lights it and lists its rigs |
| 4 | News | White | 3 releases | 3 releases | Date, title, opening of each release; links to the live Euroland release pages |
| 5 | Join Our Team | White | photo + link | photo, Careers page line, link | |
| 6 | Sustainability | White | photo + report link | photo, strapline, 3 pillars, report link | Copy from the Sustainability page |
| 7 | Share Information | White | 2 tickers | 2 tickers with six-month charts | Snapshot from the live feed (see below) |
| 8 | Footer | White | contact, 2 legal, LinkedIn | all, plus the nav groups | Child links hidden on phones; they are all in the menu |

**Client feedback (5 October 2026):** the hero eyebrow is removed, and from News to the end the page stays white (the footer included), so the background changes only once, from the dark opening chapters to white. The sustainability photograph stays full bleed as an image band.

**Gaps:** none cut. The About block moved above Global Presence so photography leads the page (hero film, rig
photo, then the map). Release titles drop the repeated "Borr Drilling Limited -" prefix. House rule: no em or en
dashes, so "Taking Major Steps – To Protect…" reads "Taking Major Steps: To Protect…" (`undash` in `lib/content.ts`).

**Page height** (`scrollHeight`, production build, headless Chrome):

| Width | Height | Viewports |
| --- | --- | --- |
| 1440 x 900 | 6174px | 6.9 |
| 768 x 1024 | 8350px | 8.2 |
| 375 x 812 | 7567px | 9.3 |

## Systems

### Preloader (`components/Preloader.tsx`)

The mark is a ring of 18 rounded triangles, so it is built tile by tile. Each triangle turns in from the ring's
centre (a third of a turn, from nothing) and settles in place, clockwise from twelve o'clock. Then "Borr" and
"Drilling" wipe in left to right, the way every triangle points (SVG clip rects widened by GSAP). One timeline:

| Time | Stage |
| --- | --- |
| 0.08 to 0.80s | the 18 triangles turn in, 0.026s apart |
| 0.62 to 1.04s | "Borr" wipes in |
| 0.72 to 1.14s | "Drilling" wipes in |
| 1.14 to 1.30s | hold |
| 1.30 to 1.80s | the lock-up glides and scales onto the header logo while the Abyss curtain fades over the film |

The curtain is Abyss, the hero's opening colour, so nothing jumps. At 1.30s the handover runs: `is-loading` comes
off `<html>`, `data-intro="done"` is set, Lenis starts and `intro:done` is dispatched. The hero entrance waits for
that event, so the two overlap. **Measured on the production build:** handover 1.46 to 1.51s after navigation,
everything landed by about 1.96s. A wheel at 0.4s leaves `scrollY` at 0. A 2.6s failsafe finishes the timeline if the
tab is throttled. It plays once per tab session (`sessionStorage["borr-intro"]`), is `aria-hidden`, is hidden by
`<noscript>` and is skipped with reduced motion.

### Scenes (`components/Backdrop.tsx`)

There are no hard section fills. One fixed field sits behind the page, and each section declares `data-scene`
(abyss, petrol or white; the page goes Abyss, Petrol, then white from News to the footer). The field holds a scene, then blends into the next over the last 40% of a viewport,
like the sea changing with depth. `--fg` and `--fg2` follow the blended luminance at the viewport centre, and `--hfg`
(the header) follows the colour behind the header, so contrast holds mid-blend.

### Motion vocabulary (`components/Motion.tsx`)

Lenis runs on the GSAP ticker (lerp 0.1) and is synced with ScrollTrigger. Anchor links go through Lenis, and the
menu and preloader stop it. Two curves only: `borr-out` `cubic-bezier(.16,1,.3,1)` and `borr-io`
`cubic-bezier(.65,0,.35,1)` (also `--ease-out` and `--ease-io`). Every move plays once and runs at 0.75 duration inside
`[data-late]` (the last two chapters and the footer).

| Move | Markup | What it does |
| --- | --- | --- |
| Heading | `data-reveal="head"` | the whole phrase fades and rises 24px, 1.1s, out curve |
| Paragraph | `data-reveal="text"` | words rise out of a mask (`lib/split.ts`), 0.9s, 0.006s apart |
| Label or button | `data-reveal="label"` | fades and rises 12px, 0.7s |
| Cards | `data-reveal="cards"` | children reveal in ScrollTrigger batches, rise 32px, 1s, 0.08s apart |
| Image | `data-reveal="image"` | wipes open from the left (the way the triangle points), 1.3s, in-out; `data-parallax` drifts ±5% |
| Figure | `data-count` | counts up once, 1.6s |

Heavier motion is kept to the preloader and the hero (the film settling from a 1.08 zoom, the headline word by word).

### The button (`TriButton` in `components/ui.tsx`)

A pill with the brand triangle leading the label. On hover or focus:

- the Blue fill sweeps in from the left: `clip-path` inset, `var(--btn-fill)` 0.6s on `--ease-io`
- the leading triangle runs out to the right and shrinks: `var(--btn-tri)` 0.55s
- the label steps 22px left into the space it left: `var(--btn-label)` 0.55s, delayed `var(--btn-stagger)` 0.06s
- a second triangle arrives at the far end, delayed two staggers; text turns white

### Global Presence (`components/home/Presence.tsx`)

`scripts/map.py` reads the live `world_map.png` (1046 x 680) and finds its 2,195 triangles (centre and direction) as
connected shapes, written to `lib/map.ts`. The map draws them as one path. Each region pin sits in its operating
waters (North Sea, Gulf of Mexico, Gulf of Guinea, Arabian Gulf, Gulf of Thailand). Choosing a region with a click or
the keyboard (the list is buttons with `aria-expanded`) lights the triangles within 64px of its pin in Blue and lists
its rigs. The list is a polite live region.

### Share charts (`components/home/ShareChart.tsx`)

Six months of daily closes per market, drawn as one SVG path. Hover, touch or focus a chart, and a guide, a dot and a
tooltip follow the nearest trading day: date, close, and the change since the first day shown. Keyboard: arrow keys
step a day, Shift + arrow a week, Home and End jump to the ends (it is a `role="slider"` with `aria-valuetext`). The
data is the snapshot `npm run scrape` takes from the same public Euroland endpoints the live tickers call
(`GetInstrumentData`, `GetGraphHistoricalData`; NYSE instrument 112620, OSE 110261). Market cap is last price times
the feed's share count. Each card states its close date.

### Header and menu (`components/Header.tsx`)

No bar or box. The lock-up's mark stays Blue while the wordmark and links take `--hfg`. The header hides on the way
down and returns on the way up. Menu opens a full-screen Abyss panel that wipes in from the left (GSAP timeline in,
the same timeline reversed out) with the live navigation, the homepage chapters, contact and LinkedIn. Focus is
trapped, Esc closes and focus returns to the toggle (checked keyboard only).

## Private-demo settings

- `robots: noindex, nofollow, nocache` in the layout metadata. No sitemap or robots route.
- PostHog EU (`lib/posthog.ts`): key from `NEXT_PUBLIC_POSTHOG_KEY` with a literal fallback, pageview, pageleave,
  autocapture and session recording on, surveys off, `site` and UTM properties registered, `scroll_depth` fired once
  each at 25, 50, 75 and 100%.
- A capture-phase click and auxclick guard (`Motion.tsx`) keeps every outbound link on the page. The hrefs stay the
  live URLs, each opens in a new tab with `rel="noopener"`, and `scripts/check-links.mjs` checks them: 34
  destinations, all 200, every borrdrilling.com path in the live sitemap.

## Verification (4 October 2026)

- `npm run typecheck` and `npm run build` pass. Static pages: `/` and `/_not-found`, plus the icon routes.
- 375, 768 and 1440: no horizontal scroll, no broken images, no console errors (`scripts/shots.mjs`).
- Reduced motion: no preloader, no smooth scroll, every reveal target visible, the film starts paused with a Play
  control.
- No em or en dashes in the rendered text.

## Where the media came from

All from the live homepage's WordPress fields (`api.borrdrilling.com/wp-content/uploads/`): `2024/09/HP.mp4` (hero
film, re-encoded at 1600 and 960 wide, muted, with its first frame as the poster), `2024/07/home_pic_1.jpg` (About),
`home_pic_2.jpg` (Careers, the crew of the Gerd), `home_pic_3.jpg` (Sustainability) and `world_map.png` (vectorised).
The logo vector is from Wikimedia Commons, sourced from Borr's 2021 sustainability report.
