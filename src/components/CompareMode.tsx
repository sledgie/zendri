import React, { useState } from "react";
import {
  Plus,
  Trash2,
  RotateCw,
  RefreshCw,
  Link2,
  Rows3,
  Columns3,
  Copy,
  Check,
} from "lucide-react";
import {
  CompareDeviceSlot,
  DeveloperOverlayState,
  DevicePreset,
  Orientation,
  PreviewStatus,
  WorkspaceSettings,
  ZoomPreset,
} from "../types/device";
import { getOrientedDimensions } from "../data/deviceCatalog";
import { DeviceFrame } from "./DeviceFrame";

interface CompareModeProps {
  slots: CompareDeviceSlot[];
  allDevices: DevicePreset[];
  url: string;
  globalReloadKey: number;
  overlays: DeveloperOverlayState;
  canvasBackdrop: WorkspaceSettings["canvasBackdrop"];
  syncRotation: boolean;
  onToggleSyncRotation: () => void;
  onAddSlot: (deviceId?: string) => void;
  onRemoveSlot: (slotId: string) => void;
  onUpdateSlot: (slotId: string, patch: Partial<CompareDeviceSlot>) => void;
  onRotateAll: (orientation: Orientation) => void;
  onReloadAll: () => void;
  onSetAllZoom: (zoom: ZoomPreset) => void;
  onStatusChange: (status: PreviewStatus) => void;
  onLoadSampleUrl: (sampleUrl: string) => void;
  onOpenNewTab: () => void;
}

