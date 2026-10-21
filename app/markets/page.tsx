"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import SegmentedControl from "@/components/SegmentedControl";
import { useColorScheme } from "@/lib/useColorScheme";

const WorldMarketHeatMap = dynamic(() => import("@/components/WorldMarketHeatMap"), { ssr: false });

type SymbolGroup = { name: string; symbols: { name: string; displayName: string }[] };

function TradingViewEmbed({
  widgetType,
  options,
  height,
  title,
}: {
  widgetType: string;
  options: Record<string, unknown>;
  height: number;
  title: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scheme = useColorScheme();
  const config = JSON.stringify({
    ...(widgetType === "market-overview" ? WIDGET_COLORS[scheme] : {}),
    ...options,
    colorTheme: scheme,
    isTransparent: true,
    locale: "en",
    width: "100%",
    height,
  });

  const injected = useRef<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    // Re-inject only when the widget actually changes; a repeat run would orphan the loading script.
    if (!container || injected.current === config) return;
    injected.current = config;
    container.innerHTML = "";
    const widget = document.createElement("div");
    widget.className = "tradingview-widget-container__widget";
    container.appendChild(widget);
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.src = `https://s3.tradingview.com/external-embedding/embed-widget-${widgetType}.js`;
    script.innerHTML = config;
    container.appendChild(script);
  }, [widgetType, config]);

  return (
    <div
      ref={containerRef}
      aria-label={title}
      role="region"
      className="tradingview-widget-container w-full overflow-hidden rounded-card border border-line-soft"
      style={{ height }}
    />
  );
}

// The market-overview widget reads its lists from `tabs` ({ s: symbol, d: label }).
function overview(groups: SymbolGroup[]) {
  return {
    dateRange: "12M",
    showChart: true,
    largeChartUrl: "",
    showSymbolLogo: true,
    showFloatingTooltip: true,
    tabs: groups.map((group) => ({
      title: group.name,
      originalTitle: group.name,
      symbols: group.symbols.map((symbol) => ({ s: symbol.name, d: symbol.displayName })),
    })),
  };
}

const WIDGET_COLORS = {
  light: {
    plotLineColorGrowing: "#1a7f37",
    plotLineColorFalling: "#cf222e",
    belowLineFillColorGrowing: "rgba(26, 127, 55, 0.12)",
    belowLineFillColorFalling: "rgba(207, 34, 46, 0.12)",
    belowLineFillColorGrowingBottom: "rgba(26, 127, 55, 0)",
    belowLineFillColorFallingBottom: "rgba(207, 34, 46, 0)",
    gridLineColor: "rgba(0, 0, 0, 0.05)",
    scaleFontColor: "#6e6e73",
    symbolActiveColor: "rgba(0, 102, 204, 0.08)",
  },
  dark: {
    plotLineColorGrowing: "#30d158",
    plotLineColorFalling: "#ff6961",
    belowLineFillColorGrowing: "rgba(48, 209, 88, 0.14)",
    belowLineFillColorFalling: "rgba(255, 105, 97, 0.14)",
    belowLineFillColorGrowingBottom: "rgba(48, 209, 88, 0)",
    belowLineFillColorFallingBottom: "rgba(255, 105, 97, 0)",
    gridLineColor: "rgba(255, 255, 255, 0.06)",
    scaleFontColor: "#a1a1a6",
    symbolActiveColor: "rgba(41, 151, 255, 0.14)",
  },
};

