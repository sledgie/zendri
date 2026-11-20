import React, { useEffect, useState } from "react";
import { X, Wrench, Trash2, AlertCircle } from "lucide-react";
import {
  CutoutStyle,
  DeviceCategory,
  DevicePlatform,
  DevicePreset,
  FoldState,
  Orientation,
} from "../types/device";

interface CustomDeviceBuilderProps {
  isOpen: boolean;
  editingDevice: DevicePreset | null;
  knownManufacturers: string[];
  onClose: () => void;
  onSaveDevice: (device: DevicePreset, selectImmediately: boolean) => void;
  onDeleteDevice: (deviceId: string) => void;
}

const CATEGORIES: DeviceCategory[] = [
  "iPhone",
  "Android Phones",
  "Foldables",
  "iPad",
  "Android Tablets",
  "Generic Devices",
];

const PLATFORMS: DevicePlatform[] = [
  "Android",
  "iOS",
  "iPadOS",
  "HarmonyOS",
  "Fire OS",
  "Generic",
];

export const CustomDeviceBuilder: React.FC<CustomDeviceBuilderProps> = ({
  isOpen,
  editingDevice,
  knownManufacturers,
  onClose,
  onSaveDevice,
  onDeleteDevice,
}) => {
  const [name, setName] = useState("");
  const [manufacturer, setManufacturer] = useState("Custom");
  const [category, setCategory] = useState<DeviceCategory>("Generic Devices");
  const [platform, setPlatform] = useState<DevicePlatform>("Generic");
  const [widthInput, setWidthInput] = useState("393");
  const [heightInput, setHeightInput] = useState("852");
  const [dprInput, setDprInput] = useState("2");
  const [defaultOrientation, setDefaultOrientation] = useState<Orientation>("portrait");
  const [foldState, setFoldState] = useState<FoldState>("none");
  const [cutout, setCutout] = useState<CutoutStyle>("none");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    if (editingDevice) {
      setName(editingDevice.name);
      setManufacturer(editingDevice.manufacturer);
      setCategory(editingDevice.category);
      setPlatform(editingDevice.platform);
      setWidthInput(String(editingDevice.viewportWidth));
      setHeightInput(String(editingDevice.viewportHeight));
      setDprInput(String(editingDevice.dpr));
      setDefaultOrientation(editingDevice.defaultOrientation);
      setFoldState(editingDevice.foldState);
      setCutout(editingDevice.cutout ?? "none");
      setNotes(editingDevice.notes);
    } else {
      setName("");
      setManufacturer("Custom");
      setCategory("Generic Devices");
      setPlatform("Generic");
      setWidthInput("393");
      setHeightInput("852");
      setDprInput("2");
      setDefaultOrientation("portrait");
      setFoldState("none");
      setCutout("none");
      setNotes("");
    }
  }, [isOpen, editingDevice]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const validateAndBuild = (): DevicePreset | null => {
    const trimmedName = name.trim();
    const trimmedBrand = manufacturer.trim() || "Custom";

    if (trimmedName.length < 2 || trimmedName.length > 60) {
      setError("Device name must be between 2 and 60 characters.");
      return null;
    }

    const w = Number(widthInput);
    const h = Number(heightInput);
    const dpr = Number(dprInput);

    if (!Number.isInteger(w) || w < 200 || w > 3840) {
      setError("Viewport width must be a whole number between 200 and 3840 CSS px.");
      return null;
    }

    if (!Number.isInteger(h) || h < 200 || h > 3840) {
      setError("Viewport height must be a whole number between 200 and 3840 CSS px.");
      return null;
    }

    if (!Number.isFinite(dpr) || dpr < 0.5 || dpr > 6) {
      setError("Device Pixel Ratio (DPR) must be between 0.5 and 6.0.");
      return null;
    }

    setError(null);
    return {
      id: editingDevice?.id ?? `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: trimmedName,
      manufacturer: trimmedBrand,
      platform,
      category,
      family: "Custom Device Profile",
      viewportWidth: w,
      viewportHeight: h,
      dpr: Number(dpr.toFixed(2)),
      supportedOrientations: ["portrait", "landscape"],
      defaultOrientation,
      foldState: category === "Foldables" ? foldState : "none",
      accuracy: "estimated",
      cutout,
      notes: notes.trim() || `Custom ${w}×${h} CSS px viewport profile (@${dpr}x DPR)`,
      isCustom: true,
    };
  };

  const handleSubmit = (e: React.FormEvent, useImmediately = true) => {
    e.preventDefault();
    const built = validateAndBuild();
    if (!built) return;
    onSaveDevice(built, useImmediately);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="custom-device-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-xs"
    >
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/15 text-sky-500">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="custom-device-dialog-title"
                className="text-sm font-bold text-slate-900 dark:text-slate-100"
              >
                {editingDevice ? "Edit Custom Device Profile" : "Custom Device Builder"}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Saved locally in your browser for instant viewport testing
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Custom Device Builder"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={(e) => handleSubmit(e, true)} className="p-5 space-y-4 text-xs">
          {error && (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-rose-600 dark:text-rose-300"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Device Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Internal Kiosk Tablet"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100 focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Manufacturer *
              </label>
              <input
                type="text"
                list="manufacturer-suggestions"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                placeholder="e.g., Apple, Samsung, Custom"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100 focus:border-sky-500 focus:outline-none"
              />
              <datalist id="manufacturer-suggestions">
                {knownManufacturers.map((brand) => (
                  <option key={brand} value={brand} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Device Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DeviceCategory)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100 focus:border-sky-500 focus:outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Platform / OS
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as DevicePlatform)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100 focus:border-sky-500 focus:outline-none"
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Width, Height, DPR */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Width (CSS px) *
              </label>
              <input
                type="number"
                min={200}
                max={3840}
                step={1}
                required
                value={widthInput}
                onChange={(e) => setWidthInput(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 font-mono text-slate-900 dark:text-slate-100 focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Height (CSS px) *
              </label>
              <input
                type="number"
                min={200}
                max={3840}
                step={1}
                required
                value={heightInput}
                onChange={(e) => setHeightInput(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 font-mono text-slate-900 dark:text-slate-100 focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Pixel Ratio (DPR)
              </label>
              <input
                type="number"
                min={0.5}
                max={6}
                step={0.05}
                required
                value={dprInput}
                onChange={(e) => setDprInput(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 font-mono text-slate-900 dark:text-slate-100 focus:border-sky-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Default Orientation, Cutout, Fold State */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Default Orientation
              </label>
              <div className="grid grid-cols-2 gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-1">
                <button
                  type="button"
                  onClick={() => setDefaultOrientation("portrait")}
                  className={`rounded-md py-1 font-medium cursor-pointer ${
                    defaultOrientation === "portrait"
                      ? "bg-sky-500 text-slate-950 font-semibold"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  Portrait
                </button>
                <button
                  type="button"
                  onClick={() => setDefaultOrientation("landscape")}
                  className={`rounded-md py-1 font-medium cursor-pointer ${
                    defaultOrientation === "landscape"
                      ? "bg-sky-500 text-slate-950 font-semibold"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  Landscape
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Camera Cutout Overlay
              </label>
              <select
                value={cutout}
                onChange={(e) => setCutout(e.target.value as CutoutStyle)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100 focus:border-sky-500 focus:outline-none"
              >
                <option value="none">None</option>
                <option value="dynamic-island">Dynamic Island</option>
                <option value="notch">Notch</option>
                <option value="punch-hole">Punch-Hole Lens</option>
              </select>
            </div>
          </div>

          {category === "Foldables" && (
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Fold State
              </label>
              <select
                value={foldState}
                onChange={(e) => setFoldState(e.target.value as FoldState)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100 focus:border-sky-500 focus:outline-none"
              >
                <option value="unfolded">Unfolded (Main Inner Display)</option>
                <option value="folded">Folded (Cover Display)</option>
                <option value="none">None</option>
              </select>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional hardware or QA target notes"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100 focus:border-sky-500 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 dark:border-slate-800 pt-4">
            {editingDevice ? (
              <button
                type="button"
                onClick={() => {
                  onDeleteDevice(editingDevice.id);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-2 font-semibold text-rose-600 dark:text-rose-300 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Device</span>
              </button>
            ) : (
              <span className="text-[11px] text-slate-400">200–3840 CSS px valid range</span>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-300 dark:border-slate-700 px-3.5 py-2 font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-sky-500 hover:bg-sky-400 px-4 py-2 font-semibold text-slate-950 transition-colors cursor-pointer"
              >
                {editingDevice ? "Save & Preview" : "Create & Load Device"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
