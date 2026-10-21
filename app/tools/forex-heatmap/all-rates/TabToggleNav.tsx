"use client";

import React from "react";

interface TabToggleNavProps {
  regions: string[];
  selectedRegion: string;
  onRegionChange: (region: string) => void;
  view: "cross" | "heatmap";
  onViewChange: (view: "cross" | "heatmap") => void;
}

const segment = (selected: boolean) =>
  `inline-flex h-9 items-center whitespace-nowrap rounded-md px-3.5 text-subhead font-medium transition-colors ${
    selected ? "bg-canvas text-ink shadow-sm" : "text-ink-2 hover:text-ink"
  }`;

const TabToggleNav: React.FC<TabToggleNavProps> = ({ regions, selectedRegion, onRegionChange, view, onViewChange }) => (
  <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
    <div className="no-scrollbar -mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
      <div role="group" aria-label="Region" className="inline-flex min-w-max rounded-control bg-fill p-1">
        {regions.map((region) => (
          <button
            key={region}
            type="button"
            aria-pressed={selectedRegion === region}
            className={segment(selectedRegion === region)}
            onClick={() => onRegionChange(region)}
          >
            {region}
          </button>
        ))}
      </div>
    </div>
    <div role="group" aria-label="View" className="inline-flex self-start rounded-control bg-fill p-1">
      <button type="button" aria-pressed={view === "heatmap"} className={segment(view === "heatmap")} onClick={() => onViewChange("heatmap")}>
        Heatmap
      </button>
      <button type="button" aria-pressed={view === "cross"} className={segment(view === "cross")} onClick={() => onViewChange("cross")}>
        Cross rates
      </button>
    </div>
  </div>
);

export default TabToggleNav;
