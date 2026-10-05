"use client";

import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { EASE, EASE_IO, onIntro, reducedMotion } from "@/components/Motion";
import { Icon, TriButton } from "@/components/ui";
import { hero } from "@/lib/content";
import { splitWords } from "@/lib/split";

/* The live home film (HP.mp4) full bleed, with the homepage's opening block set low on the left. The entrance waits
   for the preloader's handover: the film settles from a slight zoom as the curtain clears, the headline's words rise
   one after another (per-word motion is kept to the hero), then the copy and button follow. The film is muted,
   loops, pauses when it leaves the screen and has its own pause control; its first frame is the poster. */
export function Hero() {
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const userPaused = useRef(false);

  useEffect(() => {
    const el = root.current, v = video.current; if (!el || !v) return;
    if (reducedMotion()) { v.pause(); v.removeAttribute("autoplay"); setPaused(true); userPaused.current = true; }

    // Off-screen, the film stops; back on screen it resumes unless the visitor paused it.
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !userPaused.current) v.play().catch(() => {});
      else if (!e.isIntersecting) v.pause();
    }, { threshold: 0.05 });
    io.observe(el);

    if (reducedMotion()) return () => io.disconnect();
    const words = splitWords(el.querySelector<HTMLElement>(".hero-title")!);
    const rest = el.querySelectorAll("[data-hero-in]");
    gsap.set(words, { yPercent: 110 });
    gsap.set(rest, { y: 18, autoAlpha: 0 });
    gsap.set(el.querySelector(".hero-film"), { scale: 1.08 });
    const off = onIntro(() => {
      gsap.timeline()
        .to(el.querySelector(".hero-film"), { scale: 1, duration: 1.8, ease: EASE }, 0)
        .to(words, { yPercent: 0, duration: 1, ease: EASE, stagger: 0.07 }, 0.15)
        .to(rest, { y: 0, autoAlpha: 1, duration: 0.9, ease: EASE, stagger: 0.09 }, 0.45)
        .fromTo(el.querySelector(".hero-shade"), { opacity: 0.4 }, { opacity: 1, duration: 1.2, ease: EASE_IO }, 0);
    });
    return () => { off(); io.disconnect(); };
  }, []);

  const toggle = () => {
    const v = video.current; if (!v) return;
    if (v.paused) { userPaused.current = false; v.play().catch(() => {}); setPaused(false); }
    else { userPaused.current = true; v.pause(); setPaused(true); }
  };

  return (
    <section className="hero" ref={root} data-scene="abyss" aria-labelledby="hero-title">
      <div className="hero-media" aria-hidden="true">
        <video ref={video} className="hero-film" autoPlay muted loop playsInline preload="auto" poster={hero.video.poster}>
          <source src={hero.video.small} type="video/mp4" media="(max-width: 767px)" />
          <source src={hero.video.src} type="video/mp4" />
        </video>
        <div className="hero-shade" />
      </div>
      <div className="wrap hero-inner">
        <div className="hero-copy">
          <h1 id="hero-title" className="hero-title">{hero.title}</h1>
          <p className="hero-text" data-hero-in>{hero.text}</p>
          <div data-hero-in><TriButton href={hero.cta.href}>{hero.cta.label}</TriButton></div>
        </div>
        <button className="film-toggle" type="button" onClick={toggle} aria-pressed={paused} data-hero-in>
          <Icon name={paused ? "play" : "pause"} />
          <span>{paused ? "Play film" : "Pause film"}</span>
        </button>
      </div>
    </section>
  );
}
