"use client";
import * as React from "react";
import Head from "next/head";
const { useRef, useEffect } = React;

interface TradingViewWidgetProps {
  widgetType: string;
  options: any;
  height?: number;
}
function TradingViewWidget({ widgetType, options, height = 400 }: TradingViewWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.src = `https://s3.tradingview.com/external-embedding/embed-widget-${widgetType}.js`;
    script.innerHTML = JSON.stringify(options);
    containerRef.current.appendChild(script);
  }, [widgetType, options]);
  return <div ref={containerRef} style={{ width: "100%", height }} />;
}

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
}
function SectionCard({ title, children }: SectionCardProps) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <div className="bg-white rounded-lg shadow p-4">{children}</div>
    </section>
  );
}

export default function MarketsPageWrapper() {
  return (
    <>
      <Head>
        <link rel="canonical" href="https://themarketstories.com/markets" />
      </Head>
      <MarketsPage />
    </>
  );
}

function EconomicCalendarWidget() {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-events.js";
    script.innerHTML = JSON.stringify({
      width: "100%",
      height: "400",
      locale: "en",
      importanceFilter: "0,1",
      currencyFilter: "USD,EUR,INR,JPY,GBP",
      colorTheme: "light",
      isTransparent: false
    });
    containerRef.current.appendChild(script);
  }, []);
  return <div ref={containerRef} style={{ width: "100%", height: 400 }} />;
}

