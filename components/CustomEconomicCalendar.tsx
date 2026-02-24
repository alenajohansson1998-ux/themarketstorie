"use client";
import { useEffect, useRef } from "react";
export default function CustomEconomicCalendar() {
  const calendarRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!calendarRef.current) return;
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-events.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      colorTheme: "light",
      isTransparent: true,
      width: "100%",
      height: 320,
      locale: "en",
      importanceFilter: "0,1,2,3"
    });
    calendarRef.current.appendChild(script);
    return () => {
      calendarRef.current!.innerHTML = "";
    };
  }, []);
  return (
    <section className="w-full bg-white rounded-xl p-4 shadow mt-8">
      <h2 className="text-xl font-semibold mb-3">Economic Calendar</h2>
      <div ref={calendarRef} />
    </section>
  );
}
