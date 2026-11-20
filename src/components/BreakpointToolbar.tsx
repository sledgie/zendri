import React, { useState } from "react";
import { Smartphone, Tablet, Monitor, BookmarkPlus, X, Sliders } from "lucide-react";
import { QUICK_BREAKPOINT_WIDTHS } from "../data/deviceCatalog";
import { CustomViewportPreset } from "../types/device";

interface BreakpointToolbarProps {
  currentWidth: number;
  currentHeight: number;
  hasCustomOverride: boolean;
  customViewportPresets: CustomViewportPreset[];
  onApplyWidth: (width: number, suggestedHeight: number) => void;
  onSaveCustomViewportPreset: (label: string) => void;
  onDeleteCustomViewportPreset: (id: string) => void;
  onResetOverride: () => void;
}

export const BreakpointToolbar: React.FC<BreakpointToolbarProps> = ({
  currentWidth,
  currentHeight,
  hasCustomOverride,
  customViewportPresets,
  onApplyWidth,
  onSaveCustomViewportPreset,
  onDeleteCustomViewportPreset,
  onResetOverride,
}) => {
  const [activeGroup, setActiveGroup] = useState<"all" | "phone" | "tablet" | "desktop">("all");
  const [savingPreset, setSavingPreset] = useState(false);
  const [presetLabel, setPresetLabel] = useState("");
  const [editingCustomSize, setEditingCustomSize] = useState(false);
  const [customW, setCustomW] = useState(String(currentWidth));
  const [customH, setCustomH] = useState(String(currentHeight));

  const visibleBreakpoints =
    activeGroup === "all"
      ? QUICK_BREAKPOINT_WIDTHS
      : QUICK_BREAKPOINT_WIDTHS.filter((b) => b.group === activeGroup);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const label = presetLabel.trim() || `${currentWidth}×${currentHeight}`;
    onSaveCustomViewportPreset(label);
    setPresetLabel("");
    setSavingPreset(false);
  };

  const handleApplyCustomWH = (e: React.FormEvent) => {
    e.preventDefault();
    const w = Math.min(3840, Math.max(200, Math.round(Number(customW) || currentWidth)));
    const h = Math.min(3840, Math.max(200, Math.round(Number(customH) || currentHeight)));
    onApplyWidth(w, h);
    setEditingCustomSize(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800/90 bg-slate-50/90 dark:bg-slate-900/65 px-3 py-1.5 text-xs shrink-0">
      {/* Group Filter Pills: All / Phone / Tablet / Desktop */}
      <div
        role="group"
        aria-label="Filter breakpoint presets by form factor"
        className="inline-flex items-center rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-0.5 shrink-0"
      >
        <button
          type="button"
          onClick={() => setActiveGroup("all")}
          aria-pressed={activeGroup === "all"}
          className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors cursor-pointer ${
            activeGroup === "all"
              ? "bg-sky-500 text-slate-950 font-semibold"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setActiveGroup("phone")}
          aria-pressed={activeGroup === "phone"}
          title="Phone breakpoint widths"
          className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium transition-colors cursor-pointer ${
            activeGroup === "phone"
              ? "bg-sky-500 text-slate-950 font-semibold"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Smartphone className="w-3 h-3" />
          <span>Phone</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveGroup("tablet")}
          aria-pressed={activeGroup === "tablet"}
          title="Tablet breakpoint widths"
          className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium transition-colors cursor-pointer ${
            activeGroup === "tablet"
              ? "bg-sky-500 text-slate-950 font-semibold"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Tablet className="w-3 h-3" />
          <span>Tablet</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveGroup("desktop")}
          aria-pressed={activeGroup === "desktop"}
          title="Desktop & laptop breakpoint widths"
          className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium transition-colors cursor-pointer ${
            activeGroup === "desktop"
              ? "bg-sky-500 text-slate-950 font-semibold"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Monitor className="w-3 h-3" />
          <span>Desktop</span>
        </button>
      </div>

      {/* Scrollable Breakpoint Width Buttons */}
      <div className="flex flex-1 items-center gap-1 overflow-x-auto dev-scroll py-0.5">
        {visibleBreakpoints.map((bp) => {
          const isActive = currentWidth === bp.width;
          return (
            <button
              key={bp.width}
              type="button"
              onClick={() => onApplyWidth(bp.width, bp.defaultHeight)}
              title={`${bp.width}px — ${bp.hint} (sets ${bp.width}×${bp.defaultHeight})`}
              aria-pressed={isActive}
              className={`shrink-0 rounded-md border px-2 py-0.5 font-mono text-[11px] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                isActive
                  ? "border-sky-500 bg-sky-500/15 text-sky-700 dark:text-sky-300 font-semibold"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/70 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              {bp.width}px
            </button>
          );
        })}

        {/* User-saved Custom Viewport Presets */}
        {customViewportPresets.map((cp) => {
          const isActive = currentWidth === cp.width && currentHeight === cp.height;
          return (
            <div
              key={cp.id}
              className={`inline-flex shrink-0 items-center rounded-md border text-[11px] ${
                isActive
                  ? "border-indigo-500 bg-indigo-500/15 text-indigo-700 dark:text-indigo-300"
                  : "border-indigo-500/30 bg-indigo-500/5 text-indigo-600 dark:text-indigo-300"
              }`}
            >
              <button
                type="button"
                onClick={() => onApplyWidth(cp.width, cp.height)}
                title={`Custom viewport preset: ${cp.label} (${cp.width}×${cp.height})`}
                className="px-2 py-0.5 font-mono cursor-pointer"
              >
                {cp.label}
              </button>
              <button
                type="button"
                onClick={() => onDeleteCustomViewportPreset(cp.id)}
                title={`Delete preset ${cp.label}`}
                aria-label={`Delete preset ${cp.label}`}
                className="pr-1.5 text-indigo-400 hover:text-rose-400 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Custom W×H Setter + Save Current Size as Preset + Override Indicator */}
      <div className="flex items-center gap-1.5 shrink-0">
        {hasCustomOverride && (
          <button
            type="button"
            onClick={onResetOverride}
            title="Restore selected device's default preset dimensions"
            className="rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 cursor-pointer"
          >
            Custom • Reset
          </button>
        )}

        {editingCustomSize ? (
          <form onSubmit={handleApplyCustomWH} className="flex items-center gap-1">
            <input
              type="number"
              min={200}
              max={3840}
              value={customW}
              onChange={(e) => setCustomW(e.target.value)}
              aria-label="Custom viewport width in CSS pixels"
              className="w-14 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-1.5 py-0.5 font-mono text-[11px] text-slate-900 dark:text-slate-100"
            />
            <span className="text-slate-400">×</span>
            <input
              type="number"
              min={200}
              max={3840}
              value={customH}
              onChange={(e) => setCustomH(e.target.value)}
              aria-label="Custom viewport height in CSS pixels"
              className="w-14 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-1.5 py-0.5 font-mono text-[11px] text-slate-900 dark:text-slate-100"
            />
            <button
              type="submit"
              className="rounded bg-sky-500 px-2 py-0.5 text-[11px] font-semibold text-slate-950 cursor-pointer"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={() => setEditingCustomSize(false)}
              className="p-0.5 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => {
              setCustomW(String(currentWidth));
              setCustomH(String(currentHeight));
              setEditingCustomSize(true);
            }}
            title="Set custom W × H CSS pixels"
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-300 cursor-pointer"
          >
            <Sliders className="w-3 h-3" />
            <span className="hidden xl:inline">W×H</span>
          </button>
        )}

        {savingPreset ? (
          <form onSubmit={handleSave} className="flex items-center gap-1">
            <input
              type="text"
              value={presetLabel}
              onChange={(e) => setPresetLabel(e.target.value)}
              placeholder={`${currentWidth}×${currentHeight}`}
              aria-label="Custom viewport preset label"
              autoFocus
              className="w-24 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-1.5 py-0.5 text-[11px] text-slate-900 dark:text-slate-100 focus:border-sky-500 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded bg-sky-500 px-2 py-0.5 text-[11px] font-semibold text-slate-950 cursor-pointer"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setSavingPreset(false)}
              className="p-0.5 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setSavingPreset(true)}
            title={`Save ${currentWidth}×${currentHeight} as a quick viewport preset`}
            aria-label="Save current viewport size as quick preset"
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            <BookmarkPlus className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Save Size</span>
          </button>
        )}
      </div>
    </div>
  );
};
