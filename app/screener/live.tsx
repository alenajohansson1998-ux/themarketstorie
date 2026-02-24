"use client";
import { useEffect } from "react";

export default function ScreenerLivePage() {
  useEffect(() => {
    // Dynamically load TradingView widget script
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      // @ts-ignore
      if (window.TradingView) {
        // @ts-ignore
        new window.TradingView.widget({
          container_id: "tv_chart_container",
          width: "100%",
          height: 600,
          symbol: "NASDAQ:AAPL",
          interval: "1",
          timezone: "Etc/UTC",
          theme: "dark",
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
      }
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#181818] text-white">
      <h1 className="text-3xl font-bold mb-6">Stock Screener Live Chart</h1>
      <div className="w-full max-w-5xl bg-[#232323] rounded-lg shadow-lg p-6 flex flex-col items-center">
        <div id="tv_chart_container" style={{ width: "100%", height: 600 }} />
        <p className="mt-4 text-gray-300 text-center max-w-2xl">
          This is a live TradingView chart embedded in the screener. You can interact with the chart, change symbols, and use technical indicators. For a full-featured screener, integrate your own datafeed and symbol search.
        </p>
      </div>
    </div>
  );
}
