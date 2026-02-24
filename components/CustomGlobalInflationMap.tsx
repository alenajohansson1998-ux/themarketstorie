"use client";
import { useEffect, useRef } from "react";
export default function CustomGlobalInflationMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!containerRef.current) return;
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-macro-map.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      colorTheme: "light",
      isTransparent: true,
      width: "100%",
      height: 500,
      locale: "en",
      mapType: "inflation"
    });
    containerRef.current.appendChild(script);
    return () => {
      containerRef.current!.innerHTML = "";
    };
  }, []);
  return (
    <section className="w-full bg-white rounded-xl p-4 shadow">
      <h2 className="text-xl font-semibold mb-3">Global Inflation Map</h2>
      <div ref={containerRef} />
    </section>
  );
}
