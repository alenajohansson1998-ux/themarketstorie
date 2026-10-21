"use client";

import React, { useEffect, useRef } from "react";
import { useColorScheme } from "@/lib/useColorScheme";

const SYMBOLS = [
  ["Google", "NASDAQ:GOOGL|1D"],
  ["Microsoft", "NASDAQ:MSFT|1D"],
  ["Apple", "NASDAQ:AAPL|1D"],
  ["NVIDIA", "NASDAQ:NVDA|1D"],
  ["Amazon", "NASDAQ:AMZN|1D"],
  ["Meta", "NASDAQ:META|1D"],
  ["Tesla", "NASDAQ:TSLA|1D"],
  ["Netflix", "NASDAQ:NFLX|1D"],
  ["JPMorgan", "NYSE:JPM|1D"],
  ["Visa", "NYSE:V|1D"],
  ["Reliance", "BSE:RELIANCE|1D"],
  ["TCS", "BSE:TCS|1D"],
  ["Infosys", "BSE:INFY|1D"],
  ["HDFC Bank", "BSE:HDFCBANK|1D"],
  ["Bitcoin", "BINANCE:BTCUSDT|1D"],
  ["Ethereum", "BINANCE:ETHUSDT|1D"],
];

export function PopularScreens({ height = 420 }: { height?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scheme = useColorScheme();
  const injected = useRef<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    // Re-inject only when the theme changes; a repeat run would orphan the loading script.
    if (!container || injected.current === scheme) return;
    injected.current = scheme;
    container.innerHTML = "";

    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";
    widgetDiv.style.height = "100%";
    container.appendChild(widgetDiv);

    const dark = scheme === "dark";
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js";
    script.innerHTML = JSON.stringify({
      lineWidth: 2,
      lineType: 0,
      chartType: "area",
      showVolume: false,
      fontColor: dark ? "rgb(161, 161, 166)" : "rgb(110, 110, 115)",
      gridLineColor: dark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.06)",
      backgroundColor: dark ? "#000000" : "#ffffff",
      widgetFontColor: dark ? "#f5f5f7" : "#1d1d1f",
      upColor: dark ? "#30d158" : "#1a7f37",
      downColor: dark ? "#ff6961" : "#cf222e",
      colorTheme: scheme,
      isTransparent: true,
      locale: "en",
      chartOnly: false,
      scalePosition: "right",
      scaleMode: "Normal",
      fontFamily: "-apple-system, BlinkMacSystemFont, Inter, Segoe UI, Roboto, sans-serif",
      valuesTracking: "1",
      changeMode: "price-and-percent",
      symbols: SYMBOLS,
      dateRanges: ["1d|1", "1m|30", "3m|60", "12m|1D", "60m|1W", "all|1M"],
      fontSize: "12",
      headerFontSize: "medium",
      autosize: true,
      width: "100%",
      height: "100%",
      noTimeScale: false,
      hideDateRanges: false,
      hideMarketStatus: false,
      hideSymbolLogo: false,
    });
    widgetDiv.appendChild(script);
  }, [scheme]);

  return (
    <div>
      <div
        ref={containerRef}
        className="tradingview-widget-container w-full overflow-hidden rounded-card border border-line-soft"
        style={{ height }}
      />
      <p className="mt-2 text-footnote text-ink-2">Stock and crypto prices by TradingView.</p>
    </div>
  );
}
