import React, { useState } from "react";
import {
  RotateCcw,
  RotateCw,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Ruler,
  Grid,
  ShieldAlert,
  Camera,
  Smartphone,
  Star,
  ExternalLink,
  Layers,
  Scan,
} from "lucide-react";
import {
  DeveloperOverlayState,
  DevicePreset,
  Orientation,
  ZoomPreset,
} from "../types/device";

interface PreviewToolbarProps {
  selectedDevice: DevicePreset;
  allDevices: DevicePreset[];
  width: number;
  height: number;
  orientation: Orientation;
  zoomMode: ZoomPreset;
  customZoom: number;
  effectiveScale: number;
  isFavorite: boolean;
  isFullscreen: boolean;
  activeUrl: string;
  overlays: DeveloperOverlayState;
  onSelectDeviceById: (deviceId: string) => void;
  onToggleFavorite: (deviceId: string) => void;
  onSetOrientation: (orientation: Orientation) => void;
  onSetZoomMode: (mode: ZoomPreset) => void;
  onSetCustomZoom: (zoomPercent: number) => void;
  onToggleOverlay: (key: keyof DeveloperOverlayState) => void;
  onReload: () => void;
  onReset: () => void;
  onOpenNewTab: () => void;
  onToggleFullscreen: () => void;
  onCaptureScreenshot: () => void;
}

