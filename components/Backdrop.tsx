"use client";

import gsap from "gsap";
import { useEffect } from "react";

/* One fixed field behind the whole page, like the sea changing colour with depth. Each section names a scene
   (data-scene); every frame the field blends from the scene under the viewport centre into the next one as it
   approaches. Text and header colours come from the blended luminance, so contrast never breaks mid-blend:
   --fg / --fg2 for the page (sampled at the centre), --hfg for the header (sampled behind it).
   Palette only: Abyss #082835, Petrol #194D60, Foam #F6FCFF, white. */
const ABYSS = [8, 40, 53], PETROL = [25, 77, 96], FOAM = [246, 252, 255], WHITE = [255, 255, 255];
const scenes: Record<string, number[]> = { abyss: ABYSS, petrol: PETROL, foam: FOAM, white: WHITE };

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const smooth = (v: number) => { const t = clamp(v); return t * t * (3 - 2 * t); };
const lum = (c: number[]) => (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255;
const mix = (a: number[], b: number[], t: number) => a.map((v, i) => v + (b[i] - v) * t);
const rgb = (c: number[]) => c.map(Math.round).join(" ");

export function Backdrop() {
  useEffect(() => {
    const style = document.documentElement.style;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let anchors: { top: number; c: number[] }[] = [];
    let lastY = -1, lastH = -1;

    const measure = () => {
      anchors = Array.from(document.querySelectorAll<HTMLElement>("[data-scene]"))
        .map((el) => ({ top: el.getBoundingClientRect().top + window.scrollY, c: scenes[el.dataset.scene ?? "abyss"] ?? ABYSS }))
        .sort((a, b) => a.top - b.top);
      lastY = -1;
    };

    // The field at a page offset: hold a scene, then blend over the last 40% of a viewport before the next one.
    const at = (focus: number, h: number) => {
      let i = 0;
      while (i < anchors.length - 1 && focus >= anchors[i + 1].top) i++;
      const from = anchors[i].c, next = anchors[i + 1];
      if (!next) return from;
      const t = reduced ? (focus > next.top - h * 0.1 ? 1 : 0) : smooth((focus - (next.top - h * 0.4)) / (h * 0.4));
      return mix(from, next.c, t);
    };

    const render = () => {
      const y = window.scrollY, h = window.innerHeight;
      if (y === lastY && h === lastH) return;
      lastY = y; lastH = h;
      if (!anchors.length) return;
      const bg = at(y + h * 0.5, h), head = at(y + 40, h);
      // 0 on dark scenes, 1 on light ones; the switch sits between Petrol (0.06) and Foam (0.98) luminance.
      const tone = smooth((lum(bg) - 0.3) / 0.3), htone = smooth((lum(head) - 0.3) / 0.3);
      style.setProperty("--bg", rgb(bg));
      style.setProperty("--fg", rgb(mix(WHITE, ABYSS, tone)));
      style.setProperty("--fg2", rgb(mix(mix(FOAM, PETROL, 0.18), PETROL, tone)));
      style.setProperty("--tone", tone.toFixed(3));
      style.setProperty("--hfg", rgb(mix(WHITE, ABYSS, htone)));
    };

    const resize = new ResizeObserver(() => { measure(); render(); });
    resize.observe(document.body);
    gsap.ticker.add(render);
    measure(); render();
    return () => { resize.disconnect(); gsap.ticker.remove(render); };
  }, []);

  return <div className="backdrop" aria-hidden="true" />;
}
