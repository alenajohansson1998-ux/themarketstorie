import { TradingViewOverview, TradingViewMini } from "./TradingViewWidgets";
import PolygonTickers from "./PolygonTickers";
import GainersLosers from "./GainersLosers";

export default function MarketSidebar() {
  return (
    <aside className="w-full min-h-0 space-y-4 bg-white p-3 sm:p-4 lg:border-l">
      <TradingViewOverview />

      <TradingViewMini symbol="NASDAQ:NVDA" />
      <TradingViewMini symbol="BINANCE:BTCUSDT" />

      <PolygonTickers />
      <GainersLosers />
    </aside>
  );
}
