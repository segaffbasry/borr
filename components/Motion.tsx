"use client";

import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useEffect } from "react";
import { getLenis, setLenis } from "@/lib/scroll";
import { splitWords } from "@/lib/split";

gsap.registerPlugin(ScrollTrigger, CustomEase);

/* The two curves every move uses (also --ease-out and --ease-io in globals.css). There is no motion reference for this
   build (neo-rig.com now redirects to bauer-equipment.com), so they are chosen for the subject: a long, settling
   out-curve, like a hull easing onto its legs, and a symmetrical in-out for wipes and the button fill. */
CustomEase.create("borr-out", "M0,0 C0.16,1 0.3,1 1,1");
CustomEase.create("borr-io", "M0,0 C0.65,0 0.35,1 1,1");
export const EASE = "borr-out";
export const EASE_IO = "borr-io";

export const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Handover from the preloader: the hero, header and scroll wait for this.
export const INTRO_DONE = "intro:done";
export const introDone = () => document.documentElement.dataset.intro === "done";
export function onIntro(fn: () => void) {
  if (introDone()) { fn(); return () => {}; }
  window.addEventListener(INTRO_DONE, fn, { once: true });
  return () => window.removeEventListener(INTRO_DONE, fn);
}

/* Page-wide behaviour:
   - the link guard: this is a private demo, so links keep their live hrefs but never leave the page;
     "#" links scroll through Lenis instead
   - Lenis on the GSAP ticker, synced with ScrollTrigger, stopped while the preloader plays
   - the reveal vocabulary, declared in markup with data-reveal (see the table in README.md):
       head   a heading: the whole phrase fades and rises once
       text   a paragraph: its words rise out of a mask, a few thousandths of a second apart
       label  labels and buttons: a short fade and rise
       cards  a list: its children reveal in batches as they arrive
       image  a frame that wipes open from the left, the way the brand triangle points; an <img data-parallax>
              inside drifts about 10%
     Anything inside [data-late] (the last chapters) plays at 0.75 of the duration. */
export function Motion() {
  useEffect(() => {
    const guard = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]");
      if (!a) return;
      const href = a.getAttribute("href") ?? "";
      e.preventDefault();
      if (!href.startsWith("#")) return;
      const target = href === "#top" ? 0 : document.querySelector<HTMLElement>(href);
      if (target === null) return;
      const lenis = getLenis();
      // A link inside the menu fires while the menu still has Lenis stopped; start() first (it resets any running
      // scroll), so the menu's own start() on close is a no-op and this scroll survives.
      if (lenis) { lenis.start(); lenis.scrollTo(target as HTMLElement | number, { duration: 1.4 }); }
      else if (typeof target === "number") window.scrollTo({ top: 0 });
      else target.scrollIntoView();
      if (typeof target !== "number") target.focus?.({ preventScroll: true });
    };
    document.addEventListener("click", guard, true);
    document.addEventListener("auxclick", guard, true);
    const unguard = () => { document.removeEventListener("click", guard, true); document.removeEventListener("auxclick", guard, true); };

    if (reducedMotion()) return unguard;

    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
    setLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    if (document.documentElement.classList.contains("is-loading")) lenis.stop();

    const ctx = gsap.context(() => {
      const pace = (el: Element) => (el.closest("[data-late]") ? 0.75 : 1);
      const once = (el: Element, start = "top 88%") => ({ trigger: el, start, once: true });

      gsap.utils.toArray<HTMLElement>('[data-reveal="head"]').forEach((el) => {
        gsap.fromTo(el, { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.1 * pace(el), ease: EASE, scrollTrigger: once(el) });
      });

      gsap.utils.toArray<HTMLElement>('[data-reveal="text"]').forEach((el) => {
        const words = splitWords(el);
        gsap.set(el, { autoAlpha: 1 });
        gsap.fromTo(words, { yPercent: 105 }, { yPercent: 0, duration: 0.9 * pace(el), ease: EASE, stagger: 0.006, scrollTrigger: once(el) });
      });

      gsap.utils.toArray<HTMLElement>('[data-reveal="label"]').forEach((el) => {
        gsap.fromTo(el, { y: 12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7 * pace(el), ease: EASE, scrollTrigger: once(el, "top 94%") });
      });

      gsap.utils.toArray<HTMLElement>('[data-reveal="cards"]').forEach((list) => {
        const items = Array.from(list.children) as HTMLElement[];
        gsap.set(list, { autoAlpha: 1 });
        gsap.set(items, { y: 32, autoAlpha: 0 });
        ScrollTrigger.batch(items, {
          start: "top 92%", once: true,
          onEnter: (batch) => gsap.to(batch, { y: 0, autoAlpha: 1, duration: 1 * pace(list), ease: EASE, stagger: 0.08 }),
        });
      });

      gsap.utils.toArray<HTMLElement>('[data-reveal="image"]').forEach((el) => {
        gsap.fromTo(el, { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.3 * pace(el), ease: EASE_IO, scrollTrigger: once(el, "top 85%") });
      });

      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((img) => {
        gsap.fromTo(img, { yPercent: -5, scale: 1.12 }, {
          yPercent: 5, scale: 1.12, ease: "none",
          scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
        const to = Number(el.dataset.count);
        const box = { v: 0 };
        el.textContent = "0";
        gsap.to(box, { v: to, duration: 1.6 * pace(el), ease: EASE, scrollTrigger: once(el), onUpdate: () => { el.textContent = String(Math.round(box.v)); } });
      });
    });
    document.documentElement.classList.add("motion-ready");

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    document.fonts?.ready.then(refresh);

    return () => {
      unguard();
      window.removeEventListener("load", refresh);
      ctx.revert();
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, []);
  return null;
}
