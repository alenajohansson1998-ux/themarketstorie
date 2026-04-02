"use client";

import dynamic from "next/dynamic";
import React, { useEffect, useMemo, useRef, useState } from "react";
import countriesTopology from "world-atlas/countries-110m.json";
import { feature } from "topojson-client";
import { Color, MeshPhongMaterial } from "three";

import countryGeoMetadata from "@/data/country-geo-metadata.json";
import { WORLD_MARKET_CONFIG } from "@/lib/worldMarketConfig";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

const POSITIVE_COLOR = "#10b981";
const NEGATIVE_COLOR = "#ef4444";
const NEUTRAL_COLOR = "#64748b";

const COUNTRY_GEO_METADATA = countryGeoMetadata;
const COUNTRY_CODE_BY_NUMERIC = Object.entries(COUNTRY_GEO_METADATA).reduce((acc, [numericCode, meta]) => {
  acc[numericCode] = meta[0];
  return acc;
}, {});
const NUMERIC_CODE_BY_COUNTRY = Object.entries(COUNTRY_GEO_METADATA).reduce((acc, [numericCode, meta]) => {
  acc[meta[0]] = numericCode;
  return acc;
}, {});

const COUNTRY_FEATURES = feature(
  countriesTopology,
  countriesTopology.objects.countries
).features.filter((country) => {
  const geometryType = country?.geometry?.type;
  return geometryType === "Polygon" || geometryType === "MultiPolygon";
});

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatChange(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "No data";
  const sign = number > 0 ? "+" : "";
  return `${sign}${number.toFixed(2)}%`;
}

function getCountryCode(country) {
  return COUNTRY_CODE_BY_NUMERIC[String(country?.id ?? "")] || "";
}

function getCountryPalette(change, isDirect) {
  if (!Number.isFinite(change)) {
    return {
      capColor: "rgba(148, 163, 184, 0.32)",
      sideColor: "rgba(148, 163, 184, 0.12)",
      strokeColor: "rgba(255, 255, 255, 0.38)",
      altitude: 0.005,
    };
  }

  const intensity = clamp(Math.abs(change) / 5, 0.3, 1);
  const capAlpha = isDirect ? 0.42 + intensity * 0.24 : 0.18 + intensity * 0.12;
  const sideAlpha = isDirect ? 0.16 + intensity * 0.14 : 0.08 + intensity * 0.06;
  const altitude = isDirect ? 0.012 + intensity * 0.02 : 0.004 + intensity * 0.008;
  const strokeColor = isDirect
    ? change >= 0
      ? "rgba(209, 250, 229, 0.9)"
      : "rgba(254, 205, 211, 0.9)"
    : "rgba(226, 232, 240, 0.62)";

  if (change >= 0) {
    return {
      capColor: `rgba(16, 185, 129, ${capAlpha})`,
      sideColor: `rgba(5, 150, 105, ${sideAlpha})`,
      strokeColor,
      altitude,
    };
  }

  return {
    capColor: `rgba(239, 68, 68, ${capAlpha})`,
    sideColor: `rgba(190, 24, 93, ${sideAlpha})`,
    strokeColor,
    altitude,
  };
}

function getPointColor(change) {
  if (!Number.isFinite(change)) {
    return NEUTRAL_COLOR;
  }

  return change >= 0 ? POSITIVE_COLOR : NEGATIVE_COLOR;
}

function getArcColor(change) {
  if (!Number.isFinite(change)) {
    return ["rgba(148, 163, 184, 0.7)", "rgba(148, 163, 184, 0.15)"];
  }

  return change >= 0
    ? ["rgba(16, 185, 129, 0.92)", "rgba(56, 189, 248, 0.16)"]
    : ["rgba(239, 68, 68, 0.92)", "rgba(56, 189, 248, 0.16)"];
}

function getCountryLabel(country) {
  const name = country?.properties?.name || "Unknown country";

  if (typeof country?.change === "number" && Number.isFinite(country.change)) {
    const tone = country.change >= 0 ? POSITIVE_COLOR : NEGATIVE_COLOR;
    const sourceLabel = country?.isDirect ? "Live market feed" : "Regional proxy";
    return `
      <div style="min-width: 160px; padding: 8px 10px; border-radius: 10px; background: rgba(15, 23, 42, 0.94); color: #f8fafc; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.24);">
        <div style="font-size: 13px; font-weight: 700;">${name}</div>
        <div style="margin-top: 4px; font-size: 12px; color: ${tone}; font-weight: 700;">${formatChange(country.change)}</div>
        <div style="margin-top: 4px; font-size: 11px; color: #cbd5e1;">${sourceLabel}</div>
      </div>
    `;
  }

  return `
    <div style="min-width: 160px; padding: 8px 10px; border-radius: 10px; background: rgba(15, 23, 42, 0.94); color: #f8fafc; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.24);">
      <div style="font-size: 13px; font-weight: 700;">${name}</div>
      <div style="margin-top: 4px; font-size: 12px; color: #cbd5e1;">No live market feed</div>
    </div>
  `;
}

