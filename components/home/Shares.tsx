import { ShareChart } from "@/components/home/ShareChart";
import { Label, Tri, TriButton } from "@/components/ui";
import { shares } from "@/lib/content";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
// The feed stamps local exchange time with a "Z", so the date is read as written rather than converted.
const day = (iso: string) => { const [y, m, d] = iso.slice(0, 10).split("-").map(Number); return `${d} ${months[m - 1]} ${y}`; };
const money = (n: number) => n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const big = (n: number) => (n >= 1e9 ? `${(n / 1e9).toFixed(2)}bn` : `${(n / 1e6).toFixed(0)}m`);

/* Share Information: the two live tickers (NYSE in USD and Euronext Oslo Børs in NOK) as quiet cards. The figures are
   the snapshot `npm run scrape` took from the same feed the live tickers read; the date on each card says when. Up and
   down are shown with the brand triangle turned, so the palette never needs a red or a green. */
export function Shares() {
  return (
    <section className="shares section" id="shares" data-scene="white" data-late aria-labelledby="shares-title" tabIndex={-1}>
      <div className="wrap">
        <div className="row-head">
          <div>
            <Label>NYSE and OSE: BORR</Label>
            <h2 id="shares-title" className="h2" data-reveal="head">{shares.title}</h2>
          </div>
          <div data-reveal="label"><TriButton href={shares.cta.href}>{shares.cta.label}</TriButton></div>
        </div>
        <ul className="markets" data-reveal="cards">
          {shares.markets.map((m) => {
            const up = m.change >= 0;
            const first = m.history[0][1];
            return (
              <li key={m.id} className="market">
                <div className="market-top">
                  <p className="market-name"><strong>{m.short}</strong> {m.name}</p>
                  <p className="market-date">Close {day(m.date)}</p>
                </div>
                <p className="market-price"><span className="market-ccy">{m.currency}</span> {money(m.last)}</p>
                <p className={`market-change ${up ? "is-up" : "is-down"}`}>
                  <Tri className={up ? "tri-up" : "tri-down"} />
                  {up ? "+" : ""}{money(m.change)} ({up ? "+" : ""}{m.changePct.toFixed(2)}%)
                  <span className="sr-only">{up ? " up" : " down"} on the day</span>
                </p>
                <ShareChart points={m.history} currency={m.currency} label={`${m.short} closing prices over six months, from ${m.currency} ${money(first)} to ${money(m.last)}. Use the arrow keys to read each day.`} />
                <dl className="market-stats">
                  <div><dt>High</dt><dd>{money(m.high)}</dd></div>
                  <div><dt>Low</dt><dd>{money(m.low)}</dd></div>
                  <div><dt>Volume</dt><dd>{m.volume.toLocaleString("en-GB")}</dd></div>
                  <div><dt>Market cap</dt><dd>{m.currency} {big(m.last * m.shares)}</dd></div>
                </dl>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
