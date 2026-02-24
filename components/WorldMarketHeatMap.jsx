"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { scaleLinear } from "d3-scale";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const DOMAIN_MIN = -3;
const DOMAIN_MAX = 3;
const ISO_NUMERIC_TO_A2 = {
  "36": "AU",
  "76": "BR",
  "124": "CA",
  "156": "CN",
  "250": "FR",
  "276": "DE",
  "356": "IN",
  "392": "JP",
  "410": "KR",
  "484": "MX",
  "826": "GB",
  "840": "US",
};

function getCountryCode(geo) {
  const numericId = geo?.id;
  const properties = geo?.properties || {};
  const normalizedNumericId =
    numericId !== undefined && numericId !== null && `${numericId}` !== ""
      ? String(Number(numericId))
      : "";
  if (normalizedNumericId && ISO_NUMERIC_TO_A2[normalizedNumericId]) {
    return ISO_NUMERIC_TO_A2[normalizedNumericId];
  }

  return properties?.ISO_A2 || properties?.iso_a2 || properties?.ADM0_A3_US || properties?.iso2 || "";
}

function getCountryName(properties) {
  return (
    properties?.NAME ||
    properties?.NAME_EN ||
    properties?.name ||
    properties?.ADMIN ||
    "Unknown"
  );
}

