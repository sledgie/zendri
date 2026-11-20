import React from "react";
import { LayoutList, LayoutGrid, RotateCcw } from "lucide-react";
import { DeviceCategory, DevicePlatform } from "../types/device";
import { CATEGORY_METADATA, DeviceFilterCriteria } from "../data/deviceCatalog";

interface DeviceFiltersProps {
  criteria: DeviceFilterCriteria;
  manufacturers: { name: string; count: number }[];
  platforms: { name: DevicePlatform; count: number }[];
  customDeviceCount: number;
  viewMode: "list" | "card";
  onChangeCriteria: (patch: Partial<DeviceFilterCriteria>) => void;
  onResetFilters: () => void;
  onChangeViewMode: (mode: "list" | "card") => void;
}

export const DeviceFilters: React.FC<DeviceFiltersProps> = ({
  criteria,
  manufacturers,
  platforms,
  customDeviceCount,
  viewMode,
  onChangeCriteria,
  onResetFilters,
  onChangeViewMode,
}) => {
  const hasActiveFilter =
    criteria.search.trim() !== "" ||
    criteria.category !== "All" ||
    criteria.manufacturer !== "All" ||
    criteria.platform !== "All";

  return (
    <div className="space-y-2">
      {/* Category quick chips */}
      <div className="flex items-center gap-1 overflow-x-auto dev-scroll pb-0.5">
        <button
          type="button"
          onClick={() => onChangeCriteria({ category: "All" })}
          aria-pressed={criteria.category === "All"}
          className={`shrink-0 rounded-md px-2 py-1 text-[11px] font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
            criteria.category === "All"
              ? "bg-sky-500 text-slate-950 font-semibold"
              : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
          }`}
        >
          All
        </button>

        {CATEGORY_METADATA.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() =>
              onChangeCriteria({
                category: criteria.category === cat.id ? "All" : (cat.id as DeviceCategory),
              })
            }
            aria-pressed={criteria.category === cat.id}
            className={`shrink-0 rounded-md px-2 py-1 text-[11px] font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
              criteria.category === cat.id
                ? "bg-sky-500 text-slate-950 font-semibold"
                : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            {cat.shortLabel}
          </button>
        ))}

        {customDeviceCount > 0 && (
          <button
            type="button"
            onClick={() =>
              onChangeCriteria({
                category: criteria.category === "Custom" ? "All" : "Custom",
              })
            }
            aria-pressed={criteria.category === "Custom"}
            className={`shrink-0 rounded-md px-2 py-1 text-[11px] font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
              criteria.category === "Custom"
                ? "bg-indigo-500 text-white font-semibold"
                : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-500/20"
            }`}
          >
            Custom ({customDeviceCount})
          </button>
        )}
      </div>

      {/* Manufacturer + Platform + View toggle */}
      <div className="flex items-center gap-1.5">
        <select
          aria-label="Filter by manufacturer"
          value={criteria.manufacturer}
          onChange={(e) => onChangeCriteria({ manufacturer: e.target.value })}
          className="min-w-0 flex-1 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-2 py-1 text-[11px] text-slate-700 dark:text-slate-200 focus:border-sky-500 focus:outline-none"
        >
          <option value="All">Brand: All ({manufacturers.length})</option>
          {manufacturers.map((m) => (
            <option key={m.name} value={m.name}>
              {m.name} ({m.count})
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by platform"
          value={criteria.platform}
          onChange={(e) =>
            onChangeCriteria({ platform: e.target.value as DevicePlatform | "All" })
          }
          className="w-28 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-2 py-1 text-[11px] text-slate-700 dark:text-slate-200 focus:border-sky-500 focus:outline-none"
        >
          <option value="All">OS: All</option>
          {platforms.map((p) => (
            <option key={p.name} value={p.name}>
              {p.name} ({p.count})
            </option>
          ))}
        </select>

        {/* View switcher: Compact List vs Card View */}
        <div
          role="group"
          aria-label="Device list layout"
          className="inline-flex rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-0.5 shrink-0"
        >
          <button
            type="button"
            onClick={() => onChangeViewMode("list")}
            title="Compact List View"
            aria-label="Compact List View"
            aria-pressed={viewMode === "list"}
            className={`p-1 rounded transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
              viewMode === "list"
                ? "bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-xs"
                : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            <LayoutList className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onChangeViewMode("card")}
            title="Card View"
            aria-label="Card View"
            aria-pressed={viewMode === "card"}
            className={`p-1 rounded transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
              viewMode === "card"
                ? "bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-xs"
                : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
        </div>

        {hasActiveFilter && (
          <button
            type="button"
            onClick={onResetFilters}
            title="Reset all device filters"
            aria-label="Reset all device filters"
            className="p-1.5 rounded-md border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-rose-500 dark:text-slate-400 dark:hover:text-rose-400 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
