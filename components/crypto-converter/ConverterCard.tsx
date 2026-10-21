"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowUpDown, RefreshCw, ChevronDown, Search, X } from "lucide-react";
import { CRYPTO_TOKENS, FIAT_CURRENCIES, type CryptoToken, type FiatCurrency } from "@/lib/crypto-tokens";

type ToCurrency =
  | { type: "fiat"; data: FiatCurrency }
  | { type: "crypto"; data: CryptoToken };

function formatNumber(n: number, decimals = 6): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (n >= 1) return n.toLocaleString("en-US", { maximumFractionDigits: 4 });
  return n.toFixed(decimals);
}

function CurrencyDropdown({
  label,
  selected,
  onSelect,
  includeCrypto = false,
}: {
  label: string;
  selected: ToCurrency | CryptoToken;
  onSelect: (v: ToCurrency | CryptoToken) => void;
  includeCrypto?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const isCryptoToken = (v: ToCurrency | CryptoToken): v is CryptoToken =>
    "id" in v && "color" in v;

  const displayName = isCryptoToken(selected)
    ? selected.name
    : selected.type === "fiat"
    ? selected.data.name
    : (selected as { type: "crypto"; data: CryptoToken }).data.name;

  const displaySymbol = isCryptoToken(selected)
    ? selected.symbol
    : selected.type === "fiat"
    ? selected.data.symbol
    : (selected as { type: "crypto"; data: CryptoToken }).data.symbol;

  const ql = q.toLowerCase();

  const filteredFiats = FIAT_CURRENCIES.filter(
    (f) => f.name.toLowerCase().includes(ql) || f.symbol.toLowerCase().includes(ql)
  );
  const filteredCryptos = CRYPTO_TOKENS.filter(
    (c) => c.name.toLowerCase().includes(ql) || c.symbol.toLowerCase().includes(ql)
  );

  return (
    <div ref={ref} className="relative">
      <p className="mb-1.5 text-footnote font-medium text-ink" id={`${label}-label`}>{label}</p>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${label}-label ${label}-value`}
        className="flex min-h-12 w-full items-center justify-between gap-2 rounded-card border border-line bg-canvas px-4 py-3 text-left transition-colors hover:border-fill-2"
      >
        <span id={`${label}-value`} className="truncate font-semibold text-ink">
          {displaySymbol} <span className="text-subhead font-normal text-ink-2">{displayName}</span>
        </span>
        <ChevronDown size={16} className={`text-ink-2 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="elevated absolute z-50 mt-2 w-full overflow-hidden">
          <div className="flex items-center gap-2 border-b border-line-soft p-3">
            <Search size={14} className="shrink-0 text-ink-2" aria-hidden="true" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search currencies"
              aria-label="Search currencies"
              className="flex-1 bg-transparent text-subhead text-ink placeholder:text-ink-3 outline-none"
            />
            {q && (
              <button type="button" onClick={() => setQ("")} aria-label="Clear search" className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-fill">
                <X size={12} className="text-ink-2" aria-hidden="true" />
              </button>
            )}
          </div>
          <div className="max-h-64 overflow-y-auto" role="listbox" aria-label={label}>
            {includeCrypto && filteredCryptos.length > 0 && (
              <>
                <p className="px-3 pt-2 pb-1 text-caption font-semibold uppercase tracking-wide text-ink-2">Crypto</p>
                {filteredCryptos.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    role="option"
                    aria-selected={displaySymbol === c.symbol}
                    onClick={() => { onSelect({ type: "crypto", data: c }); setOpen(false); setQ(""); }}
                    className="flex min-h-11 w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-fill"
                  >
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                    <span className="text-ink text-subhead font-medium">{c.symbol}</span>
                    <span className="text-ink-2 text-footnote">{c.name}</span>
                  </button>
                ))}
              </>
            )}
            {filteredFiats.length > 0 && (
              <>
                <p className="px-3 pt-2 pb-1 text-caption font-semibold uppercase tracking-wide text-ink-2">Currencies</p>
                {filteredFiats.map((f) => (
                  <button
                    key={f.symbol}
                    type="button"
                    role="option"
                    aria-selected={displaySymbol === f.symbol}
                    onClick={() => { onSelect({ type: "fiat", data: f }); setOpen(false); setQ(""); }}
                    className="flex min-h-11 w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-fill"
                  >
                    <span className="text-ink text-subhead font-medium">{f.symbol}</span>
                    <span className="text-ink-2 text-footnote">{f.name}</span>
                    <span className="ml-auto text-ink-2 text-footnote">{f.sign}</span>
                  </button>
                ))}
              </>
            )}
            {filteredFiats.length === 0 && (!includeCrypto || filteredCryptos.length === 0) && (
              <p className="px-3 py-6 text-center text-ink-2 text-subhead">No results</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function InlineTokenPicker({
  selected,
  onSelect,
}: {
  selected: CryptoToken;
  onSelect: (v: CryptoToken) => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const [dropStyle, setDropStyle] = useState({ top: 0, right: 0 });

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        btnRef.current && !btnRef.current.contains(e.target as Node) &&
        dropRef.current && !dropRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setQ("");
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  function handleOpen() {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setDropStyle({
        top: rect.bottom + window.scrollY + 6,
        right: window.innerWidth - rect.right,
      });
    }
    setOpen((o) => !o);
  }

  const ql = q.toLowerCase();
  const filtered = CRYPTO_TOKENS.filter(
    (c) => c.name.toLowerCase().includes(ql) || c.symbol.toLowerCase().includes(ql)
  );

  return (
    <>
      {/* Trigger button — pill style on the right of the input */}
      <button
        ref={btnRef}
        type="button"
        onClick={handleOpen}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Cryptocurrency to convert: ${selected.name}`}
        className="my-1.5 mr-1.5 flex min-h-10 shrink-0 items-center gap-2 rounded-control bg-surface px-3 transition-colors hover:bg-fill"
      >
        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: selected.color }} />
        <span className="font-semibold text-ink text-subhead whitespace-nowrap">{selected.symbol}</span>
        <ChevronDown
          size={13}
          className={`text-ink-2 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown — rendered in document flow via fixed positioning */}
      {open && (
        <div
          ref={dropRef}
          className="elevated fixed z-200 w-64 overflow-hidden"
          style={{ top: dropStyle.top, right: dropStyle.right }}
        >
          <div className="p-3 border-b border-line flex items-center gap-2">
            <Search size={13} className="text-ink-2 shrink-0" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search crypto"
              aria-label="Search cryptocurrencies"
              className="flex-1 bg-transparent text-subhead text-ink placeholder:text-ink-3 outline-none"
            />
            {q && (
              <button type="button" onClick={() => setQ("")} aria-label="Clear search" className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-fill">
                <X size={12} className="text-ink-2" aria-hidden="true" />
              </button>
            )}
          </div>
          <div className="max-h-60 overflow-y-auto" role="listbox" aria-label="Cryptocurrencies">
            {filtered.map((c) => (
              <button
                key={c.id}
                type="button"
                role="option"
                aria-selected={c.id === selected.id}
                onClick={() => { onSelect(c); setOpen(false); setQ(""); btnRef.current?.focus(); }}
                className="flex min-h-11 w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-fill"
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                <span className="text-ink text-subhead font-medium">{c.symbol}</span>
                <span className="text-ink-2 text-footnote">{c.name}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-3 py-6 text-center text-ink-2 text-subhead">No results</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default function ConverterCard({
  defaultFrom,
  defaultTo,
}: {
  defaultFrom?: string;
  defaultTo?: string;
}) {
  const defaultFromToken =
    CRYPTO_TOKENS.find((c) => c.id === defaultFrom || c.symbol.toLowerCase() === defaultFrom?.toLowerCase()) ??
    CRYPTO_TOKENS[0];

  const defaultToFiat = FIAT_CURRENCIES.find(
    (f) => f.symbol.toLowerCase() === defaultTo?.toLowerCase()
  );
  const defaultToCrypto = !defaultToFiat
    ? CRYPTO_TOKENS.find((c) => c.id === defaultTo || c.symbol.toLowerCase() === defaultTo?.toLowerCase())
    : undefined;

  const defaultToCurrency: ToCurrency = defaultToFiat
    ? { type: "fiat", data: defaultToFiat }
    : defaultToCrypto
    ? { type: "crypto", data: defaultToCrypto }
    : { type: "fiat", data: FIAT_CURRENCIES[0] };

  const [fromToken, setFromToken] = useState<CryptoToken>(defaultFromToken);
  const [toCurrency, setToCurrency] = useState<ToCurrency>(defaultToCurrency);
  const [amount, setAmount] = useState("1");
  const [prices, setPrices] = useState<Record<string, number> | null>(null);
  const [change24h, setChange24h] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [stale, setStale] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPrices = useCallback(async () => {
    const toId =
      toCurrency.type === "crypto" ? toCurrency.data.id : null;
    const ids = toId ? `${fromToken.id},${toId}` : fromToken.id;
    const vsCurrencies =
      toCurrency.type === "fiat"
        ? toCurrency.data.symbol.toLowerCase()
        : "usd";

    try {
      const res = await fetch(
        `/api/crypto/prices?ids=${ids}&vs_currencies=${vsCurrencies},usd`
      );
      if (!res.ok) throw new Error();
      const data = await res.json();

      const fromData = data[fromToken.id];
      if (!fromData) throw new Error();

      const vsKey =
        toCurrency.type === "fiat"
          ? toCurrency.data.symbol.toLowerCase()
          : "usd";

      if (toCurrency.type === "crypto") {
        const fromUsd = fromData["usd"] ?? 0;
        const toUsd = data[toCurrency.data.id]?.["usd"] ?? 1;
        const rate = fromUsd / toUsd;
        setPrices({ rate });
      } else {
        setPrices({ rate: fromData[vsKey] ?? 0 });
      }

      setChange24h(fromData["usd_24h_change"] ?? null);
      setLastUpdated(new Date());
      setStale(false);
    } catch {
      // Keep existing price data; just mark it as stale
      setStale(true);
    } finally {
      setLoading(false);
    }
  }, [fromToken.id, toCurrency]);

  useEffect(() => {
    setPrices(null);
    setStale(false);
    setLoading(true);
    fetchPrices();
    const id = setInterval(fetchPrices, 5000);
    return () => clearInterval(id);
  }, [fetchPrices]);

  function handleSwap() {
    if (toCurrency.type === "fiat") return;
    const newFrom = toCurrency.data as CryptoToken;
    setFromToken(newFrom);
    setToCurrency({ type: "crypto", data: fromToken });
  }

  const rate = prices?.rate ?? 0;
  const amountNum = parseFloat(amount) || 0;
  const converted = rate * amountNum;

  const toSign =
    toCurrency.type === "fiat"
      ? toCurrency.data.sign
      : (toCurrency.data as CryptoToken).symbol;

  const isPositive = (change24h ?? 0) >= 0;

  return (
    <div className="overflow-hidden rounded-media bg-surface">
      {/* Header */}
      <div className="border-b border-line-soft px-6 pb-4 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-headline text-ink">Convert</h2>
            <p className="mt-0.5 text-footnote text-ink-2">Live prices, refreshed every 5 seconds</p>
          </div>
          <button
            type="button"
            onClick={fetchPrices}
            aria-label="Refresh price"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-fill"
          >
            <RefreshCw size={16} className={`text-ink-2 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-4">
        {/* Amount + From — single row */}
        <div>
          <label htmlFor="converter-amount" className="mb-1.5 block text-footnote font-medium text-ink">
            Amount
          </label>
          <div className="flex items-stretch rounded-card border border-line bg-canvas transition-colors focus-within:border-tint">
            <input
              id="converter-amount"
              type="number"
              inputMode="decimal"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="min-w-0 flex-1 bg-transparent px-4 py-3 text-title3 tabular-nums text-ink outline-none placeholder:text-ink-3"
              placeholder="1"
            />
            <InlineTokenPicker selected={fromToken} onSelect={setFromToken} />
          </div>
        </div>

        {/* Swap */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleSwap}
            disabled={toCurrency.type === "fiat"}
            aria-label="Swap currencies"
            title={toCurrency.type === "fiat" ? "Swap works when converting crypto to crypto" : "Swap currencies"}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-canvas transition-colors hover:bg-fill disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ArrowUpDown size={16} className="text-ink-2" aria-hidden="true" />
          </button>
        </div>

        <CurrencyDropdown
          label="To"
          selected={toCurrency}
          onSelect={(v) => setToCurrency(v as ToCurrency)}
          includeCrypto
        />

        {/* Result */}
        <div className="rounded-card bg-canvas p-5 text-center" aria-live="polite">
          {loading && !prices ? (
            <div className="space-y-2">
              <div className="h-9 bg-fill rounded-lg animate-pulse mx-auto w-48" />
              <div className="h-4 bg-fill rounded animate-pulse mx-auto w-32" />
            </div>
          ) : prices ? (
            <>
              <p className="text-title1 tabular-nums text-ink">
                {toCurrency.type === "fiat" ? toCurrency.data.sign : ""}
                {formatNumber(converted)}{" "}
                <span className="text-title3 font-normal text-ink-2">{toSign}</span>
              </p>
              <p className="mt-2 text-footnote tabular-nums text-ink-2">
                1 {fromToken.symbol} = {toCurrency.type === "fiat" ? toCurrency.data.sign : ""}
                {formatNumber(rate)} {toSign}
              </p>
              {change24h !== null && (
                <p className={`mt-1.5 text-footnote font-medium tabular-nums ${isPositive ? "text-up" : "text-down"}`}>
                  {isPositive ? "+" : "−"}{Math.abs(change24h).toFixed(2)}% in 24 hours
                </p>
              )}
              {stale && (
                <p className="mt-1 text-footnote text-ink-2">Price may be out of date. Reconnecting…</p>
              )}
            </>
          ) : (
            <p className="text-subhead text-ink-2">Price unavailable right now.</p>
          )}
        </div>

        {lastUpdated && (
          <p className="text-center text-footnote text-ink-2">
            Updated {lastUpdated.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" })} · Prices from CoinGecko
          </p>
        )}
      </div>
    </div>
  );
}