function shouldRenderCountry(geo) {
  const numericId =
    geo?.id !== undefined && geo?.id !== null && `${geo.id}` !== ""
      ? String(Number(geo.id))
      : "";
  const name = String(getCountryName(geo?.properties || {})).toLowerCase();
  return numericId !== "10" && name !== "antarctica";
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatChange(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "No data";
  const sign = number > 0 ? "+" : "";
  return `${sign}${number.toFixed(2)}%`;
}

export default function WorldMarketHeatMap() {
  const [geoData, setGeoData] = useState(null);
  const [marketData, setMarketData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [count, setCount] = useState(0);
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    name: "",
    value: undefined,
  });

  const colorScale = useMemo(
    () =>
      scaleLinear()
        .domain([DOMAIN_MIN, 0, DOMAIN_MAX])
        .range(["#ff2d2d", "#3f3f46", "#00ff99"])
        .clamp(true),
    []
  );

  const globalProxyChange = useMemo(() => {
    const values = Object.values(marketData).filter(
      (item) => typeof item === "number" && Number.isFinite(item)
    );
    if (!values.length) {
      return null;
    }
    const sum = values.reduce((acc, value) => acc + Number(value), 0);
    return sum / values.length;
  }, [marketData]);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function loadMarketData() {
      try {
        const response = await fetch("/api/world-market-map", {
          method: "GET",
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load market heat map data");
        }

        const payload = await response.json();
        if (isMounted) {
          setMarketData(payload && typeof payload === "object" ? payload : {});
          const headerCount = Number(response.headers.get("x-market-map-count") || "0");
          setCount(Number.isFinite(headerCount) ? headerCount : 0);
        }
      } catch (err) {
        if (!isMounted || controller.signal.aborted) return;
        const message = err instanceof Error ? err.message : "Failed to load market data";
        setError(message);
      }
    }

    async function loadGeoData() {
      try {
        const response = await fetch("/api/world-map-geo", {
          method: "GET",
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load world geo topology");
        }

        const payload = await response.json();
        if (isMounted && payload && typeof payload === "object") {
          setGeoData(payload);
        }
      } catch (err) {
        if (!isMounted || controller.signal.aborted) return;
        const message = err instanceof Error ? err.message : "Failed to load world map";
        setError((prev) => prev || message);
      }
    }

    async function loadData() {
      setError("");
      setLoading(true);
      await Promise.allSettled([loadMarketData(), loadGeoData()]);
      if (isMounted) {
        setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  function getEffectiveChange(countryCode) {
    const raw = marketData?.[countryCode];
    if (typeof raw === "number" && Number.isFinite(raw)) {
      return raw;
    }
    if (typeof globalProxyChange === "number" && Number.isFinite(globalProxyChange)) {
      return globalProxyChange;
    }
    return null;
  }

  function getFillColor(countryCode) {
    const effective = getEffectiveChange(countryCode);
    if (typeof effective !== "number" || !Number.isFinite(effective)) {
      return "#52525b";
    }
    return colorScale(clamp(effective, DOMAIN_MIN, DOMAIN_MAX));
  }

  function isProxyCountry(countryCode) {
    const raw = marketData?.[countryCode];
    return !(typeof raw === "number" && Number.isFinite(raw));
  }

  return (
    <section className="w-full p-4 text-zinc-100">
      <div className="relative h-[500px] w-full overflow-hidden">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 145 }}
          width={980}
          height={500}
          style={{ width: "100%", height: "100%" }}
        >
          <Geographies geography={geoData || GEO_URL}>
            {({ geographies }) =>
              geographies.filter(shouldRenderCountry).map((geo) => {
                const countryCode = getCountryCode(geo);
                const countryName = getCountryName(geo.properties);
                const changeValue = getEffectiveChange(countryCode);
                const proxyValue = isProxyCountry(countryCode);

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    className="transition-colors duration-200"
                    style={{
                      default: {
                        fill: getFillColor(countryCode),
                        stroke: "#1f2937",
                        strokeWidth: 0.35,
                        outline: "none",
                      },
                      hover: {
                        fill: getFillColor(countryCode),
                        stroke: "#94a3b8",
                        strokeWidth: 0.55,
                        outline: "none",
                      },
                      pressed: {
                        fill: getFillColor(countryCode),
                        stroke: "#94a3b8",
                        strokeWidth: 0.55,
                        outline: "none",
                      },
                    }}
                    onMouseEnter={(event) => {
                      setTooltip({
                        visible: true,
                        x: event.clientX,
                        y: event.clientY,
                        name: proxyValue ? `${countryName} (proxy)` : countryName,
                        value: changeValue,
                      });
                    }}
                    onMouseMove={(event) => {
                      setTooltip((prev) => ({
                        ...prev,
                        visible: true,
                        x: event.clientX,
                        y: event.clientY,
                      }));
                    }}
                    onMouseLeave={() => {
                      setTooltip((prev) => ({ ...prev, visible: false }));
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>

        {loading ? (
          <div className="pointer-events-none absolute inset-x-0 top-2 text-center text-xs text-zinc-400">
            Loading world market data...
          </div>
        ) : null}

        {error ? (
          <div className="pointer-events-none absolute inset-x-0 top-2 text-center text-xs text-red-400">
            {error}
          </div>
        ) : null}

        {!loading && !error && count === 0 ? (
          <div className="pointer-events-none absolute inset-x-0 top-2 text-center text-xs text-amber-300">
            No market data available. Add <code>POLYGON_API_KEY</code> or <code>NEXT_PUBLIC_FINNHUB_KEY</code> in{" "}
            <code>.env.local</code> and restart dev server.
          </div>
        ) : null}

        {tooltip.visible ? (
          <div
            className="pointer-events-none fixed z-50 rounded-md border border-zinc-700 bg-zinc-900/95 px-3 py-2 text-xs text-zinc-100 shadow-xl"
            style={{ left: tooltip.x + 12, top: tooltip.y + 12 }}
          >
            <div className="font-semibold text-zinc-100">{tooltip.name}</div>
            <div
              className={`mt-1 font-medium ${
                typeof tooltip.value === "number"
                  ? tooltip.value >= 0
                    ? "text-emerald-400"
                    : "text-red-400"
                  : "text-zinc-400"
              }`}
            >
              {formatChange(tooltip.value)}
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-3 flex items-center gap-4 text-xs text-zinc-400">
        <div className="inline-flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-[#00ff99]" />
          Positive
        </div>
        <div className="inline-flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff2d2d]" />
          Negative
        </div>
        <div className="inline-flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-[#52525b]" />
          No data
        </div>
      </div>
    </section>
  );
}
