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
import type { CandleBar, MarketTimeframe } from "@/lib/finnhub";
import { useColorScheme } from "@/lib/useColorScheme";

const CHART_COLORS = {
  light: { text: "#6e6e73", grid: "rgba(0, 0, 0, 0.05)", border: "#d2d2d7", crosshair: "#86868b", up: "#1a7f37", down: "#cf222e" },
  dark: { text: "#a1a1a6", grid: "rgba(255, 255, 255, 0.07)", border: "#38383a", crosshair: "#8e8e93", up: "#30d158", down: "#ff6961" },
};

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
  const initialBarTime = initialData[initialData.length - 1]?.time;
  const [lastUpdated, setLastUpdated] = useState<number | null>(
    initialBarTime == null ? null : initialBarTime * 1000
  );
  const scheme = useColorScheme();

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
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: CHART_COLORS.light.text,
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const series = chart.addSeries(CandlestickSeries, { borderVisible: false });

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

  // Follow the reader's light or dark appearance.
  useEffect(() => {
    const chart = chartRef.current;
    const series = seriesRef.current;
    if (!chart || !series) return;
    const colors = CHART_COLORS[scheme];
    chart.applyOptions({
      layout: { textColor: colors.text },
      grid: { horzLines: { color: colors.grid }, vertLines: { color: colors.grid } },
      rightPriceScale: { borderColor: colors.border },
      timeScale: { borderColor: colors.border },
      crosshair: { horzLine: { color: colors.crosshair }, vertLine: { color: colors.crosshair } },
    });
    series.applyOptions({
      upColor: colors.up,
      downColor: colors.down,
      wickUpColor: colors.up,
      wickDownColor: colors.down,
    });
  }, [scheme, initialData]);

  useEffect(() => {
    if (!seriesRef.current || !chartRef.current) return;
    seriesRef.current.setData(toSeriesData(bars));
    chartRef.current.timeScale().fitContent();
  }, [bars]);

  useEffect(() => {
    let active = true;

    async function refreshCandles() {
      try {
        const response = await fetch(
          `/api/market-candles?symbol=${encodeURIComponent(symbol)}&timeframe=${timeframe}`,
          { cache: "no-store" }
        );
        if (!response.ok) return;
        const payload = (await response.json()) as CandlesApiResponse;
        if (!active || !payload.candles?.length) return;
        setBars(payload.candles);
        setLastUpdated(Date.now());
      } catch {
        // Keep the last valid chart data when a refresh cannot reach the market data service.
      }
    }

    const interval = window.setInterval(refreshCandles, 60_000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [symbol, timeframe]);

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
          setError("Price history for this timeframe isn’t available. Live prices will still appear as they arrive.");
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
          ? "Price history for this symbol isn’t available."
          : "This timeframe didn’t load. Choose it again to retry.";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [symbol]
  );

  return (
    <section aria-labelledby="price-chart-heading">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 id="price-chart-heading" className="text-title3 text-ink">
            Price chart
          </h2>
          <p className="text-footnote tabular-nums text-ink-2">
            {lastPrice !== null ? `Last ${lastPrice.toFixed(2)}` : "Waiting for the first price…"}
          </p>
        </div>

        <div role="group" aria-label="Timeframe" className="inline-flex self-start rounded-control bg-fill p-1">
          {TIMEFRAMES.map((item) => {
            const selected = timeframe === item;
            return (
              <button
                key={item}
                type="button"
                aria-pressed={selected}
                onClick={() => handleTimeframeChange(item)}
                className={`inline-flex h-9 min-w-10 items-center justify-center rounded-md px-2.5 text-subhead font-medium transition-colors ${
                  selected ? "bg-canvas text-ink shadow-sm" : "text-ink-2 hover:text-ink"
                }`}
              >
                {TIMEFRAME_LABELS[item]}
              </button>
            );
          })}
        </div>
      </div>

      {error ? (
        <p role="status" className="mb-3 rounded-control bg-surface px-3 py-2 text-subhead text-ink-2">
          {error}
        </p>
      ) : null}

      <div ref={containerRef} className="min-h-[420px] w-full overflow-hidden rounded-card border border-line-soft" />

      <div className="mt-2 flex items-center justify-between text-footnote text-ink-2">
        <span className="inline-flex items-center gap-1.5" aria-live="polite">
          {loading ? (
            "Loading…"
          ) : (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-up" aria-hidden="true" /> Live
            </>
          )}
        </span>
        <span>
          Updated{" "}
          {lastUpdated === null
            ? "—"
            : new Date(lastUpdated).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                timeZone: "UTC",
              })}
        </span>
      </div>
    </section>
  );
}
