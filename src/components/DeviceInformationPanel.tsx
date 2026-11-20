import React, { useState } from "react";
import {
  X,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Pencil,
  Trash2,
  Info,
} from "lucide-react";
import { DevicePreset, Orientation } from "../types/device";
import { formatAspectRatio, getActiveCssBreakpointLabel } from "../data/deviceCatalog";

interface DeviceInformationPanelProps {
  isOpen: boolean;
  device: DevicePreset;
  width: number;
  height: number;
  orientation: Orientation;
  hasCustomOverride: boolean;
  onClose: () => void;
  onEditCustom: (device: DevicePreset) => void;
  onDeleteCustom: (deviceId: string) => void;
}

export const DeviceInformationPanel: React.FC<DeviceInformationPanelProps> = ({
  isOpen,
  device,
  width,
  height,
  orientation,
  hasCustomOverride,
  onClose,
  onEditCustom,
  onDeleteCustom,
}) => {
  const [copiedCss, setCopiedCss] = useState(false);

  if (!isOpen) return null;

  const physicalW = Math.round(width * device.dpr);
  const physicalH = Math.round(height * device.dpr);
  const aspect = formatAspectRatio(width, height);
  const bpMeta = getActiveCssBreakpointLabel(width);

  const mediaQuerySnippet = `@media (max-width: ${width}px) and (orientation: ${orientation}) { /* ${device.name} */ }`;

  const handleCopyMediaQuery = async () => {
    try {
      await navigator.clipboard.writeText(mediaQuerySnippet);
      setCopiedCss(true);
      setTimeout(() => setCopiedCss(false), 1800);
    } catch {
      // ignore
    }
  };

  return (
    <aside
      aria-label="Device Information Panel"
      className="fixed inset-y-0 right-0 z-40 flex w-80 max-w-[90vw] flex-col border-l border-slate-200 dark:border-slate-800/90 bg-white dark:bg-slate-950 xl:static xl:z-10 shrink-0 shadow-2xl xl:shadow-none"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/90 px-3.5 py-2.5">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Device Specifications
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
            {device.family}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          title="Close Device Information Panel"
          aria-label="Close Device Information Panel"
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable Inspector Body */}
      <div className="flex-1 overflow-y-auto dev-scroll p-3.5 space-y-4 text-xs">
        {/* Title + Accuracy Status Card */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/70 p-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {device.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {device.manufacturer} • {device.platform}
              </p>
            </div>
            {device.isCustom ? (
              <span className="rounded-full bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-semibold text-indigo-600 dark:text-indigo-300">
                Custom Profile
              </span>
            ) : device.accuracy === "verified" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="w-3 h-3" />
                Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                <AlertCircle className="w-3 h-3" />
                Estimated
              </span>
            )}
          </div>

          <p className="mt-2.5 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
            {device.notes}
          </p>

          {device.isCustom && (
            <div className="mt-3 flex items-center gap-2 border-t border-slate-200 dark:border-slate-800 pt-2.5">
              <button
                type="button"
                onClick={() => onEditCustom(device)}
                className="inline-flex items-center gap-1 rounded-md border border-slate-300 dark:border-slate-700 px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-200 hover:border-sky-500 cursor-pointer"
              >
                <Pencil className="w-3 h-3" />
                Edit Profile
              </button>
              <button
                type="button"
                onClick={() => onDeleteCustom(device.id)}
                className="inline-flex items-center gap-1 rounded-md border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-[11px] font-medium text-rose-600 dark:text-rose-300 hover:bg-rose-500/20 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Key Specification Rows */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Viewport & Hardware Metrics
          </div>
          <dl className="divide-y divide-slate-100 dark:divide-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 px-3">
            <div className="flex items-center justify-between py-2">
              <dt className="text-slate-500 dark:text-slate-400">Device Category</dt>
              <dd className="font-medium text-slate-900 dark:text-slate-100">{device.category}</dd>
            </div>
            <div className="flex items-center justify-between py-2">
              <dt className="text-slate-500 dark:text-slate-400">Platform / OS</dt>
              <dd className="font-medium text-slate-900 dark:text-slate-100">{device.platform}</dd>
            </div>
            <div className="flex items-center justify-between py-2">
              <dt className="text-slate-500 dark:text-slate-400">CSS Viewport Width</dt>
              <dd className="font-mono font-semibold text-sky-600 dark:text-sky-300">
                {width}px {hasCustomOverride ? "(override)" : ""}
              </dd>
            </div>
            <div className="flex items-center justify-between py-2">
              <dt className="text-slate-500 dark:text-slate-400">CSS Viewport Height</dt>
              <dd className="font-mono font-semibold text-sky-600 dark:text-sky-300">
                {height}px {hasCustomOverride ? "(override)" : ""}
              </dd>
            </div>
            <div className="flex items-center justify-between py-2">
              <dt className="text-slate-500 dark:text-slate-400">Device Pixel Ratio</dt>
              <dd className="font-mono font-medium text-slate-900 dark:text-slate-100">
                @{device.dpr}x
              </dd>
            </div>
            <div className="flex items-center justify-between py-2">
              <dt className="text-slate-500 dark:text-slate-400">Physical Render Equiv.</dt>
              <dd className="font-mono text-[11px] text-slate-600 dark:text-slate-300">
                {physicalW} × {physicalH} px
              </dd>
            </div>
            <div className="flex items-center justify-between py-2">
              <dt className="text-slate-500 dark:text-slate-400">Orientation</dt>
              <dd className="capitalize font-medium text-slate-900 dark:text-slate-100">
                {orientation} ({aspect})
              </dd>
            </div>
            <div className="flex items-center justify-between py-2">
              <dt className="text-slate-500 dark:text-slate-400">Fold State</dt>
              <dd className="capitalize font-medium text-slate-900 dark:text-slate-100">
                {device.foldState === "none" ? "Standard (Non-Folding)" : device.foldState}
              </dd>
            </div>
            <div className="flex items-center justify-between py-2">
              <dt className="text-slate-500 dark:text-slate-400">CSS Breakpoint Band</dt>
              <dd>
                <span
                  className={`rounded border px-1.5 py-0.5 font-mono text-[10px] font-semibold ${bpMeta.colorClass}`}
                >
                  {bpMeta.token.toUpperCase()} ({bpMeta.range})
                </span>
              </dd>
            </div>
          </dl>
        </div>

        {/* Quick Copy CSS Media Query Helper */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              CSS @media Snippet
            </span>
            <button
              type="button"
              onClick={handleCopyMediaQuery}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
            >
              {copiedCss ? (
                <>
                  <Check className="w-3 h-3 text-emerald-500" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy CSS</span>
                </>
              )}
            </button>
          </div>
          <pre className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 p-2.5 text-[10.5px] font-mono text-slate-700 dark:text-slate-300">
            {mediaQuerySnippet}
          </pre>
        </div>

        {/* Preset Accuracy & Simulation Scope Notice */}
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/8 p-3 space-y-1.5">
          <div className="flex items-center gap-1.5 font-semibold text-amber-700 dark:text-amber-300 text-[11px]">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>Preset & Viewport Simulation Notes</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
            Device presets are <strong>estimated</strong> unless explicitly marked Verified. Browser
            chrome (address bars, dynamic toolbars) can alter visible height on real phones.
          </p>
          <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
            This tool simulates exact CSS viewport dimensions inside an iframe; it does not emulate
            iOS Safari WebKit internals, hardware DPR rendering, device User-Agent headers, native
            keyboards, or physical sensors.
          </p>
        </div>
      </div>
    </aside>
  );
};
