import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BUILTIN_DEVICES,
  DEVICE_CATALOG,
  getManufacturersList,
  getOrientedDimensions,
} from "../data/deviceCatalog";
import {
  CompareDeviceSlot,
  CustomViewportPreset,
  DeveloperOverlayState,
  DevicePreset,
  Orientation,
  PreviewStatus,
  WorkspaceSettings,
  ZoomPreset,
} from "../types/device";
import { useLocalStorage } from "../hooks/useLocalStorage";
import {
  exportViewportSpecCardPng,
  openUrlInNewTab,
  validateWebsiteUrl,
} from "../utils/urlAndPreview";
import { Header } from "./Header";
import { DeviceExplorer } from "./DeviceExplorer";
import { BreakpointToolbar } from "./BreakpointToolbar";
import { PreviewToolbar } from "./PreviewToolbar";
import { PreviewCanvas } from "./PreviewCanvas";
import { DeviceInformationPanel } from "./DeviceInformationPanel";
import { CompareMode } from "./CompareMode";
import { CustomDeviceBuilder } from "./CustomDeviceBuilder";
import { SettingsPanel } from "./SettingsPanel";
import { HelpDialog } from "./HelpDialog";

const DEFAULT_COMPARE_SLOTS: CompareDeviceSlot[] = [
  {
    slotId: "slot-iphone-17-pro",
    deviceId: "apple-iphone-17-pro",
    orientation: "portrait",
    zoomMode: "fit",
    customZoom: 75,
    reloadKey: 0,
  },
  {
    slotId: "slot-galaxy-s25",
    deviceId: "samsung-galaxy-s25",
    orientation: "portrait",
    zoomMode: "fit",
    customZoom: 75,
    reloadKey: 0,
  },
  {
    slotId: "slot-ipad-air",
    deviceId: "apple-ipad-air",
    orientation: "portrait",
    zoomMode: "fit",
    customZoom: 50,
    reloadKey: 0,
  },
];

const DEFAULT_OVERLAYS: DeveloperOverlayState = {
  showRuler: false,
  showDimensionsBadge: true,
  showSafeArea: false,
  showGrid: false,
  showBreakpointMarkers: false,
  showDeviceFrame: true,
  showCutout: true,
};

const DEFAULT_SETTINGS: WorkspaceSettings = {
  canvasBackdrop: "dark",
  defaultZoom: "fit",
  reducedMotion: false,
  autoCloseSidebarOnMobile: true,
  syncCompareRotation: false,
};