const TABS: { id: string; label: string; description: string; groups?: SymbolGroup[] }[] = [
  {
    id: "indices",
    label: "Indices",
    description: "Major stock indices in the US, India, Europe, Asia-Pacific and emerging markets.",
    groups: [
      { name: "US", symbols: [
        { name: "NASDAQ:NDX", displayName: "Nasdaq 100" },
        { name: "NYSE:SPY", displayName: "S&P 500" },
        { name: "TVC:DJI", displayName: "Dow Jones" },
        { name: "AMEX:IWM", displayName: "Russell 2000" },
        { name: "CBOE:VIX", displayName: "VIX" },
      ] },
      { name: "India", symbols: [
        { name: "BSE:SENSEX", displayName: "Sensex" },
        { name: "NSE:NIFTY", displayName: "Nifty 50" },
        { name: "NSE:BANKNIFTY", displayName: "Bank Nifty" },
        { name: "NSE:NIFTYMIDCAP100", displayName: "Nifty Midcap 100" },
        { name: "NSE:NIFTYIT", displayName: "Nifty IT" },
      ] },
      { name: "Europe", symbols: [
        { name: "INDEX:FTSE", displayName: "FTSE 100" },
        { name: "INDEX:DAX", displayName: "DAX" },
        { name: "INDEX:CAC40", displayName: "CAC 40" },
        { name: "INDEX:SMI", displayName: "SMI" },
        { name: "INDEX:AEX", displayName: "AEX" },
      ] },
      { name: "Asia-Pacific", symbols: [
        { name: "INDEX:NIKKEI", displayName: "Nikkei 225" },
        { name: "INDEX:HSI", displayName: "Hang Seng" },
        { name: "INDEX:KOSPI", displayName: "KOSPI" },
        { name: "ASX:XJO", displayName: "ASX 200" },
        { name: "INDEX:STI", displayName: "Straits Times" },
      ] },
      { name: "Middle East & EM", symbols: [
        { name: "TADAWUL:TASI", displayName: "Saudi TASI" },
        { name: "INDEX:DFMGI", displayName: "Dubai DFM" },
        { name: "INDEX:EGX30", displayName: "Egypt EGX30" },
        { name: "BMFBOVESPA:IBOV", displayName: "Brazil Ibovespa" },
      ] },
    ],
  },
  {
    id: "stocks",
    label: "Stocks",
    description: "Large-cap leaders in US tech, finance and healthcare, and India’s biggest companies.",
    groups: [
      { name: "Big Tech", symbols: [
        { name: "NASDAQ:GOOGL", displayName: "Google" },
        { name: "NASDAQ:MSFT", displayName: "Microsoft" },
        { name: "NASDAQ:AAPL", displayName: "Apple" },
        { name: "NASDAQ:META", displayName: "Meta" },
        { name: "NASDAQ:AMZN", displayName: "Amazon" },
        { name: "NASDAQ:NVDA", displayName: "NVIDIA" },
        { name: "NASDAQ:TSLA", displayName: "Tesla" },
        { name: "NASDAQ:NFLX", displayName: "Netflix" },
      ] },
      { name: "Finance", symbols: [
        { name: "NYSE:JPM", displayName: "JPMorgan" },
        { name: "NYSE:BAC", displayName: "Bank of America" },
        { name: "NYSE:GS", displayName: "Goldman Sachs" },
        { name: "NYSE:V", displayName: "Visa" },
        { name: "NYSE:MA", displayName: "Mastercard" },
        { name: "NYSE:BRK.B", displayName: "Berkshire B" },
      ] },
      { name: "Healthcare", symbols: [
        { name: "NYSE:JNJ", displayName: "J&J" },
        { name: "NYSE:UNH", displayName: "UnitedHealth" },
        { name: "NYSE:PFE", displayName: "Pfizer" },
        { name: "NASDAQ:MRNA", displayName: "Moderna" },
        { name: "NYSE:LLY", displayName: "Eli Lilly" },
        { name: "NASDAQ:ABBV", displayName: "AbbVie" },
      ] },
      { name: "India", symbols: [
        { name: "BSE:RELIANCE", displayName: "Reliance" },
        { name: "BSE:TCS", displayName: "TCS" },
        { name: "BSE:INFY", displayName: "Infosys" },
        { name: "BSE:HDFCBANK", displayName: "HDFC Bank" },
        { name: "BSE:WIPRO", displayName: "Wipro" },
        { name: "BSE:ICICIBANK", displayName: "ICICI Bank" },
      ] },
    ],
  },
  {
    id: "crypto",
    label: "Crypto",
    description: "Large-cap, mid-cap and meme coins, priced in USDT.",
    groups: [
      { name: "Large cap", symbols: [
        { name: "BINANCE:BTCUSDT", displayName: "Bitcoin" },
        { name: "BINANCE:ETHUSDT", displayName: "Ethereum" },
        { name: "BINANCE:BNBUSDT", displayName: "BNB" },
        { name: "BINANCE:SOLUSDT", displayName: "Solana" },
        { name: "BINANCE:XRPUSDT", displayName: "XRP" },
        { name: "BINANCE:ADAUSDT", displayName: "Cardano" },
      ] },
      { name: "Mid cap", symbols: [
        { name: "BINANCE:DOGEUSDT", displayName: "Dogecoin" },
        { name: "BINANCE:AVAXUSDT", displayName: "Avalanche" },
        { name: "BINANCE:DOTUSDT", displayName: "Polkadot" },
        { name: "BINANCE:LINKUSDT", displayName: "Chainlink" },
        { name: "BINANCE:MATICUSDT", displayName: "Polygon" },
        { name: "BINANCE:UNIUSDT", displayName: "Uniswap" },
      ] },
      { name: "Meme coins", symbols: [
        { name: "BINANCE:SHIBUSDT", displayName: "Shiba Inu" },
        { name: "BINANCE:PEPEUSDT", displayName: "Pepe" },
        { name: "BINANCE:WIFUSDT", displayName: "dogwifhat" },
        { name: "BINANCE:BONKUSDT", displayName: "Bonk" },
      ] },
    ],
  },
  {
    id: "commodities",
    label: "Commodities",
    description: "Front-month futures for metals, energy and agriculture.",
    groups: [
      { name: "Metals", symbols: [
        { name: "COMEX:GC1!", displayName: "Gold" },
        { name: "COMEX:SI1!", displayName: "Silver" },
        { name: "COMEX:HG1!", displayName: "Copper" },
        { name: "NYMEX:PL1!", displayName: "Platinum" },
      ] },
      { name: "Energy", symbols: [
        { name: "NYMEX:CL1!", displayName: "Crude Oil (WTI)" },
        { name: "TVC:UKOIL", displayName: "Brent Crude" },
        { name: "NYMEX:NG1!", displayName: "Natural Gas" },
        { name: "NYMEX:RB1!", displayName: "Gasoline" },
      ] },
      { name: "Agriculture", symbols: [
        { name: "CBOT:ZC1!", displayName: "Corn" },
        { name: "CBOT:ZW1!", displayName: "Wheat" },
        { name: "CBOT:ZS1!", displayName: "Soybeans" },
        { name: "NYMEX:SB1!", displayName: "Sugar" },
      ] },
    ],
  },
  {
    id: "bonds",
    label: "Bonds",
    description: "Government bond yields across the US curve and other major economies.",
    groups: [
      { name: "US Treasuries", symbols: [
        { name: "TVC:US02Y", displayName: "US 2Y" },
        { name: "TVC:US05Y", displayName: "US 5Y" },
        { name: "TVC:US10Y", displayName: "US 10Y" },
        { name: "TVC:US30Y", displayName: "US 30Y" },
      ] },
      { name: "Global", symbols: [
        { name: "TVC:DE10Y", displayName: "Germany 10Y" },
        { name: "TVC:GB10Y", displayName: "UK 10Y" },
        { name: "TVC:JP10Y", displayName: "Japan 10Y" },
        { name: "TVC:IN10Y", displayName: "India 10Y" },
        { name: "TVC:CN10Y", displayName: "China 10Y" },
      ] },
    ],
  },
  {
    id: "etfs",
    label: "ETFs",
    description: "Broad-market, sector and spot-bitcoin ETFs.",
    groups: [
      { name: "US equity", symbols: [
        { name: "AMEX:SPY", displayName: "SPDR S&P 500" },
        { name: "AMEX:QQQ", displayName: "Invesco QQQ" },
        { name: "AMEX:VTI", displayName: "Vanguard Total Market" },
        { name: "AMEX:IWM", displayName: "iShares Russell 2000" },
        { name: "AMEX:DIA", displayName: "SPDR Dow Jones" },
      ] },
      { name: "Sector", symbols: [
        { name: "AMEX:XLK", displayName: "Tech Select" },
        { name: "AMEX:XLF", displayName: "Financials Select" },
        { name: "AMEX:XLE", displayName: "Energy Select" },
        { name: "AMEX:XLV", displayName: "Health Care Select" },
        { name: "AMEX:XLI", displayName: "Industrials Select" },
      ] },
      { name: "Bitcoin", symbols: [
        { name: "NASDAQ:IBIT", displayName: "iShares Bitcoin" },
        { name: "AMEX:FBTC", displayName: "Fidelity Bitcoin" },
        { name: "AMEX:ARKB", displayName: "ARK Bitcoin" },
        { name: "AMEX:BITB", displayName: "Bitwise Bitcoin" },
      ] },
    ],
  },
  {
    id: "forex",
    label: "Forex",
    description: "Major, Asian, emerging-market and Middle East currency pairs against the dollar.",
    groups: [
      { name: "Majors", symbols: [
        { name: "FX:EURUSD", displayName: "EUR/USD" },
        { name: "FX:GBPUSD", displayName: "GBP/USD" },
        { name: "FX:USDJPY", displayName: "USD/JPY" },
        { name: "FX:USDCHF", displayName: "USD/CHF" },
        { name: "FX:AUDUSD", displayName: "AUD/USD" },
        { name: "FX:USDCAD", displayName: "USD/CAD" },
      ] },
      { name: "Asia & EM", symbols: [
        { name: "FX:USDINR", displayName: "USD/INR" },
        { name: "FX:USDCNY", displayName: "USD/CNY" },
        { name: "FX:USDSGD", displayName: "USD/SGD" },
        { name: "FX:USDHKD", displayName: "USD/HKD" },
        { name: "FX:USDKRW", displayName: "USD/KRW" },
        { name: "FX:USDBRL", displayName: "USD/BRL" },
      ] },
      { name: "Middle East", symbols: [
        { name: "FX:USDAED", displayName: "USD/AED" },
        { name: "FX:USDSAR", displayName: "USD/SAR" },
        { name: "FX:USDTRY", displayName: "USD/TRY" },
        { name: "FX:USDPKR", displayName: "USD/PKR" },
      ] },
    ],
  },
  { id: "calendar", label: "Calendar", description: "This week’s economic releases and a heatmap of US stocks." },
  { id: "world", label: "World", description: "Today’s move in each country’s main market, on a live globe." },
];

