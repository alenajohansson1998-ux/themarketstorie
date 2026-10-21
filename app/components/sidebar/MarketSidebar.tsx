import { TradingViewOverview, TradingViewMini } from "./TradingViewWidgets";
import PolygonTickers from "./PolygonTickers";
import GainersLosers from "./GainersLosers";

export default function MarketSidebar() {
  return (
    <aside className="w-full space-y-5" aria-label="Market data">
      <h2 className="text-headline text-ink">Markets</h2>
      <TradingViewOverview />
      <TradingViewMini symbol="NASDAQ:NVDA" />
      <TradingViewMini symbol="BINANCE:BTCUSDT" />
      <PolygonTickers />
      <GainersLosers />
    </aside>
  );
}