export function MarketsPage() {
  return (
          <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
            {/* Header */}
            <section className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold">Markets, everywhere</h1>
            </section>

            {/* Equities & Indices */}
            <SectionCard title="Equities & Indices">
              <TradingViewWidget
                widgetType="market-overview"
                height={400}
                options={{
                  colorTheme: "light",
                  dateRange: "12M",
                  showChart: true,
                  locale: "en",
                  largeChartUrl: "",
                  isTransparent: false,
                  showSymbolLogo: true,
                  width: "100%",
                  height: "400",
                  symbolsGroups: [
                    {
                      name: "Indices",
                      symbols: [
                        { name: "NASDAQ:NDX", displayName: "Nasdaq 100" },
                        { name: "NYSE:SPY", displayName: "S&P 500" },
                        { name: "BSE:SENSEX", displayName: "Sensex" },
                        { name: "NSE:NIFTY", displayName: "Nifty 50" }
                      ]
                    }
                  ]
                }}
              />
            </SectionCard>

            {/* World Indices */}
            <SectionCard title="World Indices">
              <TradingViewWidget
                widgetType="market-overview"
                height={400}
                options={{
                  colorTheme: "light",
                  dateRange: "12M",
                  showChart: true,
                  locale: "en",
                  largeChartUrl: "",
                  isTransparent: false,
                  showSymbolLogo: true,
                  width: "100%",
                  height: "400",
                  symbolsGroups: [
                    {
                      name: "World Indices",
                      symbols: [
                        { name: "INDEX:FTSE", displayName: "FTSE 100" },
                        { name: "INDEX:DAX", displayName: "DAX" },
                        { name: "INDEX:NIKKEI", displayName: "Nikkei 225" },
                        { name: "INDEX:HSI", displayName: "Hang Seng" }
                      ]
                    }
                  ]
                }}
              />
            </SectionCard>

            {/* Crypto */}
            <SectionCard title="Crypto">
              <TradingViewWidget
                widgetType="market-overview"
                height={400}
                options={{
                  colorTheme: "light",
                  dateRange: "12M",
                  showChart: true,
                  locale: "en",
                  largeChartUrl: "",
                  isTransparent: false,
                  showSymbolLogo: true,
                  width: "100%",
                  height: "400",
                  symbolsGroups: [
                    {
                      name: "Crypto",
                      symbols: [
                        { name: "BINANCE:BTCUSDT", displayName: "Bitcoin" },
                        { name: "BINANCE:ETHUSDT", displayName: "Ethereum" },
                        { name: "BINANCE:SOLUSDT", displayName: "Solana" },
                        { name: "BINANCE:XRPUSDT", displayName: "XRP" }
                      ]
                    }
                  ]
                }}
              />
            </SectionCard>

            {/* Futures & Commodities */}
            <SectionCard title="Futures & Commodities">
              <TradingViewWidget
                widgetType="market-overview"
                height={400}
                options={{
                  colorTheme: "light",
                  dateRange: "12M",
                  showChart: true,
                  locale: "en",
                  largeChartUrl: "",
                  isTransparent: false,
                  showSymbolLogo: true,
                  width: "100%",
                  height: "400",
                  symbolsGroups: [
                    {
                      name: "Futures & Commodities",
                      symbols: [
                        { name: "COMEX:GC1!", displayName: "Gold" },
                        { name: "NYMEX:CL1!", displayName: "Crude Oil" },
                        { name: "CBOT:ZC1!", displayName: "Corn" },
                        { name: "NYMEX:NG1!", displayName: "Natural Gas" }
                      ]
                    }
                  ]
                }}
              />
            </SectionCard>

            {/* Government Bonds */}
            <SectionCard title="Government Bonds">
              <TradingViewWidget
                widgetType="market-overview"
                height={400}
                options={{
                  colorTheme: "light",
                  dateRange: "12M",
                  showChart: true,
                  locale: "en",
                  largeChartUrl: "",
                  isTransparent: false,
                  showSymbolLogo: true,
                  width: "100%",
                  height: "400",
                  symbolsGroups: [
                    {
                      name: "Government Bonds",
                      symbols: [
                        { name: "TVC:US10Y", displayName: "US 10Y" },
                        { name: "TVC:US30Y", displayName: "US 30Y" },
                        { name: "TVC:DE10Y", displayName: "Germany 10Y" },
                        { name: "TVC:JP10Y", displayName: "Japan 10Y" }
                      ]
                    }
                  ]
                }}
              />
            </SectionCard>

            {/* Corporate Bonds */}
            <SectionCard title="Corporate Bonds">
              <TradingViewWidget
                widgetType="market-overview"
                height={400}
                options={{
                  colorTheme: "light",
                  dateRange: "12M",
                  showChart: true,
                  locale: "en",
                  largeChartUrl: "",
                  isTransparent: false,
                  showSymbolLogo: true,
                  width: "100%",
                  height: "400",
                  symbolsGroups: [
                    {
                      name: "Corporate Bonds",
                      symbols: [
                        { name: "NASDAQ:GOOGL", displayName: "Google" },
                        { name: "NASDAQ:AAPL", displayName: "Apple" },
                        { name: "NASDAQ:MSFT", displayName: "Microsoft" },
                        { name: "NASDAQ:AMZN", displayName: "Amazon" }
                      ]
                    }
                  ]
                }}
              />
            </SectionCard>

            {/* ETFs */}
            <SectionCard title="ETFs">
              <TradingViewWidget
                widgetType="market-overview"
                height={400}
                options={{
                  colorTheme: "light",
                  dateRange: "12M",
                  showChart: true,
                  locale: "en",
                  largeChartUrl: "",
                  isTransparent: false,
                  showSymbolLogo: true,
                  width: "100%",
                  height: "400",
                  symbolsGroups: [
                    {
                      name: "ETFs",
                      symbols: [
                        { name: "AMEX:SPY", displayName: "SPDR S&P 500" },
                        { name: "AMEX:IVV", displayName: "iShares Core S&P 500" },
                        { name: "AMEX:VTI", displayName: "Vanguard Total Stock Market" },
                        { name: "AMEX:QQQ", displayName: "Invesco QQQ" }
                      ]
                    }
                  ]
                }}
              />
            </SectionCard>

            {/* Currencies */}
            <SectionCard title="Currencies">
              <TradingViewWidget
                widgetType="market-overview"
                height={400}
                options={{
                  colorTheme: "light",
                  dateRange: "12M",
                  showChart: true,
                  locale: "en",
                  largeChartUrl: "",
                  isTransparent: false,
                  showSymbolLogo: true,
                  width: "100%",
                  height: "400",
                  symbolsGroups: [
                    {
                      name: "Currencies",
                      symbols: [
                        { name: "FX:USDINR", displayName: "USD/INR" },
                        { name: "FX:EURUSD", displayName: "EUR/USD" },
                        { name: "FX:GBPUSD", displayName: "GBP/USD" },
                        { name: "FX:USDJPY", displayName: "USD/JPY" }
                      ]
                    }
                  ]
                }}
              />
            </SectionCard>

            {/* Economic Calendar & Heatmap */}
            <SectionCard title="Economic Calendar & Heatmap">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <EconomicCalendarWidget />
                <TradingViewWidget
                  widgetType="heatmap"
                  height={400}
                  options={{
                    width: "100%",
                    height: "400",
                    locale: "en",
                    colorTheme: "light",
                    isTransparent: false
                  }}
                />
              </div>
            </SectionCard>

            {/* Global Market Map */}
            <SectionCard title="Global Market Map">
              <div className="flex items-center justify-center h-96 bg-gray-100 rounded">
                <span className="text-gray-400">[Global Market Map Placeholder]</span>
              </div>
            </SectionCard>

            {/* Footer */}
            <footer className="mt-8 text-center text-gray-500 text-sm">
              LOOK FIRST / THEN LEAP.
            </footer>
          </main>
        );
      }