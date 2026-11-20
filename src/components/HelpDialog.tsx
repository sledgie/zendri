import React, { useEffect } from "react";
import { X, HelpCircle, ShieldAlert, Cpu, Keyboard } from "lucide-react";

interface HelpDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpDialog: React.FC<HelpDialogProps> = ({ isOpen, onClose }) => {
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
      aria-labelledby="help-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-xs"
    >
      <div className="flex max-h-[88vh] w-full max-w-2xl flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xl overflow-hidden text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-5 py-3.5 shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/15 text-sky-500">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="help-dialog-title"
                className="text-sm font-bold text-slate-900 dark:text-slate-100"
              >
                Responsive Device Testing Lab — Guide & Scope
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                How CSS viewport simulation works, shortcuts, and browser security notes
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Help Dialog"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto dev-scroll p-5 space-y-5 text-slate-700 dark:text-slate-300 leading-relaxed">
          {/* True CSS Viewport vs Visual Zoom */}
          <section className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              1. True CSS Viewport Simulation
            </h3>
            <p>
              Selecting any of the <strong>243 device presets</strong> (or a custom profile) sizes
              the preview <code>&lt;iframe&gt;</code> to that device&apos;s exact{" "}
              <strong>CSS viewport width and height</strong> (for example,{" "}
              <code>402 × 874 CSS px</code> on iPhone 17 Pro). Adjusting <strong>Zoom</strong>{" "}
              (Fit, 50%, 75%, 100%, 125%) changes only the outer visual scale on your monitor — CSS{" "}
              <code>@media</code> queries, <code>vw</code>/<code>vh</code> units, and{" "}
              <code>window.innerWidth</code> inside the website remain 100% accurate.
            </p>
          </section>

          {/* Important Limitations */}
          <section className="rounded-xl border border-amber-500/30 bg-amber-500/8 p-4 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-300">
              <Cpu className="w-4 h-4 shrink-0" />
              <span>2. Important Limitations (Viewport Simulator vs Hardware Emulator)</span>
            </div>
            <p>
              This application is a browser-based responsive CSS viewport testing tool,{" "}
              <strong>not a physical hardware or OS emulator</strong>. Specifically, it does not
              emulate:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 list-disc pl-5 text-[11.5px]">
              <li>Actual iOS Safari WebKit or Android Chrome engine quirks</li>
              <li>Device-specific HTTP User-Agent headers</li>
              <li>Physical touch hardware, haptics, or multi-touch gestures</li>
              <li>Mobile OS status bars, dynamic browser URL bars, or native keyboards</li>
              <li>True hardware pixel density (browser DPR overrides inside cross-origin iframes)</li>
              <li>Real mobile CPU/GPU performance, cameras, or device sensors</li>
            </ul>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Safe-area overlays and preset dimensions marked <strong>Est.</strong> are
              approximations; verify final production releases on physical target devices.
            </p>
          </section>

          {/* CSP & X-Frame-Options */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-4 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
              <ShieldAlert className="w-4 h-4 text-sky-500 shrink-0" />
              <span>3. Why Some Websites Block Embedded Previews</span>
            </div>
            <p>
              Websites that send <code>X-Frame-Options: DENY</code> / <code>SAMEORIGIN</code> or{" "}
              <code>Content-Security-Policy: frame-ancestors</code> prevent browsers from rendering
              them inside cross-origin iframes to protect against clickjacking. When testing your
              own staging or local development server (e.g., <code>http://localhost:3000</code>),
              allow framing in dev or use <strong>Open in New Tab</strong> for restricted sites.
            </p>
          </section>

          {/* Keyboard Shortcuts */}
          <section className="space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
              <Keyboard className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>4. Keyboard Shortcuts</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { key: "/", desc: "Focus Device Explorer search" },
                { key: "Alt + R", desc: "Toggle Portrait / Landscape orientation" },
                { key: "Alt + C", desc: "Switch between Single & Compare Mode" },
                { key: "Alt + F", desc: "Toggle Fullscreen workspace" },
                { key: "?", desc: "Open Help & Limitations dialog" },
                { key: "Esc", desc: "Close open dialogs or exit Fullscreen" },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 px-3 py-1.5"
                >
                  <span>{item.desc}</span>
                  <kbd className="rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-1.5 py-0.5 font-mono text-[10.5px] font-semibold">
                    {item.key}
                  </kbd>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="flex justify-end border-t border-slate-200 dark:border-slate-800 px-5 py-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-sky-500 hover:bg-sky-400 px-4 py-1.5 font-semibold text-slate-950 cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
