"use client";

import WorldMarketHeatMap from "./WorldMarketHeatMap";

export default function WorldMarketHeatMapSection() {
  return (
    <section className="mt-8 w-full rounded-2xl border border-gray-200 bg-white py-4 shadow-sm sm:py-6">
      <div className="w-full px-4 md:px-6">
        <h2 className="mb-3 text-xl font-bold tracking-tight text-black sm:text-2xl">
          World Market Globe
        </h2>
        <p className="mb-4 max-w-3xl text-sm text-gray-600 sm:text-base">
          A live 3D globe with country boundaries, highlighted market moves, and cross-market links
          between major financial centers.
        </p>
        <WorldMarketHeatMap />
      </div>
    </section>
  );
}
