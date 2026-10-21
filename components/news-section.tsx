"use client";

import { useEffect, useId, useRef } from "react";
import { useColorScheme } from "@/lib/useColorScheme";

interface TradingViewChartProps {
  symbol?: string;
  height?: number;
  /** Defaults to the reader's system appearance. */
  theme?: "light" | "dark";
  interval?: string;
}

type TradingViewGlobal = { widget: new (options: Record<string, unknown>) => unknown };

let scriptPromise: Promise<void> | null = null;

function loadTradingView(): Promise<void> {
  if ((window as unknown as { TradingView?: TradingViewGlobal }).TradingView) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/tv.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        scriptPromise = null;
        reject(new Error("TradingView failed to load"));
      };
      document.body.appendChild(script);
    });
  }
  return scriptPromise;
}

export default function TradingViewChart({
  symbol = "NASDAQ:AAPL",
  height = 460,
  theme,
  interval = "D",
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const systemScheme = useColorScheme();
  const resolvedTheme = theme ?? systemScheme;
  const containerId = `tv_chart_${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  useEffect(() => {
    let cancelled = false;
    loadTradingView()
      .then(() => {
        const container = containerRef.current;
        const tv = (window as unknown as { TradingView?: TradingViewGlobal }).TradingView;
        if (cancelled || !container || !tv) return;
        container.innerHTML = "";
        new tv.widget({
          container_id: containerId,
          width: "100%",
          height,
          symbol,
          interval,
          timezone: "Etc/UTC",
          theme: resolvedTheme,
          style: "1",
          locale: "en",
          enable_publishing: false,
          allow_symbol_change: true,
          hide_top_toolbar: false,
          hide_legend: false,
          save_image: false,
        });
      })
      .catch((error) => console.warn(error));
    return () => {
      cancelled = true;
    };
  }, [symbol, height, resolvedTheme, interval, containerId]);

  return (
    <div
      id={containerId}
      ref={containerRef}
      className="w-full overflow-hidden rounded-card border border-line-soft bg-canvas"
      style={{ height }}
    />
  );
}