export default function WorldMarketHeatMap({
  showSummaryChips = true,
  showLegend = true,
  showFootnote = true,
  footnoteText = "Direct market feeds power the highlighted countries. Remaining countries use subregion or region proxies so the full globe stays populated.",
  compact = false,
}) {
  const globeRef = useRef(null);
  const containerRef = useRef(null);

  const [marketData, setMarketData] = useState({});
  const [directCodes, setDirectCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [count, setCount] = useState(0);
  const [globeSize, setGlobeSize] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return undefined;
    }

    const updateSize = () => {
      const nextSize = Math.round(container.offsetWidth || 0);
      setGlobeSize(nextSize);
    };

    updateSize();

    let resizeObserver;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(updateSize);
      resizeObserver.observe(container);
    }

    window.addEventListener("resize", updateSize);

    return () => {
      window.removeEventListener("resize", updateSize);
      resizeObserver?.disconnect();
    };
  }, []);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    async function loadMarketData() {
      setError("");
      setLoading(true);

      try {
        const response = await fetch("/api/world-market-map", {
          method: "GET",
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load market globe data");
        }

        const payload = await response.json();
        if (!active) return;

        const data =
          payload?.values && typeof payload.values === "object" ? payload.values : {};
        const nextDirectCodes = Array.isArray(payload?.meta?.directCodes)
          ? payload.meta.directCodes.filter((item) => typeof item === "string")
          : [];
        const responseCount =
          Number(response.headers.get("x-market-map-count") || "") ||
          Number(payload?.meta?.count || "") ||
          Object.keys(data).length;

        setMarketData(data);
        setDirectCodes(nextDirectCodes);
        setCount(responseCount);
      } catch (err) {
        if (!active || controller.signal.aborted) return;
        const message = err instanceof Error ? err.message : "Failed to load market data";
        setError(message);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadMarketData();

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  const directCodeSet = useMemo(() => new Set(directCodes), [directCodes]);

  const visibleMarkets = useMemo(() => {
    return Object.entries(WORLD_MARKET_CONFIG)
      .map(([code, meta]) => {
        const numericCode = NUMERIC_CODE_BY_COUNTRY[code];
        const raw = numericCode ? marketData?.[numericCode] : undefined;
        const change = typeof raw === "number" && Number.isFinite(raw) ? raw : null;

        return {
          code,
          label: meta.label,
          lat: meta.location[0],
          lng: meta.location[1],
          change,
          isDirect: directCodeSet.has(code),
        };
      })
      .filter((item) => item.isDirect && typeof item.change === "number");
  }, [directCodeSet, marketData]);

  const polygonsData = useMemo(() => {
    return COUNTRY_FEATURES.map((country) => {
      const code = getCountryCode(country);
      const raw = marketData?.[String(country.id)];
      const change = typeof raw === "number" && Number.isFinite(raw) ? raw : null;
      const isDirect = code ? directCodeSet.has(code) : false;
      const palette = getCountryPalette(change, isDirect);

      return {
        ...country,
        code,
        change,
        isDirect,
        capColor: palette.capColor,
        sideColor: palette.sideColor,
        strokeColor: palette.strokeColor,
        altitude: palette.altitude,
      };
    });
  }, [directCodeSet, marketData]);

  const pointsData = useMemo(() => {
    return visibleMarkets.map((market) => ({
      ...market,
      color: getPointColor(market.change),
      altitude: 0.015 + clamp(Math.abs(market.change) / 200, 0, 0.02),
      radius: 0.28 + clamp(Math.abs(market.change) / 50, 0, 0.08),
      label: `
        <div style="min-width: 160px; padding: 8px 10px; border-radius: 10px; background: rgba(15, 23, 42, 0.94); color: #f8fafc; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.24);">
          <div style="font-size: 13px; font-weight: 700;">${market.label}</div>
          <div style="margin-top: 4px; font-size: 12px; color: ${
            market.change >= 0 ? POSITIVE_COLOR : NEGATIVE_COLOR
          }; font-weight: 700;">${formatChange(market.change)}</div>
        </div>
      `,
    }));
  }, [visibleMarkets]);

  const arcsData = useMemo(() => {
    if (visibleMarkets.length < 2) {
      return [];
    }

    const hub = visibleMarkets.find((market) => market.code === "US") || visibleMarkets[0];

    return visibleMarkets
      .filter((market) => market.code !== hub.code)
      .slice(0, 8)
      .map((market) => ({
        startLat: hub.lat,
        startLng: hub.lng,
        endLat: market.lat,
        endLng: market.lng,
        color: getArcColor(market.change),
        altitude: 0.18,
        label: `
          <div style="padding: 8px 10px; border-radius: 10px; background: rgba(15, 23, 42, 0.94); color: #f8fafc; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.24);">
            <div style="font-size: 13px; font-weight: 700;">${hub.label} to ${market.label}</div>
            <div style="margin-top: 4px; font-size: 12px; color: ${
              market.change >= 0 ? POSITIVE_COLOR : NEGATIVE_COLOR
            }; font-weight: 700;">${formatChange(market.change)}</div>
          </div>
        `,
      }));
  }, [visibleMarkets]);

  const summaryMarkets = useMemo(() => {
    return [...visibleMarkets]
      .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
      .slice(0, 6);
  }, [visibleMarkets]);

  const globeMaterial = useMemo(() => {
    return new MeshPhongMaterial({
      color: new Color("#081120"),
      emissive: new Color("#0f172a"),
      emissiveIntensity: 0.18,
      shininess: 0.8,
      transparent: true,
      opacity: 0.98,
    });
  }, []);

  const handleGlobeReady = () => {
    const globe = globeRef.current;
    if (!globe) {
      return;
    }

    const controls = globe.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.55;
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;

    globe.pointOfView({ lat: 18, lng: 12, altitude: 2.05 }, 0);
  };

  const shellClassName = compact
    ? "flex w-full flex-col items-center py-1 text-zinc-700 sm:py-2"
    : "flex w-full flex-col items-center p-2 text-zinc-700 sm:p-4";
  const globeClassName = compact
    ? "relative mx-auto aspect-square w-full max-w-[560px] overflow-hidden rounded-full bg-[radial-gradient(circle_at_center,_rgba(96,165,250,0.16),_rgba(255,255,255,0)_64%)]"
    : "relative mx-auto aspect-square w-full max-w-[620px] overflow-hidden rounded-full bg-[radial-gradient(circle_at_center,_rgba(96,165,250,0.16),_rgba(255,255,255,0)_64%)]";

  return (
    <section className={shellClassName}>
      <div
        ref={containerRef}
        className={globeClassName}
      >
        {globeSize > 0 ? (
          <Globe
            ref={globeRef}
            width={globeSize}
            height={globeSize}
            backgroundColor="rgba(0,0,0,0)"
            animateIn={false}
            globeMaterial={globeMaterial}
            showAtmosphere
            atmosphereColor="#93c5fd"
            atmosphereAltitude={0.16}
            polygonsData={polygonsData}
            polygonLabel={getCountryLabel}
            polygonCapColor="capColor"
            polygonSideColor="sideColor"
            polygonStrokeColor="strokeColor"
            polygonAltitude="altitude"
            polygonCapCurvatureResolution={4}
            polygonsTransitionDuration={250}
            pointsData={pointsData}
            pointLat="lat"
            pointLng="lng"
            pointColor="color"
            pointAltitude="altitude"
            pointRadius="radius"
            pointLabel="label"
            pointsMerge={false}
            pointsTransitionDuration={250}
            arcsData={arcsData}
            arcStartLat="startLat"
            arcStartLng="startLng"
            arcEndLat="endLat"
            arcEndLng="endLng"
            arcColor="color"
            arcAltitude="altitude"
            arcStroke={0.35}
            arcDashLength={0.35}
            arcDashGap={0.7}
            arcDashAnimateTime={2200}
            arcLabel="label"
            onGlobeReady={handleGlobeReady}
          />
        ) : null}

        {loading ? (
          <div className="pointer-events-none absolute inset-x-0 top-3 text-center text-xs text-zinc-500">
            Loading live world market globe...
          </div>
        ) : null}

        {error ? (
          <div className="pointer-events-none absolute inset-x-0 top-3 text-center text-xs text-red-500">
            {error}
          </div>
        ) : null}

        {!loading && !error && count === 0 ? (
          <div className="pointer-events-none absolute inset-x-0 top-3 text-center text-xs text-amber-700">
            No market data available. Add <code>POLYGON_API_KEY</code> or <code>NEXT_PUBLIC_FINNHUB_KEY</code> in{" "}
            <code>.env.local</code> and restart dev server.
          </div>
        ) : null}
      </div>

      {showLegend ? (
        <div className={`flex flex-wrap items-center justify-center gap-3 text-xs text-zinc-600 sm:gap-4 ${compact ? "mt-2" : "mt-3"}`}>
          <div className="inline-flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-[#10b981]" />
            Positive
          </div>
          <div className="inline-flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ef4444]" />
            Negative
          </div>
          <div className="inline-flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-[#64748b]" />
            No data
          </div>
        </div>
      ) : null}

      {showFootnote ? (
        <p className={`text-center text-[11px] text-zinc-500 ${compact ? "mt-1.5" : "mt-2"}`}>
          {footnoteText}
        </p>
      ) : null}

      {showSummaryChips && summaryMarkets.length > 0 ? (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {summaryMarkets.map((market) => (
            <div
              key={market.code}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                market.change >= 0
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-rose-200 bg-rose-50 text-rose-700"
              }`}
            >
              {market.label}
              <span className="ml-1.5 font-semibold">{formatChange(market.change)}</span>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
