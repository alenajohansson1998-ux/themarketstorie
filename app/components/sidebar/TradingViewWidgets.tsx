"use client";

import { useColorScheme } from "@/lib/useColorScheme";

// TradingView's iframe embeds read their settings from a JSON object in the URL hash.
function embedUrl(widget: string, config: Record<string, unknown>) {
  return `https://s.tradingview.com/embed-widget/${widget}/?locale=en#${encodeURIComponent(JSON.stringify(config))}`;
}

export function TradingViewOverview() {
  const scheme = useColorScheme();
  return (
    <iframe
      key={scheme}
      title="Market overview by TradingView"
      src={embedUrl("market-overview", { colorTheme: scheme, isTransparent: true, showChart: true, width: "100%", height: 420 })}
      className="h-[420px] w-full rounded-card border border-line-soft"
      loading="lazy"
    />
  );
}

export function TradingViewMini({ symbol }: { symbol: string }) {
  const scheme = useColorScheme();
  return (
    <iframe
      key={`${symbol}-${scheme}`}
      title={`${symbol} price chart by TradingView`}
      src={embedUrl("mini-symbol-overview", { symbol, colorTheme: scheme, isTransparent: true, width: "100%", height: 220 })}
      className="h-[220px] w-full rounded-card border border-line-soft"
      loading="lazy"
    />
  );
}
