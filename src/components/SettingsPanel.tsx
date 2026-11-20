import React, { useEffect } from "react";
import { X, SlidersHorizontal, RotateCcw } from "lucide-react";
import { DeveloperOverlayState, WorkspaceSettings, ZoomPreset } from "../types/device";

interface SettingsPanelProps {
  isOpen: boolean;
  settings: WorkspaceSettings;
  overlays: DeveloperOverlayState;
  customCount: number;
  favoritesCount: number;
  onClose: () => void;
  onUpdateSettings: (patch: Partial<WorkspaceSettings>) => void;
  onToggleOverlay: (key: keyof DeveloperOverlayState) => void;
  onClearFavoritesAndHistory: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  settings,
  overlays,
  customCount,
  favoritesCount,
  onClose,
  onUpdateSettings,
  onToggleOverlay,
  onClearFavoritesAndHistory,
}) => {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-xs"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xl overflow-hidden text-xs">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/15 text-sky-500">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="settings-dialog-title"
                className="text-sm font-bold text-slate-900 dark:text-slate-100"
              >
                Workspace Settings
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Configure inspection canvas, overlays, and accessibility
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Settings"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Canvas Backdrop */}
          <div>
            <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
              Inspection Canvas Backdrop
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: "dark", label: "Deep Studio" },
                  { id: "slate", label: "Muted Slate" },
                  { id: "paper", label: "Light Grid" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onUpdateSettings({ canvasBackdrop: opt.id })}
                  aria-pressed={settings.canvasBackdrop === opt.id}
                  className={`rounded-lg border px-2.5 py-2 font-medium transition-colors cursor-pointer ${
                    settings.canvasBackdrop === opt.id
                      ? "border-sky-500 bg-sky-500/15 text-sky-700 dark:text-sky-300 font-semibold"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              Deep Studio dark canvas is recommended to maximize website edge contrast.
            </p>
          </div>

          {/* Default Zoom */}
          <div>
            <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
              Default Zoom on Reset
            </label>
            <select
              value={settings.defaultZoom}
              onChange={(e) =>
                onUpdateSettings({ defaultZoom: e.target.value as ZoomPreset })
              }
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100"
            >
              <option value="fit">Fit to Workspace (Recommended)</option>
              <option value="50">50%</option>
              <option value="75">75%</option>
              <option value="100">100% (1:1 CSS Pixel Scale)</option>
            </select>
          </div>

          {/* Toggle switches */}
          <div className="space-y-2.5 border-t border-slate-200 dark:border-slate-800 pt-3.5">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  Show Camera Notch / Dynamic Island
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Simulate front camera cutouts inside device bezel
                </div>
              </div>
              <input
                type="checkbox"
                checked={overlays.showCutout}
                onChange={() => onToggleOverlay("showCutout")}
                className="h-4 w-4 accent-sky-500 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  Show Viewport Dimensions Pill
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Display model, CSS dimensions, orientation, and zoom above device
                </div>
              </div>
              <input
                type="checkbox"
                checked={overlays.showDimensionsBadge}
                onChange={() => onToggleOverlay("showDimensionsBadge")}
                className="h-4 w-4 accent-sky-500 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  Reduced Motion Mode
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Minimize layout scale and transition animations
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.reducedMotion}
                onChange={(e) => onUpdateSettings({ reducedMotion: e.target.checked })}
                className="h-4 w-4 accent-sky-500 rounded cursor-pointer"
              />
            </label>
          </div>

          {/* Local Persistence Summary */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3 flex items-center justify-between gap-2">
            <div>
              <div className="font-semibold text-slate-800 dark:text-slate-200">
                Local Browser Data
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {favoritesCount} favorites • {customCount} custom devices
              </div>
            </div>
            <button
              type="button"
              onClick={onClearFavoritesAndHistory}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 dark:border-slate-700 hover:border-rose-500/50 hover:text-rose-500 px-2.5 py-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-300 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear History</span>
            </button>
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-200 dark:border-slate-800 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-sky-500 hover:bg-sky-400 px-4 py-1.5 font-semibold text-slate-950 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
