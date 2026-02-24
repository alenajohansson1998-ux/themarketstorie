"use client";

import React from "react";

import dynamic from "next/dynamic";
import TabToggleNav from "./TabToggleNav";
const AllRatesTable = dynamic(() => import("./AllRatesTable"), { ssr: false });
const CrossRatesTable = dynamic(() => import("./CrossRatesTable"), { ssr: false });

const REGIONS = [
  "Overview",
  "Europe & Americas",
  "Asia-Pacific, Middle East & Africa",
  "G7 & BRICS",
];

import { CURRENCIES } from '@/lib/forex/currencies';

const REGION_CURRENCY_CODES: Record<string, string[]> = {
  'Overview': CURRENCIES.map(c => c.code),
  'Europe & Americas': ['EUR', 'USD', 'GBP', 'CHF', 'CAD'],
  // Match screenshot: AUD, NZD, HKD, TWD, SGD, CNY, JPY, KRW, AED, ZAR
  'Asia-Pacific, Middle East & Africa': ['AUD', 'NZD', 'HKD', 'TWD', 'SGD', 'CNY', 'JPY', 'KRW', 'AED', 'ZAR'],
  'G7 & BRICS': ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'CNY', 'INR'],
};

function filterCurrenciesAndMatrix(region: string, matrix: any[][] | null) {
  const codes = REGION_CURRENCY_CODES[region] || CURRENCIES.map(c => c.code);
  const indices = codes.map(code => CURRENCIES.findIndex(c => c.code === code)).filter(i => i !== -1);
  const filteredCurrencies = CURRENCIES.filter(c => codes.includes(c.code));
  const filteredMatrix = matrix
    ? indices.map(i => indices.map(j => matrix[i]?.[j] ?? null))
    : null;
  return { filteredCurrencies, filteredMatrix };
}

// Static USD rates for demo (should be fetched from backend in production)
const USD_RATES = {
  AUD: 1.4981, BRL: 5.3885, CAD: 1.3883, CHF: 0.80003, CNY: 6.9823, CZK: 20.904, DKK: 6.4185, EUR: 0.85896, GBP: 0.74532, HKD: 7.7962, HUF: 331.58, IDR: 16860, ILS: 3.1562, INR: 90.22, ISK: 126.61, JPY: 157.64, KRW: 1459.84, MXN: 18.0278, MYR: 4.0735, NOK: 10.1155, NZD: 1.747, PHP: 59.212, PLN: 3.6195, RON: 4.3723, SEK: 9.2321, SGD: 1.2871, THB: 31.465, TRY: 43.106, ZAR: 16.575
};

function calculateCrossRatesMatrix(currencies: { code: string }[], usdRates: Record<string, number>) {
  // All rates are relative to USD, so cross rate A/B = rate_B / rate_A
  return currencies.map((base) =>
    currencies.map((quote) => {
      if (base.code === quote.code) return null;
      const rateBase = usdRates[base.code];
      const rateQuote = usdRates[quote.code];
      if (!rateBase || !rateQuote) return null;
      return rateQuote / rateBase;
    })
  );
}

function AllRatesClient({ matrix }: { matrix: any[][] | null }) {
  const [region, setRegion] = React.useState(REGIONS[0]);
  const [view, setView] = React.useState<'cross' | 'heatmap'>('heatmap');

  const { filteredCurrencies, filteredMatrix } = filterCurrenciesAndMatrix(region, matrix);
  const crossRatesMatrix = calculateCrossRatesMatrix(filteredCurrencies, USD_RATES);

  return (
    <>
      <TabToggleNav
        regions={REGIONS}
        selectedRegion={region}
        onRegionChange={setRegion}
        view={view}
        onViewChange={setView}
      />
      {view === 'heatmap' ? (
        <AllRatesTable matrix={filteredMatrix} currencies={filteredCurrencies} />
      ) : (
        <CrossRatesTable matrix={crossRatesMatrix} currencies={filteredCurrencies} />
      )}
    </>
  );
}

export default AllRatesClient;
