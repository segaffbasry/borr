"use client";

import gsap from "gsap";
import { useEffect, useRef } from "react";
import { Logo } from "@/components/Logo";
import { EASE, EASE_IO, INTRO_DONE, reducedMotion } from "@/components/Motion";
import { LOGO_W, MARK, MARK_CENTRE, MARK_W } from "@/lib/logo";
import { getLenis } from "@/lib/scroll";

/* The company signing its name. Borr's mark is a ring of 18 rounded triangles, so it is built tile by tile: each
   triangle turns in from the ring's centre and settles in its place, clockwise from twelve o'clock, like a drill
   string's rotation setting the pattern. Then "Borr" and "Drilling" wipe in beside it, left to right, the way every
   triangle points. After a short hold the lock-up glides onto the header logo while the Abyss curtain (the hero's
   opening colour) fades away over the film. One timeline, about 1.8s:
     0.08 to 0.80  the 18 triangles turn in, 0.026s apart
     0.62 to 1.04  "Borr" wipes in
     0.72 to 1.14  "Drilling" wipes in
     1.14 to 1.30  hold
     1.30 to 1.80  exit: lock-up to the header, curtain fades; handover fires at 1.30 so the hero entrance overlaps
   Once per tab session (sessionStorage "borr-intro"); skipped with reduced motion; hidden without JavaScript. */
export function Preloader() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    const el = root.current;
    let handed = false;
    const handover = () => {
      if (handed) return; handed = true;
      html.classList.remove("is-loading");
      html.dataset.intro = "done";
      try { sessionStorage.setItem("borr-intro", "1"); } catch {}
      getLenis()?.start();
      window.dispatchEvent(new Event(INTRO_DONE));
    };
    if (!el || !html.classList.contains("is-loading") || reducedMotion()) {
      if (el) el.style.display = "none";
      html.classList.add("logo-landed");
      handover();
      return;
    }
    window.scrollTo(0, 0);
    const mark = el.querySelector<HTMLElement>(".preloader-mark")!;
    const tris = Array.from(el.querySelectorAll<SVGPathElement>('[data-part="tri"]'));
    const target = document.querySelector<HTMLElement>(".header-logo .logo");
    const flight = () => {
      if (!target) return { x: 0, y: -40, scale: 0.4 };
      const a = mark.getBoundingClientRect(), b = target.getBoundingClientRect();
      return { x: b.left + b.width / 2 - (a.left + a.width / 2), y: b.top + b.height / 2 - (a.top + a.height / 2), scale: b.width / a.width };
    };

    // Each triangle starts at the ring's centre, turned back a third of a turn and shrunk to nothing.
    tris.forEach((t, i) => {
      const m = MARK[i];
      gsap.set(t, { svgOrigin: `${m.cx} ${m.cy}`, x: (MARK_CENTRE[0] - m.cx) * 0.55, y: (MARK_CENTRE[1] - m.cy) * 0.55, rotation: -120, scale: 0, opacity: 0 });
    });

    const tl = gsap.timeline({ onComplete: () => { el.classList.remove("is-active"); el.style.display = "none"; html.classList.add("logo-landed"); } });
    tl.add(() => el.classList.add("is-active"), 0)
      .to(tris, { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1, duration: 0.34, ease: EASE, stagger: 0.026 }, 0.08)
      .to(el.querySelector('[data-part="wipe-borr"]'), { attr: { width: LOGO_W - MARK_W }, duration: 0.42, ease: EASE_IO }, 0.62)
      .to(el.querySelector('[data-part="wipe-drilling"]'), { attr: { width: LOGO_W - MARK_W }, duration: 0.42, ease: EASE_IO }, 0.72)
      .add(handover, 1.3)
      // Measured when the exit starts (tweens initialise lazily), so late layout shifts are accounted for.
      .to(mark, { x: () => flight().x, y: () => flight().y, scale: () => flight().scale, duration: 0.5, ease: EASE_IO }, 1.3)
      .to(el.querySelector(".preloader-curtain"), { autoAlpha: 0, duration: 0.45, ease: "none" }, 1.32);

    // Never hold the page for long: if the tab was hidden or throttled, finish anyway.
    const failsafe = window.setTimeout(() => { tl.progress(1); }, 2600);
    return () => { window.clearTimeout(failsafe); tl.kill(); };
  }, []);

  return (
    <div className="preloader" ref={root} aria-hidden="true">
      <div className="preloader-curtain" />
      <div className="preloader-mark"><Logo title="" build="pl" /></div>
    </div>
  );
}
