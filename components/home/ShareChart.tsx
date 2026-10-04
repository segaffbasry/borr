"use client";

import { useRef, useState } from "react";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
// Timestamps are the trading day at 00:00 UTC, so they are read in UTC to keep the right date.
const day = (ts: number) => { const d = new Date(ts * 1000); return `${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`; };
const money = (n: number) => n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* Six months of closing prices as one SVG line (no chart library). Hover, touch or focus it and a guide, a dot and a
   tooltip follow the nearest trading day, showing its date, close and the move since the first day shown. Keyboard:
   arrow keys step a day, Shift + arrow a week, Home and End jump to the ends. The guide and dot are HTML so they keep
   their shape while the SVG stretches to the card. */
export function ShareChart({ points, currency, label }: { points: number[][]; currency: string; label: string }) {
  const W = 560, H = 140, P = 6;
  const vals = points.map((p) => p[1]);
  const min = Math.min(...vals), max = Math.max(...vals);
  const fx = (i: number) => (P + (i / (points.length - 1)) * (W - 2 * P)) / W; // 0..1 across
  const fy = (v: number) => (P + (1 - (v - min) / (max - min || 1)) * (H - 2 * P)) / H; // 0..1 down
  const line = points.map((p, i) => `${i ? "L" : "M"}${(fx(i) * W).toFixed(1)} ${(fy(p[1]) * H).toFixed(1)}`).join("");
  const last = points.length - 1;

  const box = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const at = (clientX: number) => {
    const r = box.current!.getBoundingClientRect();
    const t = (clientX - r.left) / r.width;
    return Math.max(0, Math.min(last, Math.round(((t * W - P) / (W - 2 * P)) * last)));
  };
  const onKey = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 5 : 1, cur = active ?? last;
    const next = e.key === "ArrowLeft" ? cur - step : e.key === "ArrowRight" ? cur + step : e.key === "Home" ? 0 : e.key === "End" ? last : null;
    if (next === null) return;
    e.preventDefault();
    setActive(Math.max(0, Math.min(last, next)));
  };

  const i = active ?? last;
  const v = points[i][1], diff = v - points[0][1], pct = (diff / points[0][1]) * 100;
  const x = fx(i) * 100, y = fy(v) * 100;

  return (
    <div
      ref={box}
      className={`chart${active !== null ? " is-active" : ""}`}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={last}
      aria-valuenow={i}
      aria-valuetext={`${day(points[i][0])}: ${currency} ${money(v)}`}
      onPointerMove={(e) => setActive(at(e.clientX))}
      onPointerDown={(e) => setActive(at(e.clientX))}
      onPointerLeave={() => setActive(null)}
      onBlur={() => setActive(null)}
      onKeyDown={onKey}
    >
      <div className="chart-plot">
        <svg className="spark" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
          <path className="spark-area" d={`${line}L${fx(last) * W} ${H}L${fx(0) * W} ${H}Z`} />
          <path className="spark-line" d={line} vectorEffect="non-scaling-stroke" />
        </svg>
        <span className="chart-guide" style={{ left: `${x}%` }} aria-hidden="true" />
        <span className="chart-dot" style={{ left: `${x}%`, top: `${y}%` }} aria-hidden="true" />
        <span className={`chart-tip${x > 70 ? " is-left" : ""}`} style={{ left: `${x}%`, top: `${y}%` }} aria-hidden="true">
          <span className="chart-tip-date">{day(points[i][0])}</span>
          <span className="chart-tip-value">{currency} {money(v)}</span>
          <span className="chart-tip-diff">{diff >= 0 ? "+" : ""}{pct.toFixed(1)}% since {day(points[0][0])}</span>
        </span>
      </div>
      <span className="chart-axis" aria-hidden="true"><span>{day(points[0][0])}</span><span>{day(points[last][0])}</span></span>
    </div>
  );
}
