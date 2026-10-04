import { Backdrop } from "@/components/Backdrop";
import { Header } from "@/components/Header";
import { Logo } from "@/components/Logo";
import { Motion } from "@/components/Motion";
import { Preloader } from "@/components/Preloader";
import { Hero } from "@/components/home/Hero";
import { Presence } from "@/components/home/Presence";
import { Shares } from "@/components/home/Shares";
import { Icon, Label, Tri, TriButton } from "@/components/ui";
import { about, careers, contact, footer, nav, news, socials, sustainability } from "@/lib/content";

/* borrdrilling.com's homepage in a new skin. Every live block is here in its live order (film, intro, presence, news,
   about, careers, sustainability, share information), with the intro folded into the hero and the About block moved
   up so the photography leads. The page sits on one fixed field that changes depth as you scroll (Backdrop).
   Copy: lib/content.ts. Systems: README.md. */
export default function Home() {
  return (
    <>
      <Motion />
      <Backdrop />
      <Preloader />
      <a className="skip-link" href="#main">Skip to content</a>
      <div id="top" />
      <Header />
      <main id="main" tabIndex={-1}>
        <Hero />

        {/* About Borr Drilling: the live block's rig photograph, with the About page's vision, words and figures. */}
        <section className="about section" id="about" data-scene="abyss" aria-labelledby="about-title" tabIndex={-1}>
          <div className="wrap about-grid">
            <figure className="about-media frame" data-reveal="image">
              <picture>
                <source media="(max-width: 767px)" srcSet={about.image.small} />
                <img src={about.image.src} alt={about.image.alt} width={1600} height={1110} loading="lazy" data-parallax />
              </picture>
            </figure>
            <div className="about-copy">
              <Label as="h2" id="about-title">{about.title}</Label>
              <p className="about-vision h2" data-reveal="head">{about.vision}</p>
              {about.text.map((t) => <p key={t.slice(0, 20)} className="body" data-reveal="text">{t}</p>)}
              <div data-reveal="label"><TriButton href={about.cta.href}>{about.cta.label}</TriButton></div>
            </div>
          </div>
          <dl className="wrap facts" data-reveal="cards">
            {about.facts.map((f) => (
              <div key={f.label} className="fact">
                <dt>{f.label}</dt>
                <dd aria-label={`${f.value}${f.suffix}`}><span data-count={f.value} aria-hidden="true">{f.value}</span><span aria-hidden="true">{f.suffix}</span></dd>
              </div>
            ))}
          </dl>
        </section>

        <Presence />

        {/* News: the releases the live homepage lists, newest first. */}
        <section className="news section" id="news" data-scene="foam" aria-labelledby="news-title" tabIndex={-1}>
          <div className="wrap">
            <div className="row-head">
              <div>
                <Label>Press releases</Label>
                <h2 id="news-title" className="h2" data-reveal="head">{news.title}</h2>
              </div>
              <div data-reveal="label"><TriButton href={news.cta.href}>{news.cta.label}</TriButton></div>
            </div>
            <ul className="news-list" data-reveal="cards">
              {news.items.map((n) => (
                <li key={n.href} className="news-item">
                  <a href={n.href} target="_blank" rel="noopener">
                    <time className="news-date">{n.date}</time>
                    <span className="news-title">{n.title}</span>
                    <span className="news-text">{n.text}</span>
                    <span className="more">Read more<span className="sr-only"> about {n.title}</span><Icon name="arrow" /></span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Join Our Team: the live block's crew photograph (the Gerd's helideck) with the Careers page's opening line. */}
        <section className="careers section" id="careers" data-scene="foam" aria-labelledby="careers-title" tabIndex={-1}>
          <div className="wrap careers-grid">
            <div className="careers-copy">
              <Label>{careers.quote}</Label>
              <h2 id="careers-title" className="h2" data-reveal="head">{careers.title}</h2>
              <p className="body" data-reveal="text">{careers.text}</p>
              <div data-reveal="label"><TriButton href={careers.cta.href}>{careers.cta.label}</TriButton></div>
            </div>
            <figure className="careers-media frame" data-reveal="image">
              <picture>
                <source media="(max-width: 767px)" srcSet={careers.image.small} />
                <img src={careers.image.src} alt={careers.image.alt} width={1600} height={1110} loading="lazy" data-parallax />
              </picture>
            </figure>
          </div>
        </section>

        {/* Sustainability: the live block's aerial photograph full bleed under its title, then the strategy's three pillars. */}
        <section className="sust" id="sustainability" data-scene="abyss" data-late aria-labelledby="sust-title" tabIndex={-1}>
          <figure className="sust-media" data-reveal="image">
            <picture>
              <source media="(max-width: 767px)" srcSet={sustainability.image.small} />
              <img src={sustainability.image.src} alt={sustainability.image.alt} width={1600} height={1110} loading="lazy" data-parallax />
            </picture>
            <div className="sust-shade" aria-hidden="true" />
            <div className="wrap sust-over">
              <Label>{sustainability.strap}</Label>
              <h2 id="sust-title" className="h2 sust-title" data-reveal="head">{sustainability.title}</h2>
            </div>
          </figure>
          <div className="wrap sust-body section">
            <p className="body sust-text" data-reveal="text">{sustainability.text}</p>
            <ul className="pillars" data-reveal="cards">
              {sustainability.pillars.map((p) => <li key={p}><Tri />{p}</li>)}
            </ul>
            <div className="sust-cta" data-reveal="label"><TriButton href={sustainability.cta.href}>{sustainability.cta.label}</TriButton></div>
          </div>
        </section>

        <Shares />
      </main>

      <footer className="site-footer" id="contact" data-scene="abyss" data-late tabIndex={-1}>
        <div className="wrap">
          <div className="footer-top">
            <a className="footer-cta" href={contact.href} target="_blank" rel="noopener">
              <span>{contact.title}</span><Icon name="arrow" />
            </a>
            <ul className="footer-icons">
              <li><a href={contact.offices.href} aria-label={contact.offices.label} target="_blank" rel="noopener"><Icon name="pin" /></a></li>
              {socials.map((s) => <li key={s.name}><a href={s.href} aria-label={s.name} target="_blank" rel="noopener"><Icon name={s.icon} /></a></li>)}
            </ul>
          </div>
          <div className="footer-grid">
            <a href="#top" className="footer-logo" aria-label="Borr Drilling, back to the top"><Logo title="" /></a>
            {nav.filter((g) => g.children.length).map((g) => (
              <nav key={g.label} aria-label={g.label}>
                <h2 className="footer-head"><a href={g.href} target="_blank" rel="noopener">{g.label}</a></h2>
                <ul className="footer-list">{g.children.map((l) => <li key={l.label}><a href={l.href} target="_blank" rel="noopener">{l.label}</a></li>)}</ul>
              </nav>
            ))}
            <nav aria-label="More">
              {nav.filter((g) => !g.children.length).map((g) => (
                <h2 key={g.label} className="footer-head"><a href={g.href} target="_blank" rel="noopener">{g.label}</a></h2>
              ))}
            </nav>
          </div>
          <div className="footer-bar">
            <p>{footer.copyright}</p>
            <ul>{footer.legal.map((l) => <li key={l.label}><a href={l.href} target="_blank" rel="noopener">{l.label}</a></li>)}</ul>
          </div>
        </div>
      </footer>
    </>
  );
}
