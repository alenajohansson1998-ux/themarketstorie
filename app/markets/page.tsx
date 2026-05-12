"use client";
import * as React from "react";
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
  return <MarketsPage />;
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
          <main className="site-container px-4 md:px-6 xl:px-8 py-8 space-y-8">
            {/* Header */}
            <section className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold">Markets, everywhere</h1>
            </section>

            {/* Equities & Indices */}
            <SectionCard title="Equities & Indices">
              <TradingViewWidget
                widgetType="market-overview"
                height={500}
                options={{
                  colorTheme: "light",
                  dateRange: "12M",
                  showChart: true,
                  locale: "en",
                  largeChartUrl: "",
                  isTransparent: false,
                  showSymbolLogo: true,
                  width: "100%",
                  height: "500",
                  symbolsGroups: [
                    {
                      name: "US Indices",
                      symbols: [
                        { name: "NASDAQ:NDX", displayName: "Nasdaq 100" },
                        { name: "NYSE:SPY", displayName: "S&P 500" },
                        { name: "TVC:DJI", displayName: "Dow Jones" },
                        { name: "AMEX:IWM", displayName: "Russell 2000" },
                        { name: "CBOE:VIX", displayName: "VIX" }
                      ]
                    },
                    {
                      name: "Indian Indices",
                      symbols: [
                        { name: "BSE:SENSEX", displayName: "Sensex" },
                        { name: "NSE:NIFTY", displayName: "Nifty 50" },
                        { name: "NSE:BANKNIFTY", displayName: "Bank Nifty" },
                        { name: "NSE:NIFTYMIDCAP100", displayName: "Nifty Midcap 100" },
                        { name: "NSE:NIFTYIT", displayName: "Nifty IT" }
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
                height={500}
                options={{
                  colorTheme: "light",
                  dateRange: "12M",
                  showChart: true,
                  locale: "en",
                  largeChartUrl: "",
                  isTransparent: false,
                  showSymbolLogo: true,
                  width: "100%",
                  height: "500",
                  symbolsGroups: [
                    {
                      name: "Europe",
                      symbols: [
                        { name: "INDEX:FTSE", displayName: "FTSE 100" },
                        { name: "INDEX:DAX", displayName: "DAX" },
                        { name: "INDEX:CAC40", displayName: "CAC 40" },
                        { name: "INDEX:SMI", displayName: "SMI" },
                        { name: "INDEX:AEX", displayName: "AEX" }
                      ]
                    },
                    {
                      name: "Asia Pacific",
                      symbols: [
                        { name: "INDEX:NIKKEI", displayName: "Nikkei 225" },
                        { name: "INDEX:HSI", displayName: "Hang Seng" },
                        { name: "INDEX:KOSPI", displayName: "KOSPI" },
                        { name: "ASX:XJO", displayName: "ASX 200" },
                        { name: "INDEX:STI", displayName: "Straits Times" }
                      ]
                    },
                    {
                      name: "Middle East & EM",
                      symbols: [
                        { name: "TADAWUL:TASI", displayName: "Saudi TASI" },
                        { name: "INDEX:DFMGI", displayName: "Dubai DFM" },
                        { name: "INDEX:EGX30", displayName: "Egypt EGX30" },
                        { name: "BMFBOVESPA:IBOV", displayName: "Brazil Ibovespa" }
                      ]
                    }
                  ]
                }}
              />
            </SectionCard>

            {/* Crypto */}
            <SectionCard title="Cryptocurrency">
              <TradingViewWidget
                widgetType="market-overview"
                height={500}
                options={{
                  colorTheme: "light",
                  dateRange: "12M",
                  showChart: true,
                  locale: "en",
                  largeChartUrl: "",
                  isTransparent: false,
                  showSymbolLogo: true,
                  width: "100%",
                  height: "500",
                  symbolsGroups: [
                    {
                      name: "Large Cap",
                      symbols: [
                        { name: "BINANCE:BTCUSDT", displayName: "Bitcoin" },
                        { name: "BINANCE:ETHUSDT", displayName: "Ethereum" },
                        { name: "BINANCE:BNBUSDT", displayName: "BNB" },
                        { name: "BINANCE:SOLUSDT", displayName: "Solana" },
                        { name: "BINANCE:XRPUSDT", displayName: "XRP" },
                        { name: "BINANCE:ADAUSDT", displayName: "Cardano" }
                      ]
                    },
                    {
                      name: "Mid Cap",
                      symbols: [
                        { name: "BINANCE:DOGEUSDT", displayName: "Dogecoin" },
                        { name: "BINANCE:AVAXUSDT", displayName: "Avalanche" },
                        { name: "BINANCE:DOTUSDT", displayName: "Polkadot" },
                        { name: "BINANCE:LINKUSDT", displayName: "Chainlink" },
                        { name: "BINANCE:MATICUSDT", displayName: "Polygon" },
                        { name: "BINANCE:UNIUSDT", displayName: "Uniswap" }
                      ]
                    },
                    {
                      name: "Meme Coins",
                      symbols: [
                        { name: "BINANCE:SHIBUSDT", displayName: "Shiba Inu" },
                        { name: "BINANCE:PEPEUSDT", displayName: "Pepe" },
                        { name: "BINANCE:WIFUSDT", displayName: "dogwifhat" },
                        { name: "BINANCE:BONKUSDT", displayName: "Bonk" }
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
                height={500}
                options={{
                  colorTheme: "light",
                  dateRange: "12M",
                  showChart: true,
                  locale: "en",
                  largeChartUrl: "",
                  isTransparent: false,
                  showSymbolLogo: true,
                  width: "100%",
                  height: "500",
                  symbolsGroups: [
                    {
                      name: "Metals",
                      symbols: [
                        { name: "COMEX:GC1!", displayName: "Gold" },
                        { name: "COMEX:SI1!", displayName: "Silver" },
                        { name: "COMEX:HG1!", displayName: "Copper" },
                        { name: "NYMEX:PL1!", displayName: "Platinum" }
                      ]
                    },
                    {
                      name: "Energy",
                      symbols: [
                        { name: "NYMEX:CL1!", displayName: "Crude Oil (WTI)" },
                        { name: "TVC:UKOIL", displayName: "Brent Crude" },
                        { name: "NYMEX:NG1!", displayName: "Natural Gas" },
                        { name: "NYMEX:RB1!", displayName: "Gasoline" }
                      ]
                    },
                    {
                      name: "Agriculture",
                      symbols: [
                        { name: "CBOT:ZC1!", displayName: "Corn" },
                        { name: "CBOT:ZW1!", displayName: "Wheat" },
                        { name: "CBOT:ZS1!", displayName: "Soybeans" },
                        { name: "NYMEX:SB1!", displayName: "Sugar" }
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
                height={500}
                options={{
                  colorTheme: "light",
                  dateRange: "12M",
                  showChart: true,
                  locale: "en",
                  largeChartUrl: "",
                  isTransparent: false,
                  showSymbolLogo: true,
                  width: "100%",
                  height: "500",
                  symbolsGroups: [
                    {
                      name: "US Treasuries",
                      symbols: [
                        { name: "TVC:US02Y", displayName: "US 2Y" },
                        { name: "TVC:US05Y", displayName: "US 5Y" },
                        { name: "TVC:US10Y", displayName: "US 10Y" },
                        { name: "TVC:US30Y", displayName: "US 30Y" }
                      ]
                    },
                    {
                      name: "Global Bonds",
                      symbols: [
                        { name: "TVC:DE10Y", displayName: "Germany 10Y" },
                        { name: "TVC:GB10Y", displayName: "UK 10Y" },
                        { name: "TVC:JP10Y", displayName: "Japan 10Y" },
                        { name: "TVC:IN10Y", displayName: "India 10Y" },
                        { name: "TVC:CN10Y", displayName: "China 10Y" }
                      ]
                    }
                  ]
                }}
              />
            </SectionCard>

            {/* Top US Stocks */}
            <SectionCard title="Top US Stocks">
              <TradingViewWidget
                widgetType="market-overview"
                height={500}
                options={{
                  colorTheme: "light",
                  dateRange: "12M",
                  showChart: true,
                  locale: "en",
                  largeChartUrl: "",
                  isTransparent: false,
                  showSymbolLogo: true,
                  width: "100%",
                  height: "500",
                  symbolsGroups: [
                    {
                      name: "Big Tech",
                      symbols: [
                        { name: "NASDAQ:GOOGL", displayName: "Google" },
                        { name: "NASDAQ:MSFT", displayName: "Microsoft" },
                        { name: "NASDAQ:AAPL", displayName: "Apple" },
                        { name: "NASDAQ:META", displayName: "Meta" },
                        { name: "NASDAQ:AMZN", displayName: "Amazon" },
                        { name: "NASDAQ:NVDA", displayName: "NVIDIA" },
                        { name: "NASDAQ:TSLA", displayName: "Tesla" },
                        { name: "NASDAQ:NFLX", displayName: "Netflix" }
                      ]
                    },
                    {
                      name: "Finance",
                      symbols: [
                        { name: "NYSE:JPM", displayName: "JPMorgan" },
                        { name: "NYSE:BAC", displayName: "Bank of America" },
                        { name: "NYSE:GS", displayName: "Goldman Sachs" },
                        { name: "NYSE:V", displayName: "Visa" },
                        { name: "NYSE:MA", displayName: "Mastercard" },
                        { name: "NYSE:BRK.B", displayName: "Berkshire B" }
                      ]
                    },
                    {
                      name: "Healthcare",
                      symbols: [
                        { name: "NYSE:JNJ", displayName: "J&J" },
                        { name: "NYSE:UNH", displayName: "UnitedHealth" },
                        { name: "NYSE:PFE", displayName: "Pfizer" },
                        { name: "NASDAQ:MRNA", displayName: "Moderna" },
                        { name: "NYSE:LLY", displayName: "Eli Lilly" },
                        { name: "NASDAQ:ABBV", displayName: "AbbVie" }
                      ]
                    },
                    {
                      name: "Indian Stocks",
                      symbols: [
                        { name: "BSE:RELIANCE", displayName: "Reliance" },
                        { name: "BSE:TCS", displayName: "TCS" },
                        { name: "BSE:INFY", displayName: "Infosys" },
                        { name: "BSE:HDFCBANK", displayName: "HDFC Bank" },
                        { name: "BSE:WIPRO", displayName: "Wipro" },
                        { name: "BSE:ICICIBANK", displayName: "ICICI Bank" }
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
                height={500}
                options={{
                  colorTheme: "light",
                  dateRange: "12M",
                  showChart: true,
                  locale: "en",
                  largeChartUrl: "",
                  isTransparent: false,
                  showSymbolLogo: true,
                  width: "100%",
                  height: "500",
                  symbolsGroups: [
                    {
                      name: "US Equity ETFs",
                      symbols: [
                        { name: "AMEX:SPY", displayName: "SPDR S&P 500" },
                        { name: "AMEX:QQQ", displayName: "Invesco QQQ" },
                        { name: "AMEX:VTI", displayName: "Vanguard Total Market" },
                        { name: "AMEX:IWM", displayName: "iShares Russell 2000" },
                        { name: "AMEX:DIA", displayName: "SPDR Dow Jones" }
                      ]
                    },
                    {
                      name: "Sector ETFs",
                      symbols: [
                        { name: "AMEX:XLK", displayName: "Tech Select" },
                        { name: "AMEX:XLF", displayName: "Financials Select" },
                        { name: "AMEX:XLE", displayName: "Energy Select" },
                        { name: "AMEX:XLV", displayName: "Health Care Select" },
                        { name: "AMEX:XLI", displayName: "Industrials Select" }
                      ]
                    },
                    {
                      name: "Crypto ETFs",
                      symbols: [
                        { name: "NASDAQ:IBIT", displayName: "iShares Bitcoin" },
                        { name: "AMEX:FBTC", displayName: "Fidelity Bitcoin" },
                        { name: "AMEX:ARKB", displayName: "ARK Bitcoin" },
                        { name: "AMEX:BITB", displayName: "Bitwise Bitcoin" }
                      ]
                    }
                  ]
                }}
              />
            </SectionCard>

            {/* Currencies */}
            <SectionCard title="Currencies & Forex">
              <TradingViewWidget
                widgetType="market-overview"
                height={500}
                options={{
                  colorTheme: "light",
                  dateRange: "12M",
                  showChart: true,
                  locale: "en",
                  largeChartUrl: "",
                  isTransparent: false,
                  showSymbolLogo: true,
                  width: "100%",
                  height: "500",
                  symbolsGroups: [
                    {
                      name: "Majors",
                      symbols: [
                        { name: "FX:EURUSD", displayName: "EUR/USD" },
                        { name: "FX:GBPUSD", displayName: "GBP/USD" },
                        { name: "FX:USDJPY", displayName: "USD/JPY" },
                        { name: "FX:USDCHF", displayName: "USD/CHF" },
                        { name: "FX:AUDUSD", displayName: "AUD/USD" },
                        { name: "FX:USDCAD", displayName: "USD/CAD" }
                      ]
                    },
                    {
                      name: "Asian & EM",
                      symbols: [
                        { name: "FX:USDINR", displayName: "USD/INR" },
                        { name: "FX:USDCNY", displayName: "USD/CNY" },
                        { name: "FX:USDSGD", displayName: "USD/SGD" },
                        { name: "FX:USDHKD", displayName: "USD/HKD" },
                        { name: "FX:USDKRW", displayName: "USD/KRW" },
                        { name: "FX:USDBRL", displayName: "USD/BRL" }
                      ]
                    },
                    {
                      name: "Middle East",
                      symbols: [
                        { name: "FX:USDAED", displayName: "USD/AED" },
                        { name: "FX:USDSAR", displayName: "USD/SAR" },
                        { name: "FX:USDTRY", displayName: "USD/TRY" },
                        { name: "FX:USDPKR", displayName: "USD/PKR" }
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