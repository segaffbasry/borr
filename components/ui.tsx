import type { ReactNode } from "react";
import { brandIcons } from "@/lib/brand-icons";

const glyphs = {
  arrow: <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />,
  out: <path d="M8 16 16 8M9 8h7v7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />,
  play: <path d="M8 5.5v13l11-6.5z" fill="currentColor" />,
  pause: <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor" />,
  pin: <g fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z" /><circle cx="12" cy="10" r="2.3" /></g>,
};

export type IconName = keyof typeof glyphs | keyof typeof brandIcons;

export function Icon({ name, className }: { name: IconName; className?: string }) {
  const brand = (brandIcons as Record<string, string>)[name];
  return (
    <svg className={`icon ${className ?? ""}`} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {brand ? <path d={brand} fill="currentColor" /> : glyphs[name as keyof typeof glyphs]}
    </svg>
  );
}

/* The brand triangle on its own: one tile of the logo's ring (rounded corners, pointing right), drawn in a 12 x 14 box. */
export function Tri({ className }: { className?: string }) {
  return (
    <svg className={`tri ${className ?? ""}`} viewBox="0 0 12 14" aria-hidden="true" focusable="false">
      <path d="M1 2.2C1 1.3 2 .7 2.8 1.2l7.6 4.6c.8.5.8 1.6 0 2.1l-7.6 4.6C2 13 1 12.4 1 11.5z" fill="currentColor" />
    </svg>
  );
}

/* The signature interaction (see README: "The button"). A pill with the brand triangle leading the label. On hover or
   focus the Borr blue fill sweeps across from the left (clip-path, 0.6s --ease-io), the leading triangle runs out to the
   right while a second one arrives at the far end, and the label steps left into the space it left, so the pill reads
   as "go". All timings and curves are CSS variables in globals.css (--btn-*). */
export function TriButton({ href, children, className, external = true }: { href: string; children: ReactNode; className?: string; external?: boolean }) {
  return (
    <a href={href} className={`tbtn ${className ?? ""}`} {...(external && !href.startsWith("#") ? { target: "_blank", rel: "noopener" } : {})}>
      <span className="tbtn-fill" aria-hidden="true" />
      <Tri className="tbtn-tri tbtn-tri-a" />
      <span className="tbtn-label">{children}</span>
      <Tri className="tbtn-tri tbtn-tri-b" />
    </a>
  );
}

/* A small label: the brand triangle and a short uppercase line. */
export function Label({ children, className, as: Tag = "p", reveal = true, id }: { children: ReactNode; className?: string; as?: "p" | "span" | "h2" | "h3"; reveal?: boolean; id?: string }) {
  return <Tag id={id} className={`label ${className ?? ""}`} {...(reveal ? { "data-reveal": "label" } : {})}><Tri />{children}</Tag>;
}

/* A text link with an arrow that slides on hover; used inside cards and lists. */
export function MoreLink({ href, children, sr }: { href: string; children: ReactNode; sr?: string }) {
  return (
    <a className="more" href={href} target="_blank" rel="noopener">
      {children}{sr && <span className="sr-only"> {sr}</span>}<Icon name="arrow" />
    </a>
  );
}
