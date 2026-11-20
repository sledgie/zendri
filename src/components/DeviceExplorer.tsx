import React, { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import { DevicePreset } from "../types/device";
import {
  DeviceFilterCriteria,
  filterDevices,
  getManufacturersList,
  getPlatformsList,
} from "../data/deviceCatalog";
import { DeviceSearch } from "./DeviceSearch";
import { DeviceFilters } from "./DeviceFilters";
import { DeviceList } from "./DeviceList";
import { useLocalStorage } from "../hooks/useLocalStorage";

interface DeviceExplorerProps {
  isOpen: boolean;
  allDevices: DevicePreset[];
  customDevices: DevicePreset[];
  selectedDeviceId: string;
  favoriteIds: string[];
  recentIds: string[];
  compareDeviceIds: string[];
  onCloseMobile: () => void;
  onSelectDevice: (device: DevicePreset) => void;
  onToggleFavorite: (deviceId: string) => void;
  onAddToCompare: (device: DevicePreset) => void;
  onOpenNewCustom: () => void;
  onEditCustom: (device: DevicePreset) => void;
  onDeleteCustom: (deviceId: string) => void;
}

export const DeviceExplorer: React.FC<DeviceExplorerProps> = ({
  isOpen,
  allDevices,
  customDevices,
  selectedDeviceId,
  favoriteIds,
  recentIds,
  compareDeviceIds,
  onCloseMobile,
  onSelectDevice,
  onToggleFavorite,
  onAddToCompare,
  onOpenNewCustom,
  onEditCustom,
  onDeleteCustom,
}) => {
  const [criteria, setCriteria] = useState<DeviceFilterCriteria>({
    search: "",
    category: "All",
    manufacturer: "All",
    platform: "All",
  });

  const [viewMode, setViewMode] = useLocalStorage<"list" | "card">(
    "rdtl_explorer_view_mode",
    "list"
  );

  const manufacturers = useMemo(() => getManufacturersList(allDevices), [allDevices]);
  const platforms = useMemo(() => getPlatformsList(allDevices), [allDevices]);

  const filteredDevices = useMemo(
    () => filterDevices(allDevices, criteria),
    [allDevices, criteria]
  );

  const favoriteDevices = useMemo(
    () =>
      favoriteIds
        .map((id) => allDevices.find((d) => d.id === id))
        .filter((d): d is DevicePreset => Boolean(d)),
    [allDevices, favoriteIds]
  );

  const recentDevices = useMemo(
    () =>
      recentIds
        .map((id) => allDevices.find((d) => d.id === id))
        .filter((d): d is DevicePreset => Boolean(d)),
    [allDevices, recentIds]
  );

  const isSearchingOrFiltering =
    criteria.search.trim() !== "" ||
    criteria.category !== "All" ||
    criteria.manufacturer !== "All" ||
    criteria.platform !== "All";

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-xs lg:hidden"
        onClick={onCloseMobile}
        aria-hidden="true"
      />

      <aside
        aria-label="Device Explorer"
        className="fixed inset-y-0 left-0 z-40 flex w-80 max-w-[88vw] flex-col border-r border-slate-200 dark:border-slate-800/90 bg-white dark:bg-slate-950 lg:static lg:z-10 shrink-0"
      >
        {/* Explorer Top Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/90 px-3 py-2.5">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Device Explorer
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {allDevices.length} total presets • {manufacturers.length} brands
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onOpenNewCustom}
              title="Create Custom Device Profile"
              className="inline-flex items-center gap-1 rounded-lg bg-sky-500/12 hover:bg-sky-500/20 border border-sky-500/30 px-2.5 py-1 text-[11px] font-semibold text-sky-700 dark:text-sky-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Custom</span>
            </button>
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Close Device Explorer"
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 lg:hidden cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="space-y-2.5 border-b border-slate-200 dark:border-slate-800/80 p-3">
          <DeviceSearch
            value={criteria.search}
            matchCount={filteredDevices.length}
            onChange={(val) => setCriteria((prev) => ({ ...prev, search: val }))}
          />
          <DeviceFilters
            criteria={criteria}
            manufacturers={manufacturers}
            platforms={platforms}
            customDeviceCount={customDevices.length}
            viewMode={viewMode}
            onChangeCriteria={(patch) => setCriteria((prev) => ({ ...prev, ...patch }))}
            onResetFilters={() =>
              setCriteria({
                search: "",
                category: "All",
                manufacturer: "All",
                platform: "All",
              })
            }
            onChangeViewMode={setViewMode}
          />
        </div>

        {/* Scrollable Device Catalog */}
        <div className="flex-1 overflow-y-auto dev-scroll px-2.5 py-2">
          <DeviceList
            filteredDevices={filteredDevices}
            favoriteDevices={favoriteDevices}
            recentDevices={recentDevices}
            customDevices={customDevices}
            selectedDeviceId={selectedDeviceId}
            favoriteIds={favoriteIds}
            compareDeviceIds={compareDeviceIds}
            viewMode={viewMode}
            isSearchingOrFiltering={isSearchingOrFiltering}
            onSelectDevice={onSelectDevice}
            onToggleFavorite={onToggleFavorite}
            onAddToCompare={onAddToCompare}
            onOpenNewCustom={onOpenNewCustom}
            onEditCustom={onEditCustom}
            onDeleteCustom={onDeleteCustom}
          />
        </div>
      </aside>
    </>
  );
};
