import React, { useEffect, useState } from "react";
import {
  ExternalLink,
  RotateCw,
  ShieldX,
  Globe,
  Sparkles,
  WifiOff,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import {
  DeveloperOverlayState,
  DevicePreset,
  Orientation,
  PreviewStatus,
} from "../types/device";
import { getActiveCssBreakpointLabel } from "../data/deviceCatalog";
import {
  buildResponsiveDiagnosticHtml,
  checkKnownEmbedRestriction,
  isSandboxDemoUrl,
  SAMPLE_TEST_URLS,
} from "../utils/urlAndPreview";

interface DeviceFrameProps {
  device: DevicePreset;
  width: number;
  height: number;
  orientation: Orientation;
  scale: number;
  url: string;
  reloadKey: number;
  overlays: DeveloperOverlayState;
  compactHeader?: boolean;
  onStatusChange?: (status: PreviewStatus) => void;
  onLoadSampleUrl?: (sampleUrl: string) => void;
  onOpenNewTab: () => void;
  onReload: () => void;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({
  device,
  width,
  height,
  orientation,
  scale,
  url,
  reloadKey,
  overlays,
  compactHeader = false,
  onStatusChange,
  onLoadSampleUrl,
  onOpenNewTab,
  onReload,
}) => {
  const [localStatus, setLocalStatus] = useState<PreviewStatus>(url ? "loading" : "idle");
  const [manualBlockedFlag, setManualBlockedFlag] = useState(false);

  const isDemoSandbox = Boolean(url && isSandboxDemoUrl(url));
  const knownRestriction = url ? checkKnownEmbedRestriction(url) : { isKnownBlocked: false };

  useEffect(() => {
    setManualBlockedFlag(false);

    if (!url) {
      setLocalStatus("idle");
      onStatusChange?.("idle");
      return;
    }

    if (knownRestriction.isKnownBlocked) {
      setLocalStatus("blocked");
      onStatusChange?.("blocked");
      return;
    }

    if (isDemoSandbox) {
      setLocalStatus("ready");
      onStatusChange?.("ready");
      return;
    }

    let cancelled = false;
    setLocalStatus("loading");
    onStatusChange?.("loading");

    // Non-invasive network reachability probe (respects SOP without bypassing security)
    const controller = new AbortController();
    fetch(url, { mode: "no-cors", signal: controller.signal }).catch((err) => {
      if (!cancelled && err.name !== "AbortError") {
        setLocalStatus("error");
        onStatusChange?.("error");
      }
    });

    // Fallback safety timer in case an external iframe hangs indefinitely
    const timer = window.setTimeout(() => {
      if (!cancelled) {
        setLocalStatus((prev) => {
          if (prev === "loading") {
            onStatusChange?.("ready");
            return "ready";
          }
          return prev;
        });
      }
    }, 8500);

    return () => {
      cancelled = true;
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [url, reloadKey, isDemoSandbox, knownRestriction.isKnownBlocked, onStatusChange]);

  const handleIframeLoad = () => {
    if (localStatus !== "blocked" && localStatus !== "error") {
      setLocalStatus("ready");
      onStatusChange?.("ready");
    }
  };

  const showBezel = overlays.showDeviceFrame;
  const isTabletOrGeneric =
    device.category === "iPad" ||
    device.category === "Android Tablets" ||
    device.category === "Generic Devices";

  const bezelThickness = showBezel ? (isTabletOrGeneric ? 16 : 12) : 2;
  const frameRadius = showBezel
    ? device.category === "Generic Devices"
      ? 14
      : isTabletOrGeneric
      ? 26
      : 38
    : 8;
  const screenRadius = showBezel ? Math.max(4, frameRadius - bezelThickness + 2) : 6;

  const rulerOffset = overlays.showRuler ? 22 : 0;
  const totalUnscaledWidth = width + bezelThickness * 2 + rulerOffset;
  const totalUnscaledHeight = height + bezelThickness * 2 + rulerOffset;

  const scaledOuterWidth = Math.max(120, Math.round(totalUnscaledWidth * scale));
  const scaledOuterHeight = Math.max(120, Math.round(totalUnscaledHeight * scale));

  const bpMeta = getActiveCssBreakpointLabel(width);

  // Generate ruler tick marks every 50px
  const horizontalTicks: number[] = [];
  for (let x = 0; x <= width; x += 50) horizontalTicks.push(x);
  const verticalTicks: number[] = [];
  for (let y = 0; y <= height; y += 50) verticalTicks.push(y);

  // Safe area approximation values
  const safeTop =
    orientation === "portrait"
      ? device.cutout === "dynamic-island"
        ? 59
        : device.cutout === "notch"
        ? 47
        : device.cutout === "punch-hole"
        ? 36
        : 24
      : 20;
  const safeBottom = device.category === "Generic Devices" ? 0 : orientation === "portrait" ? 34 : 21;

  const effectiveBlocked = localStatus === "blocked" || manualBlockedFlag;

  return (
    <div className="flex flex-col items-center select-none">
      {/* Device Metadata Floating Readout Bar */}
      {overlays.showDimensionsBadge && (
        <div
          className={`mb-2.5 flex flex-wrap items-center justify-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/90 px-3.5 py-1 text-[11px] text-slate-200 shadow-lg backdrop-blur ${
            compactHeader ? "max-w-full" : ""
          }`}
        >
          <span className="font-semibold text-white">{device.name}</span>
          <span className="text-slate-600">•</span>
          <span className="font-mono text-sky-300 font-medium">
            {width} × {height} CSS px
          </span>
          <span className="text-slate-600">•</span>
          <span className="capitalize text-slate-300">{orientation}</span>
          <span className="text-slate-600">•</span>
          <span className="font-mono text-slate-400">Zoom {Math.round(scale * 100)}%</span>
          {device.accuracy === "estimated" && !device.isCustom && (
            <span
              title="Estimated preset — verify critical releases on physical hardware"
              className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.2 text-[10px] font-medium text-amber-300"
            >
              Estimated
            </span>
          )}
          {localStatus === "loading" && (
            <span className="inline-flex items-center gap-1 text-sky-400 font-medium">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Loading</span>
            </span>
          )}
        </div>
      )}

      {/* Optional CSS Media Query Breakpoint Marker Strip */}
      {overlays.showBreakpointMarkers && (
        <div className="mb-2 flex flex-wrap items-center justify-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-1 text-[10px] font-mono text-slate-400">
          <span>Active Media Band:</span>
          <span className={`rounded border px-1.5 py-0.2 font-semibold ${bpMeta.colorClass}`}>
            {bpMeta.token.toUpperCase()} ({bpMeta.range})
          </span>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="hidden sm:inline">
            Thresholds: {[320, 480, 640, 768, 1024, 1280].map((bp) => (
              <span
                key={bp}
                className={`mx-0.5 ${width >= bp ? "text-sky-400 font-semibold" : "text-slate-600"}`}
              >
                {bp}
              </span>
            ))}
          </span>
        </div>
      )}

      {/* Layout Sizing Wrapper matching Visual Zoom Scale */}
      <div
        style={{
          width: `${scaledOuterWidth}px`,
          height: `${scaledOuterHeight}px`,
        }}
        className="relative transition-[width,height] duration-150 ease-out"
      >
        <div
          style={{
            width: `${totalUnscaledWidth}px`,
            height: `${totalUnscaledHeight}px`,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
          className="relative"
        >
          {/* Top Horizontal Pixel Ruler */}
          {overlays.showRuler && (
            <div
              style={{
                left: `${rulerOffset + bezelThickness}px`,
                width: `${width}px`,
                height: "20px",
              }}
              className="absolute top-0 overflow-hidden rounded-t bg-slate-900/95 border border-slate-700/80 text-[9px] font-mono text-slate-400"
              aria-hidden="true"
            >
              {horizontalTicks.map((x) => (
                <div
                  key={x}
                  style={{ left: `${x}px` }}
                  className="absolute top-0 bottom-0 border-l border-slate-600/80 pl-0.5 leading-none pt-0.5"
                >
                  {x % 100 === 0 ? x : ""}
                </div>
              ))}
            </div>
          )}

          {/* Left Vertical Pixel Ruler */}
          {overlays.showRuler && (
            <div
              style={{
                top: `${rulerOffset + bezelThickness}px`,
                height: `${height}px`,
                width: "20px",
              }}
              className="absolute left-0 overflow-hidden rounded-l bg-slate-900/95 border border-slate-700/80 text-[9px] font-mono text-slate-400"
              aria-hidden="true"
            >
              {verticalTicks.map((y) => (
                <div
                  key={y}
                  style={{ top: `${y}px` }}
                  className="absolute left-0 right-0 border-t border-slate-600/80 pt-0.5 text-center leading-none"
                >
                  {y % 100 === 0 && y > 0 ? y : ""}
                </div>
              ))}
            </div>
          )}

          {/* Simulated Device Hardware Chassis */}
          <div
            style={{
              marginLeft: `${rulerOffset}px`,
              marginTop: `${rulerOffset}px`,
              width: `${width + bezelThickness * 2}px`,
              height: `${height + bezelThickness * 2}px`,
              padding: `${bezelThickness}px`,
              borderRadius: `${frameRadius}px`,
            }}
            className={`relative transition-shadow ${
              showBezel
                ? "bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.85),0_0_0_1px_rgba(148,163,184,0.28),inset_0_1px_1px_rgba(255,255,255,0.14)]"
                : "bg-slate-800 shadow-2xl ring-1 ring-slate-700"
            }`}
          >
            {/* Subtle side hardware buttons when bezel is active */}
            {showBezel && device.category !== "Generic Devices" && (
              <>
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -left-[3px] top-24 h-10 w-[3px] rounded-l bg-slate-600/80"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -left-[3px] top-38 h-14 w-[3px] rounded-l bg-slate-600/80"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-[3px] top-32 h-16 w-[3px] rounded-r bg-slate-600/80"
                />
              </>
            )}

            {/* Inner Viewport Screen Area (EXACT CSS px width × height) */}
            <div
              style={{
                width: `${width}px`,
                height: `${height}px`,
                borderRadius: `${screenRadius}px`,
              }}
              className="relative overflow-hidden bg-slate-950 ring-1 ring-black/60"
            >
              {/* Top Loading Progress Bar */}
              {localStatus === "loading" && (
                <div className="pointer-events-none absolute inset-x-0 top-0 z-30 h-1 overflow-hidden bg-sky-500/20">
                  <div className="h-full w-1/2 animate-pulse bg-sky-400" />
                </div>
              )}

              {/* STATE 1: Empty State Before Loading */}
              {!url && (
                <div className="flex h-full w-full flex-col items-center justify-center overflow-y-auto bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 p-6 text-center text-slate-200">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-500/30 bg-sky-500/10 text-sky-400">
                    <Globe className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white">Ready to Preview Website</h3>
                  <p className="mt-1.5 max-w-xs text-xs text-slate-400 leading-relaxed">
                    Enter any valid <code className="text-sky-300">https://</code> or{" "}
                    <code className="text-sky-300">http://</code> URL above to load it inside this{" "}
                    <span className="font-mono text-slate-200 font-semibold">
                      {width} × {height} CSS px
                    </span>{" "}
                    viewport.
                  </p>

                  {onLoadSampleUrl && (
                    <div className="mt-5 w-full max-w-xs space-y-2">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        Or Try an Instant Target
                      </div>
                      {SAMPLE_TEST_URLS.slice(0, 3).map((sample) => (
                        <button
                          key={sample.url}
                          type="button"
                          onClick={() => onLoadSampleUrl(sample.url)}
                          className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-900/90 hover:border-sky-500/50 hover:bg-slate-800/90 px-3 py-2 text-left transition-colors cursor-pointer"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-100">
                              <Sparkles className="w-3 h-3 text-sky-400 shrink-0" />
                              <span className="truncate">{sample.label}</span>
                            </div>
                            <div className="font-mono text-[10px] text-slate-400 truncate">
                              {sample.url}
                            </div>
                          </div>
                          <span className="shrink-0 rounded bg-sky-500/15 px-1.5 py-0.5 text-[9px] font-medium text-sky-300">
                            Load
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* STATE 2: Blocked by X-Frame-Options or CSP */}
              {url && effectiveBlocked && (
                <div className="flex h-full w-full flex-col items-center justify-center overflow-y-auto bg-slate-950 p-6 text-center text-slate-200">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-500/40 bg-amber-500/15 text-amber-400">
                    <ShieldX className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white">
                    Embedded Preview Blocked by Website
                  </h3>
                  <p className="mt-2 max-w-sm text-xs text-slate-300 leading-relaxed">
                    <span className="font-mono text-amber-300 break-all">{url}</span> prevents
                    third-party iframe embedding via{" "}
                    <code className="rounded bg-slate-800 px-1 py-0.5 text-[11px]">
                      X-Frame-Options
                    </code>{" "}
                    or{" "}
                    <code className="rounded bg-slate-800 px-1 py-0.5 text-[11px]">
                      Content-Security-Policy: frame-ancestors
                    </code>
                    .
                  </p>
                  <p className="mt-2 max-w-sm text-[11px] text-slate-400">
                    This lab respects browser security policies and never proxies or strips security
                    headers. You can open the website directly in a new browser tab.
                  </p>

                  <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={onOpenNewTab}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 px-3.5 py-2 text-xs font-semibold text-slate-950 transition-colors cursor-pointer"
                    >
                      <span>Open in New Tab</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>

                    {manualBlockedFlag && (
                      <button
                        type="button"
                        onClick={() => setManualBlockedFlag(false)}
                        className="rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 cursor-pointer"
                      >
                        Return to Iframe
                      </button>
                    )}

                    {onLoadSampleUrl && (
                      <button
                        type="button"
                        onClick={() => onLoadSampleUrl(SAMPLE_TEST_URLS[0].url)}
                        className="rounded-lg border border-sky-500/40 bg-sky-500/10 hover:bg-sky-500/20 px-3 py-2 text-xs font-medium text-sky-300 cursor-pointer"
                      >
                        Load Built-in Diagnostic Page
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* STATE 3: Network / DNS Unreachable Error */}
              {url && !effectiveBlocked && localStatus === "error" && (
                <div className="flex h-full w-full flex-col items-center justify-center overflow-y-auto bg-slate-950 p-6 text-center text-slate-200">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-500/40 bg-rose-500/15 text-rose-400">
                    <WifiOff className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white">Unable to Reach Website</h3>
                  <p className="mt-2 max-w-sm text-xs text-slate-400 leading-relaxed">
                    The browser could not establish a connection to{" "}
                    <span className="font-mono text-rose-300 break-all">{url}</span>. Verify the
                    domain is online and accessible over HTTPS/HTTP.
                  </p>
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={onReload}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 px-3.5 py-2 text-xs font-semibold text-slate-950 cursor-pointer"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Retry</span>
                    </button>
                    <button
                      type="button"
                      onClick={onOpenNewTab}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-200 cursor-pointer"
                    >
                      <span>Open in New Tab</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STATE 4: Live Website Iframe (Exact CSS Viewport Dimensions) */}
              {url && !effectiveBlocked && localStatus !== "error" && (
                <iframe
                  key={`${url}-${reloadKey}`}
                  title={`${device.name} viewport preview (${width}x${height})`}
                  src={isDemoSandbox ? undefined : url}
                  srcDoc={isDemoSandbox ? buildResponsiveDiagnosticHtml() : undefined}
                  onLoad={handleIframeLoad}
                  style={{
                    width: `${width}px`,
                    height: `${height}px`,
                  }}
                  className="block border-0 bg-white"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              )}

              {/* Foldable Inner Crease Subtle Hardware Hint */}
              {showBezel && device.foldState === "unfolded" && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2px] bg-gradient-to-r from-transparent via-white/15 to-transparent"
                />
              )}

              {/* Optional Camera Cutout / Dynamic Island / Notch */}
              {showBezel &&
                overlays.showCutout &&
                device.cutout &&
                device.cutout !== "none" && (
                  <div
                    aria-hidden="true"
                    className={`pointer-events-none absolute z-20 bg-slate-950 ring-1 ring-white/10 ${
                      orientation === "portrait"
                        ? device.cutout === "dynamic-island"
                          ? "top-2.5 left-1/2 -translate-x-1/2 h-6 w-24 rounded-full"
                          : device.cutout === "notch"
                          ? "top-0 left-1/2 -translate-x-1/2 h-5 w-32 rounded-b-2xl"
                          : "top-2.5 left-1/2 -translate-x-1/2 h-3 w-3 rounded-full"
                        : device.cutout === "dynamic-island"
                        ? "left-2.5 top-1/2 -translate-y-1/2 w-6 h-24 rounded-full"
                        : device.cutout === "notch"
                        ? "left-0 top-1/2 -translate-y-1/2 w-5 h-32 rounded-r-2xl"
                        : "left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
                    }`}
                  />
                )}

              {/* Optional 12-Column Responsive Layout Grid Overlay */}
              {overlays.showGrid && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-20 grid grid-cols-12 gap-2 px-3"
                  style={{
                    backgroundImage:
                      "linear-gradient(to bottom, rgba(56,189,248,0.10) 1px, transparent 1px)",
                    backgroundSize: "100% 64px",
                  }}
                >
                  {Array.from({ length: 12 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="h-full bg-indigo-500/10 border-x border-indigo-400/20"
                    />
                  ))}
                </div>
              )}

              {/* Optional Safe-Area Guide Overlay (Clearly Labeled as Approximation) */}
              {overlays.showSafeArea && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between"
                >
                  <div
                    style={{ height: `${safeTop}px` }}
                    className="w-full bg-amber-500/18 border-b border-dashed border-amber-400/80 flex items-end justify-between px-2.5 pb-0.5 text-[9px] font-mono font-semibold text-amber-200"
                  >
                    <span>SAFE AREA TOP (APPROX.)</span>
                    <span>~{safeTop}px</span>
                  </div>
                  {safeBottom > 0 && (
                    <div
                      style={{ height: `${safeBottom}px` }}
                      className="w-full bg-amber-500/18 border-t border-dashed border-amber-400/80 flex items-start justify-between px-2.5 pt-0.5 text-[9px] font-mono font-semibold text-amber-200"
                    >
                      <span>HOME INDICATOR SAFE INSET (APPROX.)</span>
                      <span>~{safeBottom}px</span>
                    </div>
                  )}
                </div>
              )}

              {/* Modern Touch Home Indicator Pill */}
              {showBezel && device.category !== "Generic Devices" && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-1.5 left-1/2 -translate-x-1/2 z-20 h-1 w-28 rounded-full bg-slate-400/45 mix-blend-difference"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Subtle CSP / Blank Embed Helper when viewing external cross-origin websites */}
      {url && !isDemoSandbox && !effectiveBlocked && localStatus !== "error" && (
        <div className="mt-2.5 flex items-center gap-2 text-[11px] text-slate-400">
          <button
            type="button"
            onClick={() => setManualBlockedFlag(true)}
            className="inline-flex items-center gap-1 rounded-md border border-slate-800 bg-slate-900/80 hover:border-amber-500/40 hover:text-amber-300 px-2.5 py-1 transition-colors cursor-pointer"
          >
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span>Preview refused or blank? View CSP / X-Frame options</span>
          </button>
          <button
            type="button"
            onClick={onOpenNewTab}
            className="inline-flex items-center gap-1 rounded-md border border-slate-800 bg-slate-900/80 hover:border-sky-500/40 hover:text-sky-300 px-2.5 py-1 transition-colors cursor-pointer"
          >
            <span>Open in New Tab</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};
