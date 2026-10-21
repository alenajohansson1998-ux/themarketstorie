"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Pause, Play } from "lucide-react";
import { FaMicrosoft } from "react-icons/fa";
import { SiApple, SiBitcoin, SiEthereum, SiTesla } from "react-icons/si";
import {
  DEFAULT_TICKER_SYMBOLS,
  fetchTickerSnapshot,
  FinnhubQuote,
  getFinnhubWebSocketUrl,
  toDisplaySymbol,
  toFinnhubSymbol,
} from "@/lib/finnhub";
import { getNyseStatus, type MarketStatus } from "@/lib/marketStatus";

interface TickerStateItem {
  symbol: string;
  price: number | null;
  prevClose: number | null;
  change: number | null;
  changePercent: number | null;
}

const SYMBOLS = [...DEFAULT_TICKER_SYMBOLS];

const LOGO_MAP = {
  BTC: SiBitcoin,
  ETH: SiEthereum,
  AAPL: SiApple,
  TSLA: SiTesla,
  MSFT: FaMicrosoft,
} as const;

function getSymbolBase(symbol: string): string {
  const display = toDisplaySymbol(symbol).toUpperCase();
  if (display.endsWith("USDT")) return display.slice(0, -4);
  if (display.endsWith("USD")) return display.slice(0, -3);
  return display;
}

function getInitialState(): Record<string, TickerStateItem> {
  return Object.fromEntries(
    SYMBOLS.map((symbol) => [
      symbol,
      { symbol, price: null, prevClose: null, change: null, changePercent: null },
    ])
  );
}

function quoteToTickerItem(symbol: string, quote: FinnhubQuote): TickerStateItem {
  return {
    symbol,
    price: quote.c,
    prevClose: quote.pc,
    change: quote.d,
    changePercent: quote.dp,
  };
}

function formatPrice(price: number | null): string {
  if (price === null || Number.isNaN(price)) return "—";
  return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatChange(changePercent: number | null): string {
  if (changePercent === null || Number.isNaN(changePercent)) return "—";
  const sign = changePercent > 0 ? "+" : changePercent < 0 ? "−" : "";
  return `${sign}${Math.abs(changePercent).toFixed(2)}%`;
}

function useMarketStatus(): MarketStatus | null {
  const [status, setStatus] = useState<MarketStatus | null>(null);
  useEffect(() => {
    const update = () => setStatus(getNyseStatus());
    update();
    const interval = setInterval(update, 30_000);
    return () => clearInterval(interval);
  }, []);
  return status;
}

export default function LiveTicker() {
  const [ticker, setTicker] = useState<Record<string, TickerStateItem>>(getInitialState);
  const [paused, setPaused] = useState(false);
  const status = useMarketStatus();

  const repeatedSymbols = useMemo(() => [...SYMBOLS, ...SYMBOLS], []);

  useEffect(() => {
    let active = true;

    async function loadSnapshot() {
      try {
        const snapshot = await fetchTickerSnapshot(SYMBOLS);
        if (!active) return;

        setTicker((prev) => {
          const next = { ...prev };
          for (const symbol of SYMBOLS) {
            const quote = snapshot[toDisplaySymbol(symbol)];
            if (quote) next[symbol] = quoteToTickerItem(symbol, quote);
          }
          return next;
        });
      } catch (error) {
        console.error("Failed to load ticker snapshot", error);
      }
    }

    loadSnapshot();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_FINNHUB_KEY;
    if (!apiKey) {
      console.warn("Live ticker: NEXT_PUBLIC_FINNHUB_KEY is not set, showing snapshot prices only.");
      return;
    }

    let isStopped = false;
    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      socket = new WebSocket(getFinnhubWebSocketUrl());

      socket.onopen = () => {
        for (const symbol of SYMBOLS) {
          socket?.send(JSON.stringify({ type: "subscribe", symbol: toFinnhubSymbol(symbol) }));
        }
      };

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data) as { data?: Array<{ p: number; s: string }> };
          if (!payload.data || payload.data.length === 0) return;

          setTicker((prev) => {
            const next = { ...prev };
            for (const tick of payload.data || []) {
              const display = toDisplaySymbol(tick.s);
              const matchingSymbol = SYMBOLS.find((item) => item === display);
              if (!matchingSymbol) continue;

              const current = next[matchingSymbol];
              const prevClose = current.prevClose ?? current.price ?? tick.p;
              const change = tick.p - prevClose;
              const changePercent = prevClose ? (change / prevClose) * 100 : 0;

              next[matchingSymbol] = { symbol: matchingSymbol, price: tick.p, prevClose, change, changePercent };
            }
            return next;
          });
        } catch (error) {
          console.error("Failed to parse ticker message", error);
        }
      };

      socket.onerror = () => {
        console.warn("Live ticker connection interrupted, reconnecting.");
      };

      socket.onclose = () => {
        if (isStopped) return;
        reconnectTimer = setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      isStopped = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (socket && socket.readyState === WebSocket.OPEN) {
        for (const symbol of SYMBOLS) {
          socket.send(JSON.stringify({ type: "unsubscribe", symbol: toFinnhubSymbol(symbol) }));
        }
      }
      socket?.close();
    };
  }, []);

  return (
    <section className="live-ticker" aria-label="Market ticker" data-paused={paused}>
      {status ? (
        <p
          className="flex shrink-0 items-center gap-2 border-r border-line-soft px-4 text-caption font-semibold text-ink"
          title={status.label}
        >
          <span
            className={`h-2 w-2 rounded-full ${status.open ? "bg-up" : "bg-ink-3"}`}
            aria-hidden="true"
          />
          <span className="hidden lg:inline">{status.label}</span>
          <span className="lg:hidden">{status.short}</span>
        </p>
      ) : null}

      <div className="live-ticker__viewport">
        <ul className="live-ticker__track">
          {repeatedSymbols.map((symbol, idx) => {
            const item = ticker[symbol];
            const pct = item?.changePercent ?? null;
            const base = getSymbolBase(symbol);
            const Icon = LOGO_MAP[base as keyof typeof LOGO_MAP];
            // The second copy exists only to make the loop seamless.
            const duplicate = idx >= SYMBOLS.length;
            return (
              <li key={`${symbol}-${idx}`} aria-hidden={duplicate || undefined}>
                <Link
                  href={`/markets/${symbol}`}
                  className="live-ticker__item"
                  tabIndex={duplicate ? -1 : undefined}
                >
                  <span className="live-ticker__logo" aria-hidden="true">
                    {Icon ? <Icon size={11} /> : base.slice(0, 1)}
                  </span>
                  <span className="live-ticker__symbol">{symbol}</span>
                  <span className="live-ticker__price">{formatPrice(item?.price ?? null)}</span>
                  <span
                    className={`live-ticker__change ${
                      pct !== null && pct < 0 ? "live-ticker__change--down" : "live-ticker__change--up"
                    }`}
                  >
                    {formatChange(pct)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <button
        type="button"
        onClick={() => setPaused((value) => !value)}
        aria-pressed={paused}
        aria-label={paused ? "Play ticker" : "Pause ticker"}
        className="inline-flex w-11 shrink-0 items-center justify-center border-l border-line-soft text-ink-2 hover:text-ink motion-reduce:hidden"
      >
        {paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
      </button>
    </section>
  );
}