const TAB_IDS = new Set(TABS.map((tab) => tab.id));

export default function MarketsPage() {
  const [tab, setTab] = useState("indices");

  // Read the initial tab from the URL (?tab=crypto) without needing a Suspense boundary.
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("tab");
    if (fromUrl && TAB_IDS.has(fromUrl)) setTab(fromUrl);
  }, []);

  function selectTab(id: string) {
    setTab(id);
    const url = new URL(window.location.href);
    if (id === "indices") url.searchParams.delete("tab");
    else url.searchParams.set("tab", id);
    window.history.replaceState(null, "", url.toString());
  }

  const active = TABS.find((item) => item.id === tab) ?? TABS[0];

  return (
    <div className="site-container px-4 py-10 md:px-6 lg:py-12">
      <header className="mb-8 max-w-3xl">
        <p className="section-label">Markets</p>
        <h1 className="mt-1 text-title1 text-ink">Markets, everywhere</h1>
        <p className="mt-3 text-title3 font-normal text-ink-2">
          Live prices and charts for indices, stocks, crypto, commodities, bonds, ETFs and currencies.
        </p>
      </header>

      <SegmentedControl label="Market" idPrefix="markets" segments={TABS} value={active.id} onChange={selectTab} />

      <section
        id="markets-panel"
        role="tabpanel"
        aria-labelledby={`markets-tab-${active.id}`}
        className="mt-6"
      >
        <p className="mb-4 max-w-3xl text-body text-ink-2">{active.description}</p>

        {active.groups ? (
          <TradingViewEmbed
            key={active.id}
            title={`${active.label} overview`}
            widgetType="market-overview"
            height={560}
            options={overview(active.groups)}
          />
        ) : null}

        {active.id === "calendar" ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <h2 className="mb-3 text-headline text-ink">Economic calendar</h2>
              <TradingViewEmbed
                title="Economic calendar"
                widgetType="events"
                height={520}
                options={{ importanceFilter: "0,1", currencyFilter: "USD,EUR,INR,JPY,GBP" }}
              />
            </div>
            <div>
              <h2 className="mb-3 text-headline text-ink">US stock heatmap</h2>
              <TradingViewEmbed title="US stock heatmap" widgetType="stock-heatmap" height={520} options={{ dataSource: "SPX500", grouping: "sector", blockSize: "market_cap_basic", blockColor: "change" }} />
            </div>
          </div>
        ) : null}

        {active.id === "world" ? (
          <div className="mx-auto max-w-2xl">
            <WorldMarketHeatMap />
          </div>
        ) : null}

        <p className="mt-3 text-footnote text-ink-2">Market data by TradingView. Prices may be delayed.</p>
      </section>
    </div>
  );
}
