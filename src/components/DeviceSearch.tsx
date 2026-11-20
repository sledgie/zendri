import React, { useRef, useEffect } from "react";
import { Search, X } from "lucide-react";

interface DeviceSearchProps {
  value: string;
  matchCount: number;
  onChange: (value: string) => void;
}

export const DeviceSearch: React.FC<DeviceSearchProps> = ({
  value,
  matchCount,
  onChange,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA" &&
        document.activeElement?.tagName !== "SELECT"
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500"
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search model, brand, series, px… (/)"
        aria-label="Search devices by name, brand, series, or viewport dimensions"
        className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 pl-8 pr-16 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-sky-500 dark:focus:border-sky-400 focus:outline-none"
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {value ? (
          <button
            type="button"
            onClick={() => {
              onChange("");
              inputRef.current?.focus();
            }}
            title="Clear device search"
            aria-label="Clear device search"
            className="p-0.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : null}
        <span
          className="rounded bg-slate-200/80 dark:bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-600 dark:text-slate-400"
          title={`${matchCount} matching devices`}
        >
          {matchCount}
        </span>
      </div>
    </div>
  );
};
