import { LOGO_H, LOGO_W, MARK, MARK_W, WORD_BORR, WORD_DRILLING } from "@/lib/logo";

/* Borr Drilling's lock-up from its own vector shapes (lib/logo.ts). The 18 triangles of the mark are always Borr
   blue; the wordmark takes currentColor so it can follow the scene. Every part carries data-part so the preloader
   can build it: "tri" (in clockwise order, data-i), "borr" and "drilling". */
export function Logo({ title = "Borr Drilling", markOnly = false, build, className }: { title?: string; markOnly?: boolean; build?: string; className?: string }) {
  const w = markOnly ? MARK_W : LOGO_W;
  return (
    <svg className={`logo ${className ?? ""}`} viewBox={`0 0 ${w} ${LOGO_H}`} role={title ? "img" : undefined} aria-hidden={title ? undefined : true} focusable="false">
      {title && <title>{title}</title>}
      <g className="logo-mark">
        {MARK.map((t, i) => <path key={i} d={t.d} data-part="tri" data-i={i} />)}
      </g>
      {/* With `build` (an id prefix), each wordmark line sits behind its own clip rect that the preloader widens. */}
      {build && (
        <defs>
          <clipPath id={`${build}-borr`}><rect data-part="wipe-borr" x={MARK_W} y="0" width="0" height={LOGO_H / 2} /></clipPath>
          <clipPath id={`${build}-drilling`}><rect data-part="wipe-drilling" x={MARK_W} y={LOGO_H / 2} width="0" height={LOGO_H / 2} /></clipPath>
        </defs>
      )}
      {!markOnly && (
        <g className="logo-word">
          <g data-part="borr" clipPath={build ? `url(#${build}-borr)` : undefined}>{WORD_BORR.map((d, i) => <path key={i} d={d} />)}</g>
          <g data-part="drilling" clipPath={build ? `url(#${build}-drilling)` : undefined}>{WORD_DRILLING.map((d, i) => <path key={i} d={d} />)}</g>
        </g>
      )}
    </svg>
  );
}
