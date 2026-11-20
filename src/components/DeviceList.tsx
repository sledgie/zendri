import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Star,
  Clock,
  PlusCircle,
  Pencil,
  Trash2,
  Wrench,
} from "lucide-react";
import { DevicePreset } from "../types/device";
import { CATEGORY_METADATA } from "../data/deviceCatalog";
import { DeviceCard, getDeviceCategoryIcon } from "./DeviceCard";

interface DeviceListProps {
  filteredDevices: DevicePreset[];
  favoriteDevices: DevicePreset[];
  recentDevices: DevicePreset[];
  customDevices: DevicePreset[];
  selectedDeviceId: string;
  favoriteIds: string[];
  compareDeviceIds: string[];
  viewMode: "list" | "card";
  isSearchingOrFiltering: boolean;
  onSelectDevice: (device: DevicePreset) => void;
  onToggleFavorite: (deviceId: string) => void;
  onAddToCompare: (device: DevicePreset) => void;
  onOpenNewCustom: () => void;
  onEditCustom: (device: DevicePreset) => void;
  onDeleteCustom: (deviceId: string) => void;
}

interface CompactRowProps {
  device: DevicePreset;
  isSelected: boolean;
  isFavorite: boolean;
  onSelect: (device: DevicePreset) => void;
  onToggleFavorite: (deviceId: string) => void;
  onAddToCompare: (device: DevicePreset) => void;
  onEditCustom?: (device: DevicePreset) => void;
  onDeleteCustom?: (deviceId: string) => void;
}