export const PreviewToolbar: React.FC<PreviewToolbarProps> = ({
  selectedDevice,
  allDevices,
  width,
  height,
  orientation,
  zoomMode,
  customZoom,
  effectiveScale,
  isFavorite,
  isFullscreen,
  activeUrl,
  overlays,
  onSelectDeviceById,
  onToggleFavorite,
  onSetOrientation,
  onSetZoomMode,
  onSetCustomZoom,
  onToggleOverlay,
  onReload,
  onReset,
  onOpenNewTab,
  onToggleFullscreen,
  onCaptureScreenshot,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyDimensions = async () => {
    const text = `${width} × ${height} CSS px`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const displayedScalePct = Math.round(effectiveScale * 100);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800/90 bg-white dark:bg-slate-950 px-3 py-1.5 text-xs shrink-0">
      {/* Left: Selected Device Quick Switcher + Favorite + Copy Dimensions */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-2 py-1">
          <Smartphone className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400 shrink-0" />
          <select
            aria-label="Selected device preset"
            value={selectedDevice.id}
            onChange={(e) => onSelectDeviceById(e.target.value)}
            className="max-w-[190px] sm:max-w-[230px] bg-transparent font-semibold text-slate-900 dark:text-slate-100 text-xs focus:outline-none cursor-pointer"
          >
            {allDevices.map((dev) => (
              <option
                key={dev.id}
                value={dev.id}
                className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              >
                {dev.name} ({dev.viewportWidth}×{dev.viewportHeight})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => onToggleFavorite(selectedDevice.id)}
            title={isFavorite ? "Remove from Favorites" : "Save Favorite Device"}
            aria-label={isFavorite ? "Remove from Favorites" : "Save Favorite Device"}
            aria-pressed={isFavorite}
            className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
          >
            <Star
              className={`w-3.5 h-3.5 ${
                isFavorite ? "fill-amber-400 text-amber-400" : "text-slate-400"
              }`}
            />
          </button>
        </div>

        {/* Dimensions Readout + Copy Dimensions */}
        <button
          type="button"
          onClick={handleCopyDimensions}
          title="Copy current viewport dimensions (e.g., 393 × 852 CSS px)"
          aria-label={`Copy dimensions ${width} by ${height} CSS pixels`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:border-sky-500/50 px-2.5 py-1 font-mono text-xs text-slate-800 dark:text-slate-200 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        >
          <span className="font-semibold">
            {width} × {height}
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">CSS px</span>
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <Copy className="w-3 h-3 text-slate-400" />
          )}
        </button>

        {/* Orientation Switcher: Portrait / Landscape */}
        <div
          role="group"
          aria-label="Viewport orientation"
          className="inline-flex items-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-0.5"
        >
          <button
            type="button"
            onClick={() => onSetOrientation("portrait")}
            aria-pressed={orientation === "portrait"}
            title="Portrait orientation"
            className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
              orientation === "portrait"
                ? "bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-300 font-semibold shadow-xs"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Portrait
          </button>
          <button
            type="button"
            onClick={() => onSetOrientation("landscape")}
            aria-pressed={orientation === "landscape"}
            title="Landscape orientation"
            className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
              orientation === "landscape"
                ? "bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-300 font-semibold shadow-xs"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Landscape
          </button>
        </div>
      </div>

      {/* Center/Right: Zoom + Developer Overlays + Actions */}
      <div className="flex flex-wrap items-center gap-1.5">
        {/* Zoom Preset Selector + Custom Zoom */}
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-2 py-1">
          <span className="text-[11px] text-slate-400 dark:text-slate-500">Zoom:</span>
          <select
            aria-label="Preview visual zoom level"
            value={zoomMode}
            onChange={(e) => onSetZoomMode(e.target.value as ZoomPreset)}
            className="bg-transparent font-mono text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="fit" className="bg-white dark:bg-slate-900">
              Fit ({displayedScalePct}%)
            </option>
            <option value="50" className="bg-white dark:bg-slate-900">
              50%
            </option>
            <option value="75" className="bg-white dark:bg-slate-900">
              75%
            </option>
            <option value="100" className="bg-white dark:bg-slate-900">
              100%
            </option>
            <option value="125" className="bg-white dark:bg-slate-900">
              125%
            </option>
            <option value="custom" className="bg-white dark:bg-slate-900">
              Custom ({customZoom}%)
            </option>
          </select>

          {zoomMode === "custom" && (
            <input
              type="range"
              min={25}
              max={175}
              step={5}
              value={customZoom}
              onChange={(e) => onSetCustomZoom(Number(e.target.value))}
              aria-label="Custom visual zoom percentage"
              className="w-16 accent-sky-500 cursor-pointer"
            />
          )}
        </div>

        {/* Developer Overlay Toggles */}
        <div
          role="group"
          aria-label="Developer visual inspection overlays"
          className="inline-flex items-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-0.5 gap-0.5"
        >
          <button
            type="button"
            onClick={() => onToggleOverlay("showRuler")}
            title="Toggle Viewport Pixel Ruler"
            aria-label="Toggle Viewport Pixel Ruler"
            aria-pressed={overlays.showRuler}
            className={`p-1.5 rounded-md transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
              overlays.showRuler
                ? "bg-sky-500/20 text-sky-600 dark:text-sky-300"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Ruler className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onToggleOverlay("showSafeArea")}
            title="Toggle Approximate Safe Area Guides"
            aria-label="Toggle Approximate Safe Area Guides"
            aria-pressed={overlays.showSafeArea}
            className={`p-1.5 rounded-md transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
              overlays.showSafeArea
                ? "bg-amber-500/20 text-amber-600 dark:text-amber-300"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onToggleOverlay("showGrid")}
            title="Toggle 12-Column Layout Grid Overlay"
            aria-label="Toggle Layout Grid Overlay"
            aria-pressed={overlays.showGrid}
            className={`p-1.5 rounded-md transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
              overlays.showGrid
                ? "bg-indigo-500/20 text-indigo-600 dark:text-indigo-300"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onToggleOverlay("showBreakpointMarkers")}
            title="Toggle CSS Media Query Breakpoint Markers"
            aria-label="Toggle Breakpoint Markers"
            aria-pressed={overlays.showBreakpointMarkers}
            className={`p-1.5 rounded-md transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
              overlays.showBreakpointMarkers
                ? "bg-violet-500/20 text-violet-600 dark:text-violet-300"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onToggleOverlay("showDeviceFrame")}
            title="Toggle Hardware Bezel Frame"
            aria-label="Toggle Hardware Bezel Frame"
            aria-pressed={overlays.showDeviceFrame}
            className={`p-1.5 rounded-md transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
              overlays.showDeviceFrame
                ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Scan className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Reload, Reset, Screenshot, Open in New Tab, Fullscreen */}
        <div className="inline-flex items-center gap-1">
          <button
            type="button"
            onClick={onReload}
            disabled={!activeUrl}
            title="Reload preview"
            aria-label="Reload preview"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none text-slate-600 dark:text-slate-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onReset}
            title="Reset viewport to preset default dimensions and portrait orientation"
            aria-label="Reset viewport to preset defaults"
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 px-2 py-1.5 text-[11px] font-medium text-slate-700 dark:text-slate-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Reset</span>
          </button>

          <button
            type="button"
            onClick={onCaptureScreenshot}
            title="Export Viewport Specification Snapshot PNG"
            aria-label="Export Viewport Specification Snapshot PNG"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onOpenNewTab}
            disabled={!activeUrl}
            title="Open website in new tab"
            aria-label="Open website in new tab"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none text-slate-600 dark:text-slate-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onToggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen Workspace" : "Enter Fullscreen Workspace"}
            aria-label={isFullscreen ? "Exit Fullscreen Workspace" : "Enter Fullscreen Workspace"}
            aria-pressed={isFullscreen}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
              isFullscreen
                ? "border-sky-500 bg-sky-500/15 text-sky-500 dark:text-sky-300"
                : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            }`}
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
