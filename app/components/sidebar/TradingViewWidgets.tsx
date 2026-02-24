export function TradingViewOverview() {
  return (
    <iframe
      src="https://s.tradingview.com/embed-widget/market-overview/?locale=en"
      className="w-full h-[420px] rounded-xl"
      frameBorder="0"
      loading="lazy"
    />
  );
}

export function TradingViewMini({ symbol }: { symbol: string }) {
  return (
    <iframe
      src={`https://s.tradingview.com/embed-widget/mini-symbol-overview/?symbol=${symbol}&locale=en`}
      className="w-full h-[220px] rounded-xl"
      frameBorder="0"
      loading="lazy"
    />
  );
}
