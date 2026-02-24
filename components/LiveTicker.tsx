"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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

interface TickerStateItem {
  symbol: string;
  price: number | null;
  prevClose: number | null;
  change: number | null;
  changePercent: number | null;
}

const SYMBOLS = [...DEFAULT_TICKER_SYMBOLS];

const LOGO_MAP = {
  BTC: { Icon: SiBitcoin, className: "live-ticker__logo--btc" },
  ETH: { Icon: SiEthereum, className: "live-ticker__logo--eth" },
  AAPL: { Icon: SiApple, className: "live-ticker__logo--aapl" },
  TSLA: { Icon: SiTesla, className: "live-ticker__logo--tsla" },
  MSFT: { Icon: FaMicrosoft, className: "live-ticker__logo--msft" },
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
      {
        symbol,
        price: null,
        prevClose: null,
        change: null,
        changePercent: null,
      },
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
  if (price === null || Number.isNaN(price)) return "--";
  return price.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatChange(changePercent: number | null): string {
  if (changePercent === null || Number.isNaN(changePercent)) return "--";
  const sign = changePercent >= 0 ? "+" : "";
  return `${sign}${changePercent.toFixed(2)}%`;
}

export default function LiveTicker() {
  const hasApiKey = Boolean(process.env.NEXT_PUBLIC_FINNHUB_KEY);
  const [ticker, setTicker] = useState<Record<string, TickerStateItem>>(getInitialState);
  const [connectionError, setConnectionError] = useState<string | null>(
    hasApiKey ? null : "Live ticker unavailable: missing Finnhub key."
  );

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
            const key = toDisplaySymbol(symbol);
            const quote = snapshot[key];
            if (quote) {
              next[symbol] = quoteToTickerItem(symbol, quote);
            }
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
      return;
    }

    let isStopped = false;
    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      socket = new WebSocket(getFinnhubWebSocketUrl());

      socket.onopen = () => {
        setConnectionError(null);
        for (const symbol of SYMBOLS) {
          socket?.send(
            JSON.stringify({
              type: "subscribe",
              symbol: toFinnhubSymbol(symbol),
            })
          );
        }
      };

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data) as {
            data?: Array<{ p: number; s: string }>;
          };
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

              next[matchingSymbol] = {
                symbol: matchingSymbol,
                price: tick.p,
                prevClose,
                change,
                changePercent,
              };
            }

            return next;
          });
        } catch (error) {
          console.error("Failed to parse ticker message", error);
        }
      };

      socket.onerror = () => {
        setConnectionError("Live ticker connection interrupted.");
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
        for (const symbol of SYMBOLS) {
          socket.send(
            JSON.stringify({
              type: "unsubscribe",
              symbol: toFinnhubSymbol(symbol),
            })
          );
        }
      }

      socket?.close();
    };
  }, []);

  return (
    <section className="live-ticker" aria-label="Live market ticker">
      <div className="live-ticker__viewport">
        <div className="live-ticker__track">
          {repeatedSymbols.map((symbol, idx) => {
            const item = ticker[symbol];
            const up = (item?.changePercent ?? 0) >= 0;
            const base = getSymbolBase(symbol);
            const logo = LOGO_MAP[base as keyof typeof LOGO_MAP];
            return (
              <Link
                key={`${symbol}-${idx}`}
                href={`/markets/${symbol}`}
                className="live-ticker__item"
              >
                <span
                  className={`live-ticker__logo ${
                    logo?.className || "live-ticker__logo--fallback"
                  }`}
                  aria-hidden="true"
                >
                  {logo ? <logo.Icon size={12} /> : base.slice(0, 1)}
                </span>
                <span className="live-ticker__symbol">{symbol}</span>
                <span aria-hidden="true">&nbsp;</span>
                <span className="live-ticker__price">{formatPrice(item?.price ?? null)}</span>
                <span aria-hidden="true">&nbsp;</span>
                <span
                  className={`live-ticker__change ${
                    up ? "live-ticker__change--up" : "live-ticker__change--down"
                  }`}
                >
                  {formatChange(item?.changePercent ?? null)}
                </span>
                <span aria-hidden="true" className="live-ticker__sep">
                  |
                </span>
              </Link>
            );
          })}
        </div>
      </div>
      {connectionError ? (
        <p className="px-3 py-1 text-xs text-red-600">{connectionError}</p>
      ) : null}
    </section>
  );
}
