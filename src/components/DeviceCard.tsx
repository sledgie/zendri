import React from "react";
import {
  Star,
  Smartphone,
  Tablet,
  Monitor,
  FoldHorizontal,
  PlusCircle,
  Pencil,
  Trash2,
} from "lucide-react";
import { DevicePreset } from "../types/device";

interface DeviceCardProps {
  device: DevicePreset;
  isSelected: boolean;
  isFavorite: boolean;
  isInCompare: boolean;
  onSelect: (device: DevicePreset) => void;
  onToggleFavorite: (deviceId: string) => void;
  onAddToCompare: (device: DevicePreset) => void;
  onEditCustom?: (device: DevicePreset) => void;
  onDeleteCustom?: (deviceId: string) => void;
}

export function getDeviceCategoryIcon(category: DevicePreset["category"]) {
  switch (category) {
    case "iPad":
    case "Android Tablets":
      return Tablet;
    case "Foldables":
      return FoldHorizontal;
    case "Generic Devices":
      return Monitor;
    default:
      return Smartphone;
  }
}

export const DeviceCard: React.FC<DeviceCardProps> = ({
  device,
  isSelected,
  isFavorite,
  isInCompare,
  onSelect,
  onToggleFavorite,
  onAddToCompare,
  onEditCustom,
  onDeleteCustom,
}) => {
  const Icon = getDeviceCategoryIcon(device.category);

  return (
    <div
      className={`group relative rounded-xl border p-2.5 transition-all ${
        isSelected
          ? "border-sky-500 bg-sky-500/10 dark:bg-sky-500/12 shadow-sm"
          : "border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={() => onSelect(device)}
          className="flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded cursor-pointer min-w-0"
        >
          <div className="flex items-center gap-1.5">
            <Icon
              className={`w-3.5 h-3.5 shrink-0 ${
                isSelected ? "text-sky-500 dark:text-sky-400" : "text-slate-400 dark:text-slate-500"
              }`}
            />
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
              {device.name}
            </span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {device.manufacturer}
            </span>
            <span>•</span>
            <span>{device.category}</span>
          </div>
        </button>

        {/* Action icons */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={() => onToggleFavorite(device.id)}
            title={isFavorite ? "Remove from Favorites" : "Save to Favorites"}
            aria-label={
              isFavorite ? `Remove ${device.name} from favorites` : `Add ${device.name} to favorites`
            }
            aria-pressed={isFavorite}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
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
            title={isInCompare ? "Already in Compare Mode (click to add another slot)" : "Add to Compare Mode"}
            aria-label={`Add ${device.name} to Compare Mode`}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            <PlusCircle className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom metrics bar */}
      <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-1.5">
        <button
          type="button"
          onClick={() => onSelect(device)}
          className="flex items-center gap-1.5 font-mono text-[11px] text-slate-700 dark:text-slate-300 cursor-pointer"
        >
          <span className="font-semibold">
            {device.viewportWidth} × {device.viewportHeight}
          </span>
          <span className="text-slate-400 dark:text-slate-500">@{device.dpr}x</span>
        </button>

        <div className="flex items-center gap-1">
          {device.foldState !== "none" && (
            <span className="rounded bg-violet-500/15 px-1.5 py-0.5 text-[10px] font-medium text-violet-600 dark:text-violet-300 capitalize">
              {device.foldState}
            </span>
          )}

          {device.isCustom ? (
            <div className="flex items-center gap-0.5">
              <span className="rounded bg-indigo-500/15 px-1.5 py-0.5 text-[10px] font-medium text-indigo-600 dark:text-indigo-300">
                Custom
              </span>
              {onEditCustom && (
                <button
                  type="button"
                  onClick={() => onEditCustom(device)}
                  title={`Edit ${device.name}`}
                  aria-label={`Edit custom device ${device.name}`}
                  className="p-0.5 text-slate-400 hover:text-sky-400 cursor-pointer"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              )}
              {onDeleteCustom && (
                <button
                  type="button"
                  onClick={() => onDeleteCustom(device.id)}
                  title={`Delete ${device.name}`}
                  aria-label={`Delete custom device ${device.name}`}
                  className="p-0.5 text-slate-400 hover:text-rose-400 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ) : device.accuracy === "estimated" ? (
            <span
              title="Estimated CSS viewport preset"
              className="rounded bg-amber-500/15 border border-amber-500/25 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-300"
            >
              Est.
            </span>
          ) : (
            <span
              title="Verified CSS viewport preset"
              className="rounded bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-400"
            >
              Verified
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
