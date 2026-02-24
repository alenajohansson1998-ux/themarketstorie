"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CandlestickSeries,
  CandlestickData,
  ColorType,
  createChart,
  IChartApi,
  ISeriesApi,
  UTCTimestamp,
} from "lightweight-charts";
import {
  CandleBar,
  getFinnhubWebSocketUrl,
  MarketTimeframe,
  timeframeBucketSeconds,
  toFinnhubSymbol,
} from "@/lib/finnhub";

interface MarketChartProps {
  symbol: string;
  initialData: CandleBar[];
  initialTimeframe?: MarketTimeframe;
}

const TIMEFRAMES: MarketTimeframe[] = ["5M", "15M", "1H", "1D", "1W", "1M", "1Y"];

const TIMEFRAME_LABELS: Record<MarketTimeframe, string> = {
  "5M": "5m",
  "15M": "15m",
  "1H": "1h",
  "1D": "1D",
  "1W": "1W",
  "1M": "1M",
  "1Y": "1Y",
};

interface CandlesApiResponse {
  candles?: CandleBar[];
  error?: string;
}

function toSeriesData(data: CandleBar[]): CandlestickData[] {
  return data.map((bar) => ({
    time: bar.time as UTCTimestamp,
    open: bar.open,
    high: bar.high,
    low: bar.low,
    close: bar.close,
  }));
}

export default function MarketChart({
  symbol,
  initialData,
  initialTimeframe = "1M",
}: MarketChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  const [timeframe, setTimeframe] = useState<MarketTimeframe>(initialTimeframe);
  const [bars, setBars] = useState<CandleBar[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());

  const lastPrice = useMemo(
    () => (bars.length ? bars[bars.length - 1].close : null),
    [bars]
  );

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 420,
      layout: {
        background: { type: ColorType.Solid, color: "#ffffff" },
        textColor: "#374151",
      },
      grid: {
        horzLines: { color: "#f3f4f6" },
        vertLines: { color: "#f9fafb" },
      },
      rightPriceScale: {
        borderColor: "#e5e7eb",
      },
      timeScale: {
        borderColor: "#e5e7eb",
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        horzLine: { color: "#9ca3af" },
        vertLine: { color: "#9ca3af" },
      },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#10b981",
      downColor: "#ef4444",
      borderVisible: false,
      wickUpColor: "#10b981",
      wickDownColor: "#ef4444",
    });

    chartRef.current = chart;
    seriesRef.current = series;
    series.setData(toSeriesData(initialData));
    chart.timeScale().fitContent();

    const resizeObserver = new ResizeObserver(() => {
      if (!containerRef.current || !chartRef.current) return;
      chartRef.current.applyOptions({ width: containerRef.current.clientWidth });
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [initialData]);

  useEffect(() => {
    if (!seriesRef.current || !chartRef.current) return;
    seriesRef.current.setData(toSeriesData(bars));
    chartRef.current.timeScale().fitContent();
  }, [bars]);

  const handleTimeframeChange = useCallback(
    async (next: MarketTimeframe) => {
      setTimeframe(next);
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/market-candles?symbol=${encodeURIComponent(symbol)}&timeframe=${next}`,
          { cache: "no-store" }
        );
        const payload = (await response.json()) as CandlesApiResponse;
        if (!response.ok) {
          throw new Error(payload.error || "Failed to fetch candles");
        }
        const nextBars = Array.isArray(payload.candles) ? payload.candles : [];
        if (!nextBars.length) {
          setError(
            "Historical candles are unavailable for this symbol on the current API plan. Live ticks will still update when available."
          );
          return;
        }
        setBars(nextBars);
        setError(null);
        setLastUpdated(Date.now());
      } catch (err) {
        const isPermissionIssue =
          err instanceof Error &&
          (err.message.includes("Finnhub request failed (403)") ||
            err.message.includes("Finnhub request failed (401)"));
        const message = isPermissionIssue
          ? "Historical candles are unavailable for this symbol on the current API plan."
          : "Failed to load chart timeframe. Please try again.";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [symbol]
  );

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_FINNHUB_KEY;
    if (!apiKey) return;

    let isStopped = false;
    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    const streamSymbol = toFinnhubSymbol(symbol);

    const connect = () => {
      socket = new WebSocket(getFinnhubWebSocketUrl());

      socket.onopen = () => {
        socket?.send(
          JSON.stringify({
            type: "subscribe",
            symbol: streamSymbol,
          })
        );
      };

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data) as {
            data?: Array<{ p: number; s: string; t: number }>;
          };
          if (!payload.data?.length) return;

          const tick = payload.data.find((item) => item.s === streamSymbol);
          if (!tick || !Number.isFinite(tick.p)) return;

          const bucketSeconds = timeframeBucketSeconds(timeframe);
          const tickTimeSeconds = Math.floor(tick.t / 1000);
          const bucket = Math.floor(tickTimeSeconds / bucketSeconds) * bucketSeconds;
          const price = tick.p;

          setBars((prev) => {
            if (!prev.length) {
              return [
                {
                  time: bucket,
                  open: price,
                  high: price,
                  low: price,
                  close: price,
                  volume: 0,
                },
              ];
            }

            const next = [...prev];
            const last = next[next.length - 1];

            if (last.time === bucket) {
              next[next.length - 1] = {
                ...last,
                close: price,
                high: Math.max(last.high, price),
                low: Math.min(last.low, price),
              };
            } else if (last.time < bucket) {
              next.push({
                time: bucket,
                open: last.close,
                high: price,
                low: price,
                close: price,
                volume: 0,
              });
            }

            return next.slice(-800);
          });

          setLastUpdated(Date.now());
        } catch (err) {
          console.error("Failed to parse live chart update", err);
        }
      };

      socket.onerror = () => {
        socket?.close();
      };

      socket.onclose = () => {
        if (isStopped) return;
        reconnectTimer = setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      isStopped = true;

      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }

      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: "unsubscribe",
            symbol: streamSymbol,
          })
        );
      }

      socket?.close();
    };
  }, [symbol, timeframe]);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Price Chart</h2>
          <p className="text-sm text-gray-500">
            {lastPrice !== null ? `Last: ${lastPrice.toFixed(2)}` : "Waiting for price..."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {TIMEFRAMES.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => handleTimeframeChange(item)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                timeframe === item
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {TIMEFRAME_LABELS[item]}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <p className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div
        ref={containerRef}
        className="min-h-[420px] w-full overflow-hidden rounded-lg border border-gray-100"
      />

      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        <span>{loading ? "Loading timeframe data..." : "Live WebSocket updates enabled"}</span>
        <span>Updated: {new Date(lastUpdated).toLocaleTimeString()}</span>
      </div>
    </section>
  );
}
