import React from "react";
import {
  Columns2,
  Sun,
  Moon,
  HelpCircle,
  SlidersHorizontal,
  PanelLeft,
  Info,
  ChevronUp,
} from "lucide-react";
import { PreviewStatus } from "../types/device";
import { URLBar } from "./URLBar";
import logoUrl from "../assets/logo.png";

interface HeaderProps {
  inputValue: string;
  activeUrl: string;
  previewStatus: PreviewStatus;
  validationError: string | null;
  suggestedUrl: string | null;
  isCompareMode: boolean;
  compareCount: number;
  theme: "dark" | "light";
  isSidebarOpen: boolean;
  isInfoPanelOpen: boolean;
  totalCatalogCount: number;
  /** Phone only: when true the header is hidden below the md breakpoint. */
  isCollapsedOnMobile: boolean;
  onCollapseMobile: () => void;
  onInputChange: (val: string) => void;
  onLoadUrl: (overrideUrl?: string) => void;
  onReload: () => void;
  onOpenNewTab: () => void;
  onToggleCompareMode: () => void;
  onToggleTheme: () => void;
  onToggleSidebar: () => void;
  onToggleInfoPanel: () => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
}

const STATUS_META: Record<
  PreviewStatus,
  { label: string; dotClass: string; badgeClass: string }
> = {
  idle: {
    label: "Idle",
    dotClass: "bg-slate-400",
    badgeClass:
      "border-slate-300 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300",
  },
  loading: {
    label: "Loading",
    dotClass: "bg-sky-400 animate-ping",
    badgeClass:
      "border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-300",
  },
  ready: {
    label: "Preview Active",
    dotClass: "bg-emerald-400",
    badgeClass:
      "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  blocked: {
    label: "CSP / Frame Restricted",
    dotClass: "bg-amber-400",
    badgeClass:
      "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  error: {
    label: "Unreachable",
    dotClass: "bg-rose-400",
    badgeClass:
      "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  },
  invalid: {
    label: "Invalid URL",
    dotClass: "bg-rose-400",
    badgeClass:
      "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  },
};

export const Header: React.FC<HeaderProps> = ({
  inputValue,
  activeUrl,
  previewStatus,
  validationError,
  suggestedUrl,
  isCompareMode,
  compareCount,
  theme,
  isSidebarOpen,
  isInfoPanelOpen,
  totalCatalogCount,
  isCollapsedOnMobile,
  onCollapseMobile,
  onInputChange,
  onLoadUrl,
  onReload,
  onOpenNewTab,
  onToggleCompareMode,
  onToggleTheme,
  onToggleSidebar,
  onToggleInfoPanel,
  onOpenSettings,
  onOpenHelp,
}) => {
  const statusInfo = STATUS_META[previewStatus];

  return (
    <header
      className={`z-30 flex flex-wrap ${
        isCollapsedOnMobile ? "max-md:hidden" : ""
      } items-center justify-between gap-2.5 border-b border-slate-200 dark:border-slate-800/90 bg-white/95 dark:bg-slate-950/95 px-3 py-2 backdrop-blur shrink-0`}
    >
      {/* Left: Sidebar Toggle + Logo */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          title={isSidebarOpen ? "Hide Device Explorer" : "Show Device Explorer"}
          aria-label={isSidebarOpen ? "Hide Device Explorer" : "Show Device Explorer"}
          aria-pressed={isSidebarOpen}
          className={`p-1.5 rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 cursor-pointer ${
            isSidebarOpen
              ? "border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-300"
              : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
          }`}
        >
          <PanelLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          {/* White tile: the logo's navy strokes need a light background in dark theme */}
          <img
            src={logoUrl}
            alt="Zendri logo"
            width={32}
            height={32}
            className="h-8 w-8 shrink-0 rounded-lg bg-white object-contain ring-1 ring-slate-200 dark:ring-slate-700"
          />
          <div className="leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Responsive Device Testing Lab
              </span>
              <span className="hidden xl:inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 px-2 py-0.5 text-[10px] font-mono font-medium text-slate-600 dark:text-slate-400">
                {totalCatalogCount} presets
              </span>
            </div>
            <p className="hidden lg:block text-[11px] text-slate-500 dark:text-slate-400">
              CSS Viewport Simulator & Multi-Device Inspector
            </p>
          </div>
        </div>
      </div>

      {/* Center: URL Input Bar */}
      <div className="order-3 w-full lg:order-none lg:w-auto lg:flex-1 flex justify-center">
        <URLBar
          inputValue={inputValue}
          activeUrl={activeUrl}
          isLoading={previewStatus === "loading"}
          validationError={validationError}
          suggestedUrl={suggestedUrl}
          onInputChange={onInputChange}
          onLoadUrl={onLoadUrl}
          onReload={onReload}
          onOpenNewTab={onOpenNewTab}
        />
      </div>

      {/* Right: Status Indicator, Compare Mode, Inspector, Settings, Theme, Help */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Live Preview Status Indicator */}
        <div
          role="status"
          aria-live="polite"
          title={`Preview status: ${statusInfo.label}`}
          className={`hidden md:inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusInfo.badgeClass}`}
        >
          <span className="relative flex h-2 w-2">
            <span className={`h-2 w-2 rounded-full ${statusInfo.dotClass}`} />
          </span>
          <span>{statusInfo.label}</span>
        </div>

        {/* Compare Mode Toggle */}
        <button
          type="button"
          onClick={onToggleCompareMode}
          title={
            isCompareMode
              ? "Return to Single Device Mode"
              : "Compare multiple devices side-by-side"
          }
          aria-pressed={isCompareMode}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 cursor-pointer ${
            isCompareMode
              ? "border-indigo-500/60 bg-indigo-500/15 text-indigo-700 dark:text-indigo-200"
              : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          }`}
        >
          <Columns2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Compare</span>
          {isCompareMode && (
            <span className="rounded bg-indigo-500/30 px-1.5 py-0.2 font-mono text-[10px]">
              {compareCount}
            </span>
          )}
        </button>

        {/* Device Details Inspector Toggle */}
        {!isCompareMode && (
          <button
            type="button"
            onClick={onToggleInfoPanel}
            title={isInfoPanelOpen ? "Hide Device Info Panel" : "Show Device Info Panel"}
            aria-label={isInfoPanelOpen ? "Hide Device Info Panel" : "Show Device Info Panel"}
            aria-pressed={isInfoPanelOpen}
            className={`p-1.5 rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 cursor-pointer ${
              isInfoPanelOpen
                ? "border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-300"
                : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
            }`}
          >
            <Info className="w-4 h-4" />
          </button>
        )}

        {/* Workspace Settings */}
        <button
          type="button"
          onClick={onOpenSettings}
          title="Workspace Settings"
          aria-label="Open Workspace Settings"
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 cursor-pointer"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={onToggleTheme}
          title={theme === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme"}
          aria-label={theme === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme"}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 cursor-pointer"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>

        {/* Help Button */}
        <button
          type="button"
          onClick={onOpenHelp}
          title="Help, Shortcuts & Viewport Simulation Notes"
          aria-label="Open Help and Limitations Dialog"
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 cursor-pointer"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Hide Top Bar (phones only) */}
        <button
          type="button"
          onClick={onCollapseMobile}
          title="Hide top bar"
          aria-label="Hide top bar"
          className="md:hidden p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 cursor-pointer"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