export const AppShell: React.FC = () => {
  // Persisted state
  const [theme, setTheme] = useLocalStorage<"dark" | "light">("rdtl_theme", "dark");
  const [customDevices, setCustomDevices] = useLocalStorage<DevicePreset[]>(
    "rdtl_custom_devices",
    []
  );
  const [favoriteIds, setFavoriteIds] = useLocalStorage<string[]>("rdtl_favorite_ids", [
    "apple-iphone-17-pro",
    "samsung-galaxy-s25",
    "google-pixel-9-pro",
    "apple-ipad-air",
  ]);
  const [recentIds, setRecentIds] = useLocalStorage<string[]>("rdtl_recent_ids", [
    "apple-iphone-17-pro",
    "samsung-galaxy-s25",
    "samsung-galaxy-z-fold6-unfolded",
  ]);
  const [customViewportPresets, setCustomViewportPresets] = useLocalStorage<
    CustomViewportPreset[]
  >("rdtl_custom_viewports", []);
  const [overlays, setOverlays] = useLocalStorage<DeveloperOverlayState>(
    "rdtl_overlays",
    DEFAULT_OVERLAYS
  );
  const [settings, setSettings] = useLocalStorage<WorkspaceSettings>(
    "rdtl_settings",
    DEFAULT_SETTINGS
  );
  const [compareSlots, setCompareSlots] = useLocalStorage<CompareDeviceSlot[]>(
    "rdtl_compare_slots",
    DEFAULT_COMPARE_SLOTS
  );

  // Combined catalog (Custom + 243 JSON presets)
  const allDevices = useMemo(
    () => [...customDevices, ...BUILTIN_DEVICES],
    [customDevices]
  );

  const knownManufacturers = useMemo(
    () => getManufacturersList(allDevices).map((m) => m.name),
    [allDevices]
  );

  // URL & preview state (starts in clean Empty State before loading)
  const [urlInput, setUrlInput] = useState("");
  const [activeUrl, setActiveUrl] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [suggestedUrl, setSuggestedUrl] = useState<string | null>(null);
  const [previewStatus, setPreviewStatus] = useState<PreviewStatus>("idle");
  const [reloadKey, setReloadKey] = useState(0);

  // Active single device state
  const [selectedDeviceId, setSelectedDeviceId] = useLocalStorage<string>(
    "rdtl_selected_device_id",
    "apple-iphone-17-pro"
  );
  const selectedDevice = useMemo(
    () => allDevices.find((d) => d.id === selectedDeviceId) ?? BUILTIN_DEVICES[1],
    [allDevices, selectedDeviceId]
  );

  const [orientation, setOrientation] = useState<Orientation>(
    selectedDevice.defaultOrientation
  );
  const [overrideDims, setOverrideDims] = useState<{ width: number; height: number } | null>(
    null
  );
  const [zoomMode, setZoomMode] = useState<ZoomPreset>("fit");
  const [customZoom, setCustomZoom] = useState<number>(85);
  const [canvasBounds, setCanvasBounds] = useState<{ w: number; h: number }>({
    w: 900,
    h: 720,
  });

  // Panels & dialogs
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true
  );
  const [isInfoPanelOpen, setIsInfoPanelOpen] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 1400 : false
  );
  const [isCustomBuilderOpen, setIsCustomBuilderOpen] = useState(false);
  const [editingCustomDevice, setEditingCustomDevice] = useState<DevicePreset | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const workspaceRef = useRef<HTMLDivElement>(null);

  // Sync theme class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  // Toast helper
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const t = window.setTimeout(() => setToastMessage(null), 2600);
    return () => window.clearTimeout(t);
  }, [toastMessage]);

  // Listen to native fullscreen changes
  useEffect(() => {
    const onFsChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen((prev) => (prev ? false : prev));
      }
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // Compute current active viewport width & height
  const { width: currentWidth, height: currentHeight } = useMemo(() => {
    const baseW = overrideDims ? overrideDims.width : selectedDevice.viewportWidth;
    const baseH = overrideDims ? overrideDims.height : selectedDevice.viewportHeight;
    return getOrientedDimensions(baseW, baseH, orientation);
  }, [overrideDims, selectedDevice.viewportWidth, selectedDevice.viewportHeight, orientation]);

  // Compute effective visual zoom scale
  const effectiveScale = useMemo(() => {
    if (zoomMode === "fit") {
      const bezelExtra = overlays.showDeviceFrame ? 36 : 8;
      const rulerExtra = overlays.showRuler ? 22 : 0;
      const neededW = currentWidth + bezelExtra + rulerExtra;
      const neededH = currentHeight + bezelExtra + rulerExtra;
      const fit = Math.min(1, canvasBounds.w / neededW, canvasBounds.h / neededH);
      return Math.max(0.2, Number(fit.toFixed(3)));
    }
    if (zoomMode === "custom") {
      return customZoom / 100;
    }
    return Number(zoomMode) / 100;
  }, [
    zoomMode,
    customZoom,
    currentWidth,
    currentHeight,
    canvasBounds.w,
    canvasBounds.h,
    overlays.showDeviceFrame,
    overlays.showRuler,
  ]);

  // Load Website Handler
  const handleLoadUrl = useCallback((overrideTarget?: string) => {
    const raw = overrideTarget !== undefined ? overrideTarget : urlInput;
    const result = validateWebsiteUrl(raw);
    if (!result.isValid || !result.normalizedUrl) {
      setValidationError(result.errorMessage ?? "Invalid URL");
      setSuggestedUrl(result.suggestedUrl ?? null);
      setPreviewStatus("invalid");
      return;
    }

    setValidationError(null);
    setSuggestedUrl(null);
    setUrlInput(result.normalizedUrl);
    setActiveUrl(result.normalizedUrl);
    setReloadKey((k) => k + 1);
  }, [urlInput]);

  const handleInputChange = useCallback(
    (val: string) => {
      setUrlInput(val);
      if (validationError) {
        setValidationError(null);
        setSuggestedUrl(null);
        setPreviewStatus(activeUrl ? "ready" : "idle");
      }
    },
    [validationError, activeUrl]
  );

  const handleReload = useCallback(() => {
    if (!activeUrl) return;
    setReloadKey((k) => k + 1);
  }, [activeUrl]);

  const handleOpenNewTab = useCallback(() => {
    const candidate = activeUrl || urlInput.trim();
    if (!candidate) return;
    const check = validateWebsiteUrl(candidate);
    if (check.isValid && check.normalizedUrl) {
      openUrlInNewTab(check.normalizedUrl);
    } else if (activeUrl) {
      openUrlInNewTab(activeUrl);
    }
  }, [activeUrl, urlInput]);

  // Select Device
  const handleSelectDevice = useCallback(
    (device: DevicePreset) => {
      setSelectedDeviceId(device.id);
      setOrientation(device.defaultOrientation);
      setOverrideDims(null);

      // Record in recently used (max 8)
      setRecentIds((prev) => [device.id, ...prev.filter((id) => id !== device.id)].slice(0, 8));

      if (isCompareMode) {
        setCompareSlots((prev) => [
          ...prev,
          {
            slotId: `slot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            deviceId: device.id,
            orientation: device.defaultOrientation,
            zoomMode: "fit",
            customZoom: 75,
            reloadKey: 0,
          },
        ]);
        showToast(`Added ${device.name} to Compare Mode`);
      }

      if (
        settings.autoCloseSidebarOnMobile &&
        typeof window !== "undefined" &&
        window.innerWidth < 1024
      ) {
        setIsSidebarOpen(false);
      }
    },
    [
      isCompareMode,
      setCompareSlots,
      setRecentIds,
      setSelectedDeviceId,
      settings.autoCloseSidebarOnMobile,
      showToast,
    ]
  );

  const handleSelectDeviceById = useCallback(
    (deviceId: string) => {
      const found = allDevices.find((d) => d.id === deviceId);
      if (found) handleSelectDevice(found);
    },
    [allDevices, handleSelectDevice]
  );

  const handleToggleFavorite = useCallback(
    (deviceId: string) => {
      setFavoriteIds((prev) =>
        prev.includes(deviceId) ? prev.filter((id) => id !== deviceId) : [deviceId, ...prev]
      );
    },
    [setFavoriteIds]
  );

  const handleAddToCompare = useCallback(
    (device: DevicePreset) => {
      setCompareSlots((prev) => [
        ...prev,
        {
          slotId: `slot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          deviceId: device.id,
          orientation: device.defaultOrientation,
          zoomMode: "fit",
          customZoom: 75,
          reloadKey: 0,
        },
      ]);
      setIsCompareMode(true);
      showToast(`Comparing ${device.name}`);
    },
    [setCompareSlots, showToast]
  );

  // Breakpoint quick testing
  const handleApplyBreakpointWidth = useCallback(
    (targetWidth: number, suggestedHeight: number) => {
      const nextOrientation: Orientation =
        targetWidth > suggestedHeight ? "landscape" : "portrait";
      setOverrideDims({ width: targetWidth, height: suggestedHeight });
      setOrientation(nextOrientation);
    },
    []
  );

  const handleResetPreview = useCallback(() => {
    setOverrideDims(null);
    setOrientation("portrait");
    setZoomMode(settings.defaultZoom);
    showToast(`Reset to ${selectedDevice.name} portrait preset`);
  }, [selectedDevice.name, settings.defaultZoom, showToast]);

  // Custom Device CRUD
  const handleSaveCustomDevice = useCallback(
    (device: DevicePreset, selectImmediately: boolean) => {
      setCustomDevices((prev) => {
        const exists = prev.some((d) => d.id === device.id);
        return exists ? prev.map((d) => (d.id === device.id ? device : d)) : [device, ...prev];
      });
      if (selectImmediately) {
        setSelectedDeviceId(device.id);
        setOrientation(device.defaultOrientation);
        setOverrideDims(null);
      }
      showToast(`Saved custom device "${device.name}"`);
    },
    [setCustomDevices, setSelectedDeviceId, showToast]
  );

  const handleDeleteCustomDevice = useCallback(
    (deviceId: string) => {
      setCustomDevices((prev) => prev.filter((d) => d.id !== deviceId));
      setFavoriteIds((prev) => prev.filter((id) => id !== deviceId));
      setRecentIds((prev) => prev.filter((id) => id !== deviceId));
      if (selectedDeviceId === deviceId) {
        setSelectedDeviceId(BUILTIN_DEVICES[0].id);
      }
      showToast("Deleted custom device profile");
    },
    [
      selectedDeviceId,
      setCustomDevices,
      setFavoriteIds,
      setRecentIds,
      setSelectedDeviceId,
      showToast,
    ]
  );

  // Fullscreen Workspace Toggle (Native API + CSS Full-Window Fallback)
  const handleToggleFullscreen = useCallback(async () => {
    if (isFullscreen) {
      if (document.fullscreenElement) {
        try {
          await document.exitFullscreen();
        } catch {
          // ignore
        }
      }
      setIsFullscreen(false);
      return;
    }

    if (workspaceRef.current?.requestFullscreen) {
      try {
        await workspaceRef.current.requestFullscreen();
        setIsFullscreen(true);
        return;
      } catch {
        // Fallback to full-viewport CSS mode if sandboxed iframe restricts native fullscreen
      }
    }
    setIsFullscreen(true);
  }, [isFullscreen]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName;
      const isTyping = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";

      if (e.key === "Escape" && isFullscreen && !document.fullscreenElement) {
        setIsFullscreen(false);
        return;
      }

      if (isTyping) return;

      if (e.key === "?") {
        e.preventDefault();
        setIsHelpOpen((prev) => !prev);
      } else if (e.altKey && (e.key === "r" || e.key === "R")) {
        e.preventDefault();
        setOrientation((prev) => (prev === "portrait" ? "landscape" : "portrait"));
      } else if (e.altKey && (e.key === "c" || e.key === "C")) {
        e.preventDefault();
        setIsCompareMode((prev) => !prev);
      } else if (e.altKey && (e.key === "f" || e.key === "F")) {
        e.preventDefault();
        handleToggleFullscreen();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleToggleFullscreen, isFullscreen]);

  const handleCanvasResize = useCallback((w: number, h: number) => {
    setCanvasBounds({ w, h });
  }, []);

  const handleToggleOverlay = useCallback(
    (key: keyof DeveloperOverlayState) => {
      setOverlays((prev) => ({ ...prev, [key]: !prev[key] }));
    },
    [setOverlays]
  );

  return (
    <div
      className={`flex h-screen w-screen flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 ${
        settings.reducedMotion ? "reduce-motion" : ""
      }`}
    >
      {/* Top Application Header */}
      {!isFullscreen && (
        <Header
          inputValue={urlInput}
          activeUrl={activeUrl}
          previewStatus={previewStatus}
          validationError={validationError}
          suggestedUrl={suggestedUrl}
          isCompareMode={isCompareMode}
          compareCount={compareSlots.length}
          theme={theme}
          isSidebarOpen={isSidebarOpen}
          isInfoPanelOpen={isInfoPanelOpen}
          totalCatalogCount={DEVICE_CATALOG.totalDevices}
          onInputChange={handleInputChange}
          onLoadUrl={handleLoadUrl}
          onReload={handleReload}
          onOpenNewTab={handleOpenNewTab}
          onToggleCompareMode={() => setIsCompareMode((prev) => !prev)}
          onToggleTheme={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          onToggleInfoPanel={() => setIsInfoPanelOpen((prev) => !prev)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenHelp={() => setIsHelpOpen(true)}
        />
      )}

      {/* Main Body Area: Left Explorer + Center Workspace + Right Device Info */}
      <div className="relative flex flex-1 overflow-hidden">
        {!isFullscreen && (
          <DeviceExplorer
            isOpen={isSidebarOpen}
            allDevices={allDevices}
            customDevices={customDevices}
            selectedDeviceId={selectedDevice.id}
            favoriteIds={favoriteIds}
            recentIds={recentIds}
            compareDeviceIds={compareSlots.map((s) => s.deviceId)}
            onCloseMobile={() => setIsSidebarOpen(false)}
            onSelectDevice={handleSelectDevice}
            onToggleFavorite={handleToggleFavorite}
            onAddToCompare={handleAddToCompare}
            onOpenNewCustom={() => {
              setEditingCustomDevice(null);
              setIsCustomBuilderOpen(true);
            }}
            onEditCustom={(dev) => {
              setEditingCustomDevice(dev);
              setIsCustomBuilderOpen(true);
            }}
            onDeleteCustom={handleDeleteCustomDevice}
          />
        )}

        {/* Center Preview Workspace */}
        <main
          ref={workspaceRef}
          className={`flex flex-1 flex-col overflow-hidden bg-slate-100 dark:bg-slate-950 ${
            isFullscreen ? "fixed inset-0 z-50" : "min-w-0"
          }`}
        >
          {isFullscreen && isCompareMode && (
            <button
              type="button"
              onClick={handleToggleFullscreen}
              className="fixed bottom-4 left-4 z-50 rounded-lg border border-sky-500/40 bg-slate-900/95 px-3 py-1.5 text-xs font-semibold text-sky-300 shadow-xl cursor-pointer"
            >
              Exit Fullscreen (Esc)
            </button>
          )}
          {isCompareMode ? (
            <CompareMode
              slots={compareSlots}
              allDevices={allDevices}
              url={activeUrl}
              globalReloadKey={reloadKey}
              overlays={overlays}
              canvasBackdrop={settings.canvasBackdrop}
              syncRotation={settings.syncCompareRotation}
              onToggleSyncRotation={() =>
                setSettings((prev) => ({
                  ...prev,
                  syncCompareRotation: !prev.syncCompareRotation,
                }))
              }
              onAddSlot={(deviceId) => {
                const fallback =
                  allDevices.find(
                    (d) => !compareSlots.some((s) => s.deviceId === d.id)
                  ) ?? BUILTIN_DEVICES[0];
                const chosen = deviceId
                  ? allDevices.find((d) => d.id === deviceId) ?? fallback
                  : fallback;
                setCompareSlots((prev) => [
                  ...prev,
                  {
                    slotId: `slot-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
                    deviceId: chosen.id,
                    orientation: chosen.defaultOrientation,
                    zoomMode: "fit",
                    customZoom: 75,
                    reloadKey: 0,
                  },
                ]);
              }}
              onRemoveSlot={(slotId) =>
                setCompareSlots((prev) =>
                  prev.length > 1 ? prev.filter((s) => s.slotId !== slotId) : prev
                )
              }
              onUpdateSlot={(slotId, patch) =>
                setCompareSlots((prev) =>
                  prev.map((s) => (s.slotId === slotId ? { ...s, ...patch } : s))
                )
              }
              onRotateAll={(nextOri) =>
                setCompareSlots((prev) =>
                  prev.map((s) => ({ ...s, orientation: nextOri }))
                )
              }
              onReloadAll={handleReload}
              onSetAllZoom={(z) =>
                setCompareSlots((prev) => prev.map((s) => ({ ...s, zoomMode: z })))
              }
              onStatusChange={setPreviewStatus}
              onLoadSampleUrl={(sampleUrl) => {
                setUrlInput(sampleUrl);
                handleLoadUrl(sampleUrl);
              }}
              onOpenNewTab={handleOpenNewTab}
            />
          ) : (
            <>
              {/* Quick Responsive Breakpoint Testing Bar */}
              <BreakpointToolbar
                currentWidth={currentWidth}
                currentHeight={currentHeight}
                hasCustomOverride={Boolean(overrideDims)}
                customViewportPresets={customViewportPresets}
                onApplyWidth={handleApplyBreakpointWidth}
                onSaveCustomViewportPreset={(label) => {
                  const group =
                    currentWidth < 600
                      ? "phone"
                      : currentWidth < 1024
                      ? "tablet"
                      : "desktop";
                  setCustomViewportPresets((prev) => [
                    ...prev,
                    {
                      id: `vp-${Date.now()}`,
                      label,
                      width: currentWidth,
                      height: currentHeight,
                      group,
                    },
                  ]);
                  showToast(`Saved quick preset "${label}"`);
                }}
                onDeleteCustomViewportPreset={(id) =>
                  setCustomViewportPresets((prev) => prev.filter((p) => p.id !== id))
                }
                onResetOverride={() => setOverrideDims(null)}
              />

              {/* Functional Preview Toolbar */}
              <PreviewToolbar
                selectedDevice={selectedDevice}
                allDevices={allDevices}
                width={currentWidth}
                height={currentHeight}
                orientation={orientation}
                zoomMode={zoomMode}
                customZoom={customZoom}
                effectiveScale={effectiveScale}
                isFavorite={favoriteIds.includes(selectedDevice.id)}
                isFullscreen={isFullscreen}
                activeUrl={activeUrl}
                overlays={overlays}
                onSelectDeviceById={handleSelectDeviceById}
                onToggleFavorite={handleToggleFavorite}
                onSetOrientation={setOrientation}
                onSetZoomMode={setZoomMode}
                onSetCustomZoom={setCustomZoom}
                onToggleOverlay={handleToggleOverlay}
                onReload={handleReload}
                onReset={handleResetPreview}
                onOpenNewTab={handleOpenNewTab}
                onToggleFullscreen={handleToggleFullscreen}
                onCaptureScreenshot={() => {
                  exportViewportSpecCardPng({
                    device: selectedDevice,
                    width: currentWidth,
                    height: currentHeight,
                    orientation,
                    url: activeUrl,
                  });
                  showToast("Exported Viewport Spec Snapshot PNG");
                }}
              />

              {/* Studio Inspection Canvas */}
              <PreviewCanvas
                device={selectedDevice}
                width={currentWidth}
                height={currentHeight}
                orientation={orientation}
                effectiveScale={effectiveScale}
                url={activeUrl}
                reloadKey={reloadKey}
                overlays={overlays}
                canvasBackdrop={settings.canvasBackdrop}
                onCanvasResize={handleCanvasResize}
                onStatusChange={setPreviewStatus}
                onLoadSampleUrl={(sampleUrl) => {
                  setUrlInput(sampleUrl);
                  handleLoadUrl(sampleUrl);
                }}
                onOpenNewTab={handleOpenNewTab}
                onReload={handleReload}
              />
            </>
          )}
        </main>

        {/* Right-Hand Device Information Inspector */}
        {!isCompareMode && !isFullscreen && (
          <DeviceInformationPanel
            isOpen={isInfoPanelOpen}
            device={selectedDevice}
            width={currentWidth}
            height={currentHeight}
            orientation={orientation}
            hasCustomOverride={Boolean(overrideDims)}
            onClose={() => setIsInfoPanelOpen(false)}
            onEditCustom={(dev) => {
              setEditingCustomDevice(dev);
              setIsCustomBuilderOpen(true);
            }}
            onDeleteCustom={handleDeleteCustomDevice}
          />
        )}
      </div>

      {/* Modals & Drawers */}
      <CustomDeviceBuilder
        isOpen={isCustomBuilderOpen}
        editingDevice={editingCustomDevice}
        knownManufacturers={knownManufacturers}
        onClose={() => setIsCustomBuilderOpen(false)}
        onSaveDevice={handleSaveCustomDevice}
        onDeleteDevice={handleDeleteCustomDevice}
      />

      <SettingsPanel
        isOpen={isSettingsOpen}
        settings={settings}
        overlays={overlays}
        customCount={customDevices.length}
        favoritesCount={favoriteIds.length}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateSettings={(patch) => setSettings((prev) => ({ ...prev, ...patch }))}
        onToggleOverlay={handleToggleOverlay}
        onClearFavoritesAndHistory={() => {
          setFavoriteIds([]);
          setRecentIds([]);
          showToast("Cleared favorites and recent device history");
        }}
      />

      <HelpDialog isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* Subtle Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 right-4 z-50 rounded-xl border border-sky-500/40 bg-slate-900/95 px-3.5 py-2 text-xs font-medium text-slate-100 shadow-2xl backdrop-blur"
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
};
