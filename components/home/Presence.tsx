"use client";

import { useId, useMemo, useState } from "react";
import { Label, MoreLink, Tri } from "@/components/ui";
import { presence } from "@/lib/content";
import { MAP_H, MAP_POINTS, MAP_W } from "@/lib/map";

// One triangle of the map, pointing the way the live map's does, rounded to whole pixels to keep the markup light.
const tri = (x: number, y: number, d: number) => {
  const a = Math.round(x - 3.6 * d), b = Math.round(x + 4 * d), t = Math.round(y - 4), m = Math.round(y), u = Math.round(y + 4);
  return `M${a} ${t}L${b} ${m}L${a} ${u}Z`;
};
const LIT_R = 64; // triangles within this distance of a region's pin light up in Borr blue

/* Global Presence: the live site's triangle world map, rebuilt as vector (scripts/map.py) so a region can light up.
   Each of the five live regions has a pin with its live rig count; choosing a region (click, or keyboard: the list is
   a set of buttons) lights the sea around its pin and lists its rigs by name. "All Rigs" goes to the live fleet page. */
export function Presence() {
  const [active, setActive] = useState(0);
  const uid = useId();
  const base = useMemo(() => MAP_POINTS.map(([x, y, d]) => tri(x, y, d)).join(""), []);
  const lit = useMemo(() => presence.regions.map(({ pin: [px, py] }) =>
    MAP_POINTS.filter(([x, y]) => Math.hypot(x - px, y - py) < LIT_R).map(([x, y, d]) => tri(x, y, d)).join("")), []);
  const total = presence.regions.reduce((n, r) => n + r.count, 0);
  const region = presence.regions[active];

  return (
    <section className="presence section" id="presence" data-scene="petrol" aria-labelledby="presence-title" tabIndex={-1}>
      <div className="wrap">
        <div className="presence-head">
          <div>
            <Label>{total} rigs, five regions</Label>
            <h2 id="presence-title" className="h2" data-reveal="head">{presence.title}</h2>
          </div>
          <p className="presence-text" data-reveal="text">{presence.text}</p>
        </div>
        <div className="presence-grid">
          <figure className="presence-map" data-reveal="image">
            <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} role="img" aria-label={`World map with ${total} Borr Drilling rigs across five regions`}>
              <path className="map-base" d={base} />
              {lit.map((d, i) => <path key={i} className={`map-lit${i === active ? " is-on" : ""}`} d={d} />)}
              {presence.regions.map((r, i) => (
                <g key={r.id} className={`map-pin${i === active ? " is-on" : ""}`} transform={`translate(${r.pin[0]} ${r.pin[1]})`} onClick={() => setActive(i)} aria-hidden="true">
                  <circle r="19" />
                  <text y="1" dominantBaseline="middle" textAnchor="middle">{r.count}</text>
                </g>
              ))}
            </svg>
          </figure>
          <div className="presence-list">
            <ul role="list">
              {presence.regions.map((r, i) => (
                <li key={r.id} className={i === active ? "is-on" : undefined}>
                  <button type="button" aria-expanded={i === active} aria-controls={`${uid}-rigs`} onClick={() => setActive(i)}>
                    <span className="region-count">{r.count}</span>
                    <span className="region-name">{r.region}</span>
                    <Tri />
                  </button>
                </li>
              ))}
            </ul>
            <div className="presence-rigs" id={`${uid}-rigs`} aria-live="polite">
              <p className="label">Rigs in {region.region}</p>
              <ul key={region.id} className="rig-names">{region.rigs.map((n, i) => <li key={n} style={{ "--i": i } as React.CSSProperties}>{n}</li>)}</ul>
              <MoreLink href={presence.cta.href} sr="in the Borr Drilling fleet">{presence.cta.label}</MoreLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
