"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import TabToggleNav from "./TabToggleNav";
import { CURRENCIES } from "@/lib/forex/currencies";

const AllRatesTable = dynamic(() => import("./AllRatesTable"), { ssr: false });
const CrossRatesTable = dynamic(() => import("./CrossRatesTable"), { ssr: false });

const REGIONS = ["Overview", "Europe & Americas", "Asia-Pacific, Middle East & Africa", "G7 & BRICS"];

const REGION_CURRENCY_CODES: Record<string, string[]> = {
  Overview: CURRENCIES.map((c) => c.code),
  "Europe & Americas": ["EUR", "USD", "GBP", "CHF", "CAD"],
  "Asia-Pacific, Middle East & Africa": ["AUD", "NZD", "HKD", "TWD", "SGD", "CNY", "JPY", "KRW", "AED", "ZAR"],
  "G7 & BRICS": ["USD", "EUR", "GBP", "JPY", "CAD", "CNY", "INR"],
};

type HeatCell = { changePercent?: number } | null;

function filterCurrenciesAndMatrix(region: string, matrix: HeatCell[][] | null) {
  const codes = REGION_CURRENCY_CODES[region] || CURRENCIES.map((c) => c.code);
  const indices = codes.map((code) => CURRENCIES.findIndex((c) => c.code === code)).filter((i) => i !== -1);
  const filteredCurrencies = CURRENCIES.filter((c) => codes.includes(c.code));
  const filteredMatrix = matrix ? indices.map((i) => indices.map((j) => matrix[i]?.[j] ?? null)) : null;
  return { filteredCurrencies, filteredMatrix };
}

// Cross rate A/B = rate_B / rate_A, with all rates quoted per 1 USD.
function calculateCrossRatesMatrix(currencies: { code: string }[], usdRates: Record<string, number> | null) {
  return currencies.map((base) =>
    currencies.map((quote) => {
      if (!usdRates || base.code === quote.code) return null;
      const rateBase = usdRates[base.code];
      const rateQuote = usdRates[quote.code];
      if (!rateBase || !rateQuote) return null;
      return rateQuote / rateBase;
    })
  );
}

function useUsdRates() {
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [date, setDate] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    fetch("https://api.frankfurter.app/latest?from=USD")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data?.rates) return;
        setRates({ ...data.rates, USD: 1 });
        setDate(data.date ?? null);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);
  return { rates, date };
}

function AllRatesClient({ matrix }: { matrix: HeatCell[][] | null }) {
  const [region, setRegion] = React.useState(REGIONS[0]);
  const [view, setView] = React.useState<"cross" | "heatmap">("heatmap");
  const { rates, date } = useUsdRates();

  const { filteredCurrencies, filteredMatrix } = filterCurrenciesAndMatrix(region, matrix);
  const crossRatesMatrix = calculateCrossRatesMatrix(filteredCurrencies, rates);

  return (
    <>
      <TabToggleNav regions={REGIONS} selectedRegion={region} onRegionChange={setRegion} view={view} onViewChange={setView} />
      {view === "heatmap" ? (
        <AllRatesTable matrix={filteredMatrix} currencies={filteredCurrencies} />
      ) : (
        <CrossRatesTable matrix={crossRatesMatrix} currencies={filteredCurrencies} />
      )}
      <p className="mt-3 text-footnote text-ink-2">
        Reference rates from the European Central Bank{view === "cross" && date ? `, ${date}` : ""}. Indicative only.
      </p>
    </>
  );
}

export default AllRatesClient;
