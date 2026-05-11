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
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
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
      <p className="text-xs text-gray-400 uppercase tracking-widest mb-1.5">{label}</p>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between gap-2 w-full bg-[#1a1f2e] border border-[#2a3045] hover:border-[#3a4060] rounded-xl px-4 py-3 text-left transition-colors"
      >
        <span className="font-semibold text-white truncate">
          {displaySymbol} <span className="text-gray-400 font-normal text-sm">— {displayName}</span>
        </span>
        <ChevronDown size={16} className={`text-gray-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full bg-[#131825] border border-[#2a3045] rounded-xl shadow-2xl overflow-hidden">
          <div className="p-3 border-b border-[#2a3045] flex items-center gap-2">
            <Search size={14} className="text-gray-500 shrink-0" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search..."
              className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-500 outline-none"
            />
            {q && <button onClick={() => setQ("")}><X size={12} className="text-gray-500" /></button>}
          </div>
          <div className="max-h-64 overflow-y-auto">
            {includeCrypto && filteredCryptos.length > 0 && (
              <>
                <p className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-widest text-gray-500">Crypto</p>
                {filteredCryptos.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => { onSelect({ type: "crypto", data: c }); setOpen(false); setQ(""); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#1a2035] text-left transition-colors"
                  >
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                    <span className="text-white text-sm font-medium">{c.symbol}</span>
                    <span className="text-gray-400 text-xs">{c.name}</span>
                  </button>
                ))}
              </>
            )}
            {filteredFiats.length > 0 && (
              <>
                <p className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-widest text-gray-500">Fiat</p>
                {filteredFiats.map((f) => (
                  <button
                    key={f.symbol}
                    type="button"
                    onClick={() => { onSelect({ type: "fiat", data: f }); setOpen(false); setQ(""); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#1a2035] text-left transition-colors"
                  >
                    <span className="text-white text-sm font-medium">{f.symbol}</span>
                    <span className="text-gray-400 text-xs">{f.name}</span>
                    <span className="ml-auto text-gray-500 text-xs">{f.sign}</span>
                  </button>
                ))}
              </>
            )}
            {filteredFiats.length === 0 && (!includeCrypto || filteredCryptos.length === 0) && (
              <p className="px-3 py-6 text-center text-gray-500 text-sm">No results</p>
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
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
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
        className="flex items-center gap-2 shrink-0 my-1.5 mr-1.5 px-3 bg-[#131825] hover:bg-[#1a2540] border border-[#2a3045] hover:border-[#3a4060] rounded-lg transition-colors"
      >
        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: selected.color }} />
        <span className="font-bold text-white text-sm whitespace-nowrap">{selected.symbol}</span>
        <ChevronDown
          size={13}
          className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown — rendered in document flow via fixed positioning */}
      {open && (
        <div
          ref={dropRef}
          className="fixed z-200 w-64 bg-[#131825] border border-[#2a3045] rounded-xl shadow-2xl overflow-hidden"
          style={{ top: dropStyle.top, right: dropStyle.right }}
        >
          <div className="p-3 border-b border-[#2a3045] flex items-center gap-2">
            <Search size={13} className="text-gray-500 shrink-0" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search crypto..."
              className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-500 outline-none"
            />
            {q && (
              <button type="button" onClick={() => setQ("")}>
                <X size={12} className="text-gray-500" />
              </button>
            )}
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filtered.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => { onSelect(c); setOpen(false); setQ(""); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#1a2035] text-left transition-colors"
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                <span className="text-white text-sm font-medium">{c.symbol}</span>
                <span className="text-gray-400 text-xs">{c.name}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-3 py-6 text-center text-gray-500 text-sm">No results</p>
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
    <div className="bg-[#0d1117] border border-[#1e2535] rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-[#1e2535]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-lg leading-tight" style={{ color: '#ffffff' }}>
              Crypto Converter
            </h2>
            <p className="text-gray-500 text-xs mt-0.5">Live prices · Auto-refresh 5s</p>
          </div>
          <button
            onClick={fetchPrices}
            className="p-2 rounded-lg hover:bg-[#1a2035] transition-colors"
            title="Refresh"
          >
            <RefreshCw size={14} className={`text-gray-400 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-4">
        {/* Amount + From — single row */}
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-1.5">You Send</p>
          <div className="flex items-stretch bg-[#1a1f2e] border border-[#2a3045] rounded-xl transition-colors focus-within:border-[#3a4060]">
            <input
              type="number"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 bg-transparent text-white font-semibold text-xl outline-none placeholder:text-gray-600 min-w-0 px-4 py-3"
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
            className="p-2.5 rounded-full bg-[#1a1f2e] border border-[#2a3045] hover:border-[#3a4060] hover:bg-[#1e2540] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Swap currencies"
          >
            <ArrowUpDown size={16} className="text-gray-400" />
          </button>
        </div>

        <CurrencyDropdown
          label="To"
          selected={toCurrency}
          onSelect={(v) => setToCurrency(v as ToCurrency)}
          includeCrypto
        />

        {/* Result */}
        <div className="bg-linear-to-br from-[#1a1f2e] to-[#141928] border border-[#2a3045] rounded-xl p-5 text-center">
          {loading && !prices ? (
            <div className="space-y-2">
              <div className="h-9 bg-[#2a3045] rounded-lg animate-pulse mx-auto w-48" />
              <div className="h-4 bg-[#2a3045] rounded animate-pulse mx-auto w-32" />
            </div>
          ) : prices ? (
            <>
              <p className="text-3xl font-black text-white leading-tight" style={{ color: '#ffffff' }}>
                {toCurrency.type === "fiat" ? toCurrency.data.sign : ""}
                {formatNumber(converted)}{" "}
                <span className="text-gray-400 font-normal text-xl">{toSign}</span>
              </p>
              <p className="text-gray-500 text-xs mt-2">
                1 {fromToken.symbol} = {toCurrency.type === "fiat" ? toCurrency.data.sign : ""}
                {formatNumber(rate)} {toSign}
              </p>
              {change24h !== null && (
                <p className={`text-xs mt-1.5 font-medium ${isPositive ? "text-green-400" : "text-red-400"}`}>
                  {isPositive ? "+" : ""}{change24h.toFixed(2)}% (24h)
                </p>
              )}
              {stale && (
                <p className="text-xs text-yellow-600 mt-1">Reconnecting…</p>
              )}
            </>
          ) : (
            <p className="text-gray-500 text-sm">Fetching price…</p>
          )}
        </div>

        {lastUpdated && (
          <p className="text-center text-[10px] text-gray-600">
            Updated {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
}
