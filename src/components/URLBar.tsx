import React, { useState, useRef, useEffect } from "react";
import {
  Globe,
  RotateCw,
  ExternalLink,
  X,
  AlertCircle,
  ChevronDown,
  Sparkles,
  ArrowRight,
  Lock,
} from "lucide-react";
import { SAMPLE_TEST_URLS } from "../utils/urlAndPreview";

interface URLBarProps {
  inputValue: string;
  activeUrl: string;
  isLoading: boolean;
  validationError: string | null;
  suggestedUrl: string | null;
  onInputChange: (val: string) => void;
  onLoadUrl: (overrideUrl?: string) => void;
  onReload: () => void;
  onOpenNewTab: () => void;
}

export const URLBar: React.FC<URLBarProps> = ({
  inputValue,
  activeUrl,
  isLoading,
  validationError,
  suggestedUrl,
  onInputChange,
  onLoadUrl,
  onReload,
  onOpenNewTab,
}) => {
  const [samplesOpen, setSamplesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSamplesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoadUrl();
  };

  const isHttps = inputValue.trim().toLowerCase().startsWith("https://");

  return (
    <div className="relative flex-1 max-w-3xl">
      <form onSubmit={handleSubmit} className="flex items-center gap-1.5" noValidate>
        <div
          className={`relative flex flex-1 items-center rounded-lg border transition-colors ${
            validationError
              ? "border-rose-500/80 bg-rose-950/20 dark:bg-rose-950/30"
              : "border-slate-300 bg-slate-100/90 focus-within:border-sky-500 focus-within:bg-white dark:border-slate-700/80 dark:bg-slate-900/90 dark:focus-within:border-sky-400 dark:focus-within:bg-slate-900"
          }`}
        >
          <span
            className="pl-3 pr-2 text-slate-400 dark:text-slate-500 flex items-center"
            aria-hidden="true"
          >
            {isHttps ? (
              <Lock className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
            ) : (
              <Globe className="w-3.5 h-3.5" />
            )}
          </span>

          <input
            ref={inputRef}
            type="url"
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="Enter website URL (e.g., https://example.com)"
            aria-label="Website URL to preview"
            aria-invalid={Boolean(validationError)}
            className="w-full bg-transparent py-1.5 pr-2 text-xs sm:text-sm font-mono text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
          />

          {inputValue && (
            <button
              type="button"
              onClick={() => {
                onInputChange("");
                inputRef.current?.focus();
              }}
              title="Clear URL input"
              aria-label="Clear URL input"
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Quick sample URLs dropdown button */}
          <div ref={dropdownRef} className="relative border-l border-slate-300 dark:border-slate-700/80">
            <button
              type="button"
              onClick={() => setSamplesOpen((prev) => !prev)}
              title="Quick sample websites"
              aria-label="Choose a sample website URL"
              aria-expanded={samplesOpen}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-r-lg"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
              <span className="hidden md:inline">Samples</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {samplesOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-1.5 w-80 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl z-50 p-1.5"
              >
                <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Quick Test Targets
                </div>
                {SAMPLE_TEST_URLS.map((sample) => (
                  <button
                    key={sample.url}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setSamplesOpen(false);
                      onInputChange(sample.url);
                      onLoadUrl(sample.url);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                        {sample.label}
                      </span>
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-600 dark:text-sky-300">
                        {sample.badge}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {sample.url}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                      {sample.description}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-slate-950 font-semibold text-xs sm:text-sm px-3.5 py-1.5 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 cursor-pointer shrink-0"
        >
          <span>Load Website</span>
          <ArrowRight className="w-3.5 h-3.5 hidden sm:inline" />
        </button>

        <button
          type="button"
          onClick={onReload}
          disabled={!activeUrl}
          title={activeUrl ? "Reload website preview" : "Load a website first to reload"}
          aria-label="Reload website preview"
          className="inline-flex items-center justify-center rounded-lg border border-slate-300 dark:border-slate-700/80 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none p-2 text-slate-700 dark:text-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 cursor-pointer shrink-0"
        >
          <RotateCw className={`w-4 h-4 ${isLoading ? "animate-spin text-sky-400" : ""}`} />
        </button>

        <button
          type="button"
          onClick={onOpenNewTab}
          disabled={!activeUrl && !inputValue.trim()}
          title="Open website in a new browser tab"
          aria-label="Open website in a new browser tab"
          className="hidden sm:inline-flex items-center justify-center rounded-lg border border-slate-300 dark:border-slate-700/80 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none p-2 text-slate-700 dark:text-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 cursor-pointer shrink-0"
        >
          <ExternalLink className="w-4 h-4" />
        </button>
      </form>

      {/* Inline validation error banner */}
      {validationError && (
        <div
          role="alert"
          className="absolute left-0 right-0 mt-1.5 z-40 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-rose-500/40 bg-rose-950/95 text-rose-100 px-3 py-2 text-xs shadow-xl backdrop-blur"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{validationError}</span>
          </div>
          {suggestedUrl && (
            <button
              type="button"
              onClick={() => {
                onInputChange(suggestedUrl);
                onLoadUrl(suggestedUrl);
              }}
              className="inline-flex items-center gap-1 rounded bg-rose-500/25 hover:bg-rose-500/40 border border-rose-400/40 px-2 py-0.5 font-mono text-[11px] font-medium text-rose-100 transition-colors cursor-pointer"
            >
              Use {suggestedUrl}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
