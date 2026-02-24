"use client";

import React from "react";

interface TabToggleNavProps {
  regions: string[];
  selectedRegion: string;
  onRegionChange: (region: string) => void;
  view: "cross" | "heatmap";
  onViewChange: (view: "cross" | "heatmap") => void;
}

const TabToggleNav: React.FC<TabToggleNavProps> = ({
  regions,
  selectedRegion,
  onRegionChange,
  view,
  onViewChange,
}) => (
  <div className="flex items-center justify-between mb-6">
    <div className="flex gap-2">
      {regions.map((region) => (
        <button
          key={region}
          className={`px-4 py-1 rounded-full border transition-colors text-sm font-medium ${
            selectedRegion === region
              ? "bg-black text-white border-black"
              : "bg-white text-black border-gray-300 hover:bg-gray-100"
          }`}
          onClick={() => onRegionChange(region)}
        >
          {region}
        </button>
      ))}
    </div>
    <div className="flex gap-1">
      <button
        className={`px-3 py-1 rounded border text-sm font-medium ${
          view === "cross"
            ? "bg-white text-black border-gray-400"
            : "bg-gray-100 text-gray-600 border-gray-200"
        }`}
        onClick={() => onViewChange("cross")}
      >
        Cross rates
      </button>
      <button
        className={`px-3 py-1 rounded border text-sm font-medium ${
          view === "heatmap"
            ? "bg-black text-white border-black"
            : "bg-white text-black border-gray-200"
        }`}
        onClick={() => onViewChange("heatmap")}
      >
        Heatmap
      </button>
    </div>
  </div>
);

export default TabToggleNav;
