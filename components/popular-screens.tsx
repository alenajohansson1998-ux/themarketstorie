import React, { useEffect, useRef } from "react";

export function PopularScreens() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Remove any previous widget script if present
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
      const widgetDiv = document.createElement("div");
      widgetDiv.className = "tradingview-widget-container__widget";
      containerRef.current.appendChild(widgetDiv);

      const script = document.createElement("script");
      script.type = "text/javascript";
      script.async = true;
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js";
      script.innerHTML = `{
        "lineWidth": 2,
        "lineType": 0,
        "chartType": "line",
        "showVolume": true,
        "fontColor": "rgb(106, 109, 120)",
        "gridLineColor": "rgba(46, 46, 46, 0.06)",
        "volumeUpColor": "rgba(34, 171, 148, 0.5)",
        "volumeDownColor": "rgba(247, 82, 95, 0.5)",
        "backgroundColor": "#ffffff",
        "widgetFontColor": "#0F0F0F",
        "upColor": "#22ab94",
        "downColor": "#f7525f",
        "borderUpColor": "#22ab94",
        "borderDownColor": "#f7525f",
        "wickUpColor": "#22ab94",
        "wickDownColor": "#f7525f",
        "colorTheme": "light",
        "isTransparent": false,
        "locale": "en",
        "chartOnly": false,
        "scalePosition": "right",
        "scaleMode": "Normal",
        "fontFamily": "-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif",
        "valuesTracking": "0",
        "changeMode": "price-and-percent",
        "symbols": [
          ["Google", "NASDAQ:GOOGL|1D"],
          ["Microsoft", "NASDAQ:MSFT|1D"]
        ],
        "dateRanges": [
          "1d|1",
          "1m|30",
          "3m|60",
          "12m|1D",
          "60m|1W",
          "all|1M"
        ],
        "fontSize": "10",
        "headerFontSize": "medium",
        "autosize": true,
        "width": "100%",
        "height": "100%",
        "noTimeScale": false,
        "hideDateRanges": false,
        "hideMarketStatus": false,
        "hideSymbolLogo": false
      }`;
      widgetDiv.appendChild(script);
    }
  }, []);

  return (
    <div className="tradingview-widget-container" ref={containerRef} style={{ width: '100%', height: '20px', minHeight: 200 }}>
      {/* Widget will be injected here */}
      <div className="tradingview-widget-copyright" style={{ marginTop: 8, fontSize: 12 }}>
        <a href="https://www.tradingview.com/symbols/NASDAQ-GOOGL/" rel="noopener nofollow" target="_blank">
          <span className="blue-text">Google</span>
        </a>
        <span className="and">&nbsp;and&nbsp;</span>
        <a href="https://www.tradingview.com/symbols/NASDAQ-MSFT/" rel="noopener nofollow" target="_blank">
          <span className="blue-text">Microsoft stock price</span>
        </a>
        <span className="trademark">&nbsp;by TradingView</span>
      </div>
    </div>
  );
}