export const CompareMode: React.FC<CompareModeProps> = ({
  slots,
  allDevices,
  url,
  globalReloadKey,
  overlays,
  canvasBackdrop,
  syncRotation,
  onToggleSyncRotation,
  onAddSlot,
  onRemoveSlot,
  onUpdateSlot,
  onRotateAll,
  onReloadAll,
  onSetAllZoom,
  onStatusChange,
  onLoadSampleUrl,
  onOpenNewTab,
}) => {
  const [layoutFlow, setLayoutFlow] = useState<"side-by-side" | "stacked">("side-by-side");
  const [copiedSlotId, setCopiedSlotId] = useState<string | null>(null);

  const backdropClass =
    canvasBackdrop === "paper"
      ? "studio-canvas-paper"
      : canvasBackdrop === "slate"
      ? "studio-canvas-light"
      : "studio-canvas-dark";

  const handleSlotOrientation = (slotId: string, nextOrientation: Orientation) => {
    if (syncRotation) {
      onRotateAll(nextOrientation);
    } else {
      onUpdateSlot(slotId, { orientation: nextOrientation });
    }
  };

  const getSlotScale = (slot: CompareDeviceSlot, width: number, height: number): number => {
    if (slot.zoomMode === "fit") {
      // Smart fit for side-by-side comparison cards (~520px tall comfortable viewport)
      const scaleW = 430 / (width + 32);
      const scaleH = 540 / (height + 32);
      return Math.max(0.28, Math.min(1, scaleW, scaleH));
    }
    if (slot.zoomMode === "custom") {
      return slot.customZoom / 100;
    }
    return Number(slot.zoomMode) / 100;
  };

  const handleCopyDims = async (slotId: string, w: number, h: number) => {
    try {
      await navigator.clipboard.writeText(`${w} × ${h} CSS px`);
      setCopiedSlotId(slotId);
      setTimeout(() => setCopiedSlotId(null), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Compare Mode Dedicated Control Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800/90 bg-white dark:bg-slate-950 px-3 py-2 text-xs shrink-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-slate-900 dark:text-slate-100">
            Side-by-Side Comparison ({slots.length} {slots.length === 1 ? "Device" : "Devices"})
          </span>

          <button
            type="button"
            onClick={() => onAddSlot()}
            className="inline-flex items-center gap-1 rounded-lg bg-sky-500 hover:bg-sky-400 px-2.5 py-1 text-xs font-semibold text-slate-950 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Device</span>
          </button>

          <button
            type="button"
            onClick={onReloadAll}
            disabled={!url}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload All</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Synchronized Rotation Toggle */}
          <button
            type="button"
            onClick={onToggleSyncRotation}
            aria-pressed={syncRotation}
            title="When enabled, rotating one device rotates all comparison devices together"
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
              syncRotation
                ? "border-indigo-500/60 bg-indigo-500/15 text-indigo-700 dark:text-indigo-200"
                : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400"
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Sync Rotation</span>
          </button>

          {/* Quick Global Zoom for All Slots */}
          <div className="hidden sm:flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-2 py-0.5">
            <span className="text-[11px] text-slate-400">All Zoom:</span>
            {(["fit", "50", "75", "100"] as ZoomPreset[]).map((z) => (
              <button
                key={z}
                type="button"
                onClick={() => onSetAllZoom(z)}
                className="rounded px-1.5 py-0.5 font-mono text-[11px] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
              >
                {z === "fit" ? "Fit" : `${z}%`}
              </button>
            ))}
          </div>

          {/* Layout Flow Switcher (Side-by-Side Horizontal Scroll vs Stacked / Wrapped) */}
          <div
            role="group"
            aria-label="Comparison layout arrangement"
            className="inline-flex rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-0.5"
          >
            <button
              type="button"
              onClick={() => setLayoutFlow("side-by-side")}
              title="Side-by-side horizontal row"
              aria-label="Side-by-side horizontal row"
              aria-pressed={layoutFlow === "side-by-side"}
              className={`p-1 rounded cursor-pointer ${
                layoutFlow === "side-by-side"
                  ? "bg-white dark:bg-slate-800 text-sky-500 shadow-xs"
                  : "text-slate-400"
              }`}
            >
              <Columns3 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setLayoutFlow("stacked")}
              title="Stacked / wrapped layout for smaller screens"
              aria-label="Stacked layout"
              aria-pressed={layoutFlow === "stacked"}
              className={`p-1 rounded cursor-pointer ${
                layoutFlow === "stacked"
                  ? "bg-white dark:bg-slate-800 text-sky-500 shadow-xs"
                  : "text-slate-400"
              }`}
            >
              <Rows3 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Multi-Device Canvas */}
      <div className={`flex-1 overflow-auto dev-scroll ${backdropClass} p-5 sm:p-7`}>
        <div
          className={
            layoutFlow === "side-by-side"
              ? "flex flex-col md:flex-row items-center md:items-start gap-7 w-max min-w-full justify-center"
              : "flex flex-col items-center gap-8 w-full"
          }
        >
          {slots.map((slot, index) => {
            const device =
              allDevices.find((d) => d.id === slot.deviceId) ?? allDevices[0];
            const { width, height } = getOrientedDimensions(
              device.viewportWidth,
              device.viewportHeight,
              slot.orientation
            );
            const scale = getSlotScale(slot, width, height);

            return (
              <section
                key={slot.slotId}
                aria-label={`Comparison slot ${index + 1}: ${device.name}`}
                className="flex flex-col items-center rounded-2xl border border-slate-800/90 bg-slate-950/65 p-4 backdrop-blur-xs shadow-xl"
              >
                {/* Independent Per-Slot Control Header */}
                <div className="mb-3 flex w-full flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/20 font-mono text-[10px] font-bold text-indigo-300">
                      {index + 1}
                    </span>
                    <select
                      aria-label={`Select device for slot ${index + 1}`}
                      value={device.id}
                      onChange={(e) => {
                        const chosen = allDevices.find((d) => d.id === e.target.value);
                        onUpdateSlot(slot.slotId, {
                          deviceId: e.target.value,
                          orientation: chosen?.defaultOrientation ?? "portrait",
                        });
                      }}
                      className="max-w-[180px] rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs font-semibold text-slate-100 focus:border-sky-500 focus:outline-none cursor-pointer"
                    >
                      {allDevices.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.viewportWidth}×{d.viewportHeight})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Independent Orientation Toggle */}
                    <button
                      type="button"
                      onClick={() =>
                        handleSlotOrientation(
                          slot.slotId,
                          slot.orientation === "portrait" ? "landscape" : "portrait"
                        )
                      }
                      title={`Switch to ${
                        slot.orientation === "portrait" ? "Landscape" : "Portrait"
                      }`}
                      className="rounded-md border border-slate-700 bg-slate-900 hover:bg-slate-800 px-2 py-1 text-[11px] font-medium text-slate-200 capitalize cursor-pointer"
                    >
                      {slot.orientation}
                    </button>

                    {/* Independent Zoom Selector */}
                    <select
                      aria-label={`Zoom for ${device.name}`}
                      value={slot.zoomMode}
                      onChange={(e) =>
                        onUpdateSlot(slot.slotId, {
                          zoomMode: e.target.value as ZoomPreset,
                        })
                      }
                      className="rounded-md border border-slate-700 bg-slate-900 px-1.5 py-1 font-mono text-[11px] text-slate-200 focus:border-sky-500 focus:outline-none cursor-pointer"
                    >
                      <option value="fit">Fit ({Math.round(scale * 100)}%)</option>
                      <option value="50">50%</option>
                      <option value="75">75%</option>
                      <option value="100">100%</option>
                      <option value="125">125%</option>
                    </select>

                    {/* Copy slot dimensions */}
                    <button
                      type="button"
                      onClick={() => handleCopyDims(slot.slotId, width, height)}
                      title={`Copy ${width} × ${height} CSS px`}
                      aria-label={`Copy dimensions for ${device.name}`}
                      className="p-1.5 rounded-md border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 cursor-pointer"
                    >
                      {copiedSlotId === slot.slotId ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Reload single slot */}
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateSlot(slot.slotId, { reloadKey: slot.reloadKey + 1 })
                      }
                      disabled={!url}
                      title={`Reload ${device.name} preview`}
                      aria-label={`Reload ${device.name} preview`}
                      className="p-1.5 rounded-md border border-slate-700 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 cursor-pointer"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>

                    {/* Remove slot */}
                    {slots.length > 1 && (
                      <button
                        type="button"
                        onClick={() => onRemoveSlot(slot.slotId)}
                        title={`Remove ${device.name} from comparison`}
                        aria-label={`Remove ${device.name} from comparison`}
                        className="p-1.5 rounded-md border border-slate-700 bg-slate-900 hover:border-rose-500/50 hover:text-rose-400 text-slate-400 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <DeviceFrame
                  device={device}
                  width={width}
                  height={height}
                  orientation={slot.orientation}
                  scale={scale}
                  url={url}
                  reloadKey={globalReloadKey + slot.reloadKey}
                  overlays={{ ...overlays, showDimensionsBadge: true }}
                  compactHeader
                  onStatusChange={index === 0 ? onStatusChange : undefined}
                  onLoadSampleUrl={onLoadSampleUrl}
                  onOpenNewTab={onOpenNewTab}
                  onReload={() =>
                    onUpdateSlot(slot.slotId, { reloadKey: slot.reloadKey + 1 })
                  }
                />
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
};
