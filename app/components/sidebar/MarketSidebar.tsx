import { TradingViewOverview, TradingViewMini } from "./TradingViewWidgets";
import PolygonTickers from "./PolygonTickers";
import GainersLosers from "./GainersLosers";

export default function MarketSidebar() {
  return (
    <aside className="w-[360px] min-h-screen p-3 space-y-4 border-l bg-white">
      <TradingViewOverview />

      <TradingViewMini symbol="NASDAQ:NVDA" />
      <TradingViewMini symbol="BINANCE:BTCUSDT" />

      <PolygonTickers />
      <GainersLosers />
    </aside>
  );
}
