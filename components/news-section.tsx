"use client";

import { useEffect, useRef } from "react";

interface TradingViewChartProps {
  symbol?: string;
  height?: number;
  theme?: "light" | "dark";
  interval?: string;
}

export default function TradingViewChart({
  symbol = "NASDAQ:AAPL",
  height = 620,
  theme = "dark",
  interval = "1",
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ((window as any).TradingView) {
      createWidget();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = createWidget;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [symbol, height, theme, interval]);

  const createWidget = () => {
    if (!containerRef.current || !(window as any).TradingView) return;

    containerRef.current.innerHTML = "";

    new (window as any).TradingView.widget({
      container_id: containerRef.current.id,
      width: "100%",
      height,
      symbol,
      interval,
      timezone: "Etc/UTC",
      theme,
      style: "1",
      locale: "en",
      toolbar_bg: "#181818",
      enable_publishing: false,
      allow_symbol_change: true,
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      studies: ["MACD@tv-basicstudies"],
    });
  };

  return (
    <div
      id="tv_chart_container"
      ref={containerRef}
      style={{ width: "100%", height, minHeight: 520 }}
    />
  );
}