const CompactDeviceRow: React.FC<CompactRowProps> = ({
  device,
  isSelected,
  isFavorite,
  onSelect,
  onToggleFavorite,
  onAddToCompare,
  onEditCustom,
  onDeleteCustom,
}) => {
  const Icon = getDeviceCategoryIcon(device.category);

  return (
    <div
      className={`group flex items-center justify-between gap-1.5 rounded-lg px-2 py-1.5 transition-colors ${
        isSelected
          ? "bg-sky-500/14 border border-sky-500/50"
          : "border border-transparent hover:bg-slate-100 dark:hover:bg-slate-900/90"
      }`}
    >
      <button
        type="button"
        onClick={() => onSelect(device)}
        className="flex flex-1 items-center gap-2 min-w-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded cursor-pointer"
      >
        <Icon
          className={`w-3.5 h-3.5 shrink-0 ${
            isSelected ? "text-sky-500 dark:text-sky-400" : "text-slate-400 dark:text-slate-500"
          }`}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span
              className={`text-xs truncate ${
                isSelected
                  ? "font-semibold text-sky-700 dark:text-sky-200"
                  : "font-medium text-slate-800 dark:text-slate-200"
              }`}
            >
              {device.name}
            </span>
            {device.accuracy === "estimated" && !device.isCustom && (
              <span
                title="Estimated preset dimensions"
                className="shrink-0 rounded bg-amber-500/15 px-1 py-0.2 text-[9px] font-medium text-amber-700 dark:text-amber-300"
              >
                Est.
              </span>
            )}
            {device.isCustom && (
              <span className="shrink-0 rounded bg-indigo-500/15 px-1 py-0.2 text-[9px] font-medium text-indigo-600 dark:text-indigo-300">
                Custom
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 truncate">
            <span>{device.manufacturer}</span>
            <span>•</span>
            <span>{device.category}</span>
          </div>
        </div>

        <div className="text-right shrink-0 font-mono">
          <div className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
            {device.viewportWidth}×{device.viewportHeight}
          </div>
          <div className="text-[9.5px] text-slate-400 dark:text-slate-500">@{device.dpr}x</div>
        </div>
      </button>

      {/* Row action icons */}
      <div className="flex items-center gap-0.5 shrink-0">
        {device.isCustom && onEditCustom && (
          <button
            type="button"
            onClick={() => onEditCustom(device)}
            title={`Edit ${device.name}`}
            aria-label={`Edit ${device.name}`}
            className="p-1 rounded text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 cursor-pointer"
          >
            <Pencil className="w-3 h-3" />
          </button>
        )}
        {device.isCustom && onDeleteCustom && (
          <button
            type="button"
            onClick={() => onDeleteCustom(device.id)}
            title={`Delete ${device.name}`}
            aria-label={`Delete ${device.name}`}
            className="p-1 rounded text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
        <button
          type="button"
          onClick={() => onToggleFavorite(device.id)}
          title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
          aria-label={
            isFavorite ? `Remove ${device.name} from favorites` : `Add ${device.name} to favorites`
          }
          aria-pressed={isFavorite}
          className={`p-1 rounded transition-opacity focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 cursor-pointer ${
            isFavorite
              ? "opacity-100"
              : "opacity-60 group-hover:opacity-100 hover:bg-slate-200/70 dark:hover:bg-slate-800"
          }`}
        >
          <Star
            className={`w-3.5 h-3.5 ${
              isFavorite
                ? "fill-amber-400 text-amber-400"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            }`}
          />
        </button>
        <button
          type="button"
          onClick={() => onAddToCompare(device)}
          title="Add to Compare Mode"
          aria-label={`Compare ${device.name}`}
          className="p-1 rounded opacity-60 group-hover:opacity-100 focus-visible:opacity-100 text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-slate-200/70 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export const DeviceList: React.FC<DeviceListProps> = ({
  filteredDevices,
  favoriteDevices,
  recentDevices,
  customDevices,
  selectedDeviceId,
  favoriteIds,
  compareDeviceIds,
  viewMode,
  isSearchingOrFiltering,
  onSelectDevice,
  onToggleFavorite,
  onAddToCompare,
  onOpenNewCustom,
  onEditCustom,
  onDeleteCustom,
}) => {
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    recent: true,
    "Android Phones": false,
    iPhone: false,
    Foldables: false,
    iPad: false,
    "Android Tablets": true,
    "Generic Devices": true,
  });

  const toggleSection = (key: string) => {
    setCollapsedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderCollection = (items: DevicePreset[]) => {
    if (viewMode === "card") {
      return (
        <div className="grid grid-cols-1 gap-2 pt-1 pb-2">
          {items.map((dev) => (
            <DeviceCard
              key={dev.id}
              device={dev}
              isSelected={dev.id === selectedDeviceId}
              isFavorite={favoriteIds.includes(dev.id)}
              isInCompare={compareDeviceIds.includes(dev.id)}
              onSelect={onSelectDevice}
              onToggleFavorite={onToggleFavorite}
              onAddToCompare={onAddToCompare}
              onEditCustom={dev.isCustom ? onEditCustom : undefined}
              onDeleteCustom={dev.isCustom ? onDeleteCustom : undefined}
            />
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-0.5 pt-0.5 pb-1.5">
        {items.map((dev) => (
          <CompactDeviceRow
            key={dev.id}
            device={dev}
            isSelected={dev.id === selectedDeviceId}
            isFavorite={favoriteIds.includes(dev.id)}
            onSelect={onSelectDevice}
            onToggleFavorite={onToggleFavorite}
            onAddToCompare={onAddToCompare}
            onEditCustom={dev.isCustom ? onEditCustom : undefined}
            onDeleteCustom={dev.isCustom ? onDeleteCustom : undefined}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-2 pb-6">
      {/* Pinned Quick Sections when not actively filtering */}
      {!isSearchingOrFiltering && (
        <>
          {/* Favorites */}
          {favoriteDevices.length > 0 && (
            <section className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-1.5 py-1">
              <button
                type="button"
                onClick={() => toggleSection("favorites")}
                aria-expanded={!collapsedSections["favorites"]}
                className="flex w-full items-center justify-between px-1.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300 cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>Favorites</span>
                </span>
                <span className="flex items-center gap-1 font-mono text-[11px] opacity-80">
                  <span>{favoriteDevices.length}</span>
                  {collapsedSections["favorites"] ? (
                    <ChevronRight className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </span>
              </button>
              {!collapsedSections["favorites"] && renderCollection(favoriteDevices)}
            </section>
          )}

          {/* Recently Used */}
          {recentDevices.length > 0 && (
            <section className="rounded-lg border border-slate-200 dark:border-slate-800/90 bg-slate-50/70 dark:bg-slate-900/40 px-1.5 py-1">
              <button
                type="button"
                onClick={() => toggleSection("recent")}
                aria-expanded={!collapsedSections["recent"]}
                className="flex w-full items-center justify-between px-1.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Recently Used</span>
                </span>
                <span className="flex items-center gap-1 font-mono text-[11px] text-slate-500">
                  <span>{recentDevices.length}</span>
                  {collapsedSections["recent"] ? (
                    <ChevronRight className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </span>
              </button>
              {!collapsedSections["recent"] && renderCollection(recentDevices)}
            </section>
          )}

          {/* Custom Devices */}
          {customDevices.length > 0 && (
            <section className="rounded-lg border border-indigo-500/25 bg-indigo-500/5 px-1.5 py-1">
              <div className="flex items-center justify-between px-1.5 py-1">
                <button
                  type="button"
                  onClick={() => toggleSection("custom")}
                  aria-expanded={!collapsedSections["custom"]}
                  className="flex flex-1 items-center gap-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 cursor-pointer"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Custom Profiles ({customDevices.length})</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenNewCustom}
                  className="text-[11px] font-medium text-indigo-600 dark:text-indigo-300 hover:underline cursor-pointer"
                >
                  + Add
                </button>
              </div>
              {!collapsedSections["custom"] && renderCollection(customDevices)}
            </section>
          )}
        </>
      )}

      {/* Empty Search Result */}
      {filteredDevices.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-800 p-6 text-center">
          <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
            No matching devices found
          </p>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Try searching a different model, brand, or create a custom viewport profile.
          </p>
          <button
            type="button"
            onClick={onOpenNewCustom}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 px-3 py-1.5 text-xs font-semibold text-sky-600 dark:text-sky-300 cursor-pointer"
          >
            + Create Custom Device
          </button>
        </div>
      ) : (
        /* Collapsible Device Categories */
        CATEGORY_METADATA.map((cat) => {
          const items = filteredDevices.filter((d) => d.category === cat.id);
          if (items.length === 0) return null;

          // Auto-expand categories when user is actively searching/filtering
          const isCollapsed = isSearchingOrFiltering ? false : Boolean(collapsedSections[cat.id]);

          return (
            <section
              key={cat.id}
              className="border-b border-slate-100 dark:border-slate-800/70 pb-1.5 last:border-b-0"
            >
              <button
                type="button"
                onClick={() => toggleSection(cat.id)}
                aria-expanded={!isCollapsed}
                className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left hover:bg-slate-100 dark:hover:bg-slate-900/70 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              >
                <span className="text-xs font-semibold tracking-tight text-slate-800 dark:text-slate-200">
                  {cat.sidebarLabel}
                </span>
                <span className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="rounded bg-slate-100 dark:bg-slate-800/90 px-1.5 py-0.2">
                    {items.length}
                  </span>
                  {isCollapsed ? (
                    <ChevronRight className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </span>
              </button>

              {!isCollapsed && renderCollection(items)}
            </section>
          );
        })
      )}
    </div>
  );
};
