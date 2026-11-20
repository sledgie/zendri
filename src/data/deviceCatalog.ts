import rawCatalog from "./responsive-device-catalog.json";
import {
  DeviceCatalogFile,
  DeviceCategory,
  DevicePlatform,
  DevicePreset,
  Orientation,
} from "../types/device";

export const DEVICE_CATALOG: DeviceCatalogFile = rawCatalog as DeviceCatalogFile;

export const BUILTIN_DEVICES: DevicePreset[] = DEVICE_CATALOG.devices;

export interface CategoryMeta {
  id: DeviceCategory;
  sidebarLabel: string;
  shortLabel: string;
  description: string;
}

export const CATEGORY_METADATA: CategoryMeta[] = [
  {
    id: "iPhone",
    sidebarLabel: "iPhone",
    shortLabel: "iPhone",
    description: "Apple iOS smartphones from SE to 17 Pro Max",
  },
  {
    id: "Android Phones",
    sidebarLabel: "Android Phones",
    shortLabel: "Phone",
    description: "Global Android & HarmonyOS handsets across 23+ brands",
  },
  {
    id: "Foldables",
    sidebarLabel: "Foldable Phones",
    shortLabel: "Foldable",
    description: "Book-style, clamshell, and tri-fold inner & cover displays",
  },
  {
    id: "iPad",
    sidebarLabel: "iPad",
    shortLabel: "iPad",
    description: "iPad mini, iPad, iPad Air, and iPad Pro viewports",
  },
  {
    id: "Android Tablets",
    sidebarLabel: "Android Tablets",
    shortLabel: "Tablet",
    description: "Galaxy Tab, Pixel Tablet, OnePlus Pad, Lenovo, and Fire OS",
  },
  {
    id: "Generic Devices",
    sidebarLabel: "Generic Devices",
    shortLabel: "Generic",
    description: "Vendor-neutral mobile, tablet, laptop, and desktop presets",
  },
];

export interface BreakpointQuickItem {
  width: number;
  defaultHeight: number;
  group: "phone" | "tablet" | "desktop";
  hint: string;
}

export const QUICK_BREAKPOINT_WIDTHS: BreakpointQuickItem[] = [
  { width: 320, defaultHeight: 568, group: "phone", hint: "Small / SE legacy" },
  { width: 360, defaultHeight: 780, group: "phone", hint: "Android baseline" },
  { width: 375, defaultHeight: 812, group: "phone", hint: "Compact iOS / mini" },
  { width: 390, defaultHeight: 844, group: "phone", hint: "iPhone 12–14 / 16e" },
  { width: 393, defaultHeight: 852, group: "phone", hint: "iPhone 15–16 / Pixel" },
  { width: 414, defaultHeight: 896, group: "phone", hint: "Plus / Max / XR" },
  { width: 430, defaultHeight: 932, group: "phone", hint: "Pro Max / Phablet" },
  { width: 480, defaultHeight: 854, group: "phone", hint: "Wide mobile landscape" },
  { width: 600, defaultHeight: 960, group: "tablet", hint: "7–8\" small tablet" },
  { width: 768, defaultHeight: 1024, group: "tablet", hint: "CSS md: portrait tablet" },
  { width: 820, defaultHeight: 1180, group: "tablet", hint: "iPad Air / 11\" tablet" },
  { width: 1024, defaultHeight: 768, group: "desktop", hint: "CSS lg: tablet landscape / laptop" },
  { width: 1280, defaultHeight: 800, group: "desktop", hint: "CSS xl: 13\" notebook" },
  { width: 1440, defaultHeight: 900, group: "desktop", hint: "Standard desktop canvas" },
];

export interface DeviceFilterCriteria {
  search: string;
  category: DeviceCategory | "All" | "Custom";
  manufacturer: string;
  platform: DevicePlatform | "All";
}

export function getOrientedDimensions(
  baseWidth: number,
  baseHeight: number,
  orientation: Orientation
): { width: number; height: number } {
  const shorter = Math.min(baseWidth, baseHeight);
  const longer = Math.max(baseWidth, baseHeight);
  if (orientation === "landscape") {
    return { width: longer, height: shorter };
  }
  return { width: shorter, height: longer };
}

export function formatAspectRatio(width: number, height: number): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(Math.round(width), Math.round(height));
  const rw = Math.round(width / divisor);
  const rh = Math.round(height / divisor);
  if (rw > 25 || rh > 25) {
    const ratio = (Math.max(width, height) / Math.min(width, height)).toFixed(2);
    return width >= height ? `${ratio}:1` : `1:${ratio}`;
  }
  return `${rw}:${rh}`;
}

export function getActiveCssBreakpointLabel(width: number): {
  token: string;
  range: string;
  colorClass: string;
} {
  if (width < 640) {
    return { token: "xs", range: "< 640px", colorClass: "text-sky-400 bg-sky-500/15 border-sky-500/30" };
  }
  if (width < 768) {
    return { token: "sm", range: "640–767px", colorClass: "text-cyan-400 bg-cyan-500/15 border-cyan-500/30" };
  }
  if (width < 1024) {
    return { token: "md", range: "768–1023px", colorClass: "text-indigo-400 bg-indigo-500/15 border-indigo-500/30" };
  }
  if (width < 1280) {
    return { token: "lg", range: "1024–1279px", colorClass: "text-violet-400 bg-violet-500/15 border-violet-500/30" };
  }
  if (width < 1536) {
    return { token: "xl", range: "1280–1535px", colorClass: "text-amber-400 bg-amber-500/15 border-amber-500/30" };
  }
  return { token: "2xl", range: "≥ 1536px", colorClass: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30" };
}

export function filterDevices(
  allDevices: DevicePreset[],
  criteria: DeviceFilterCriteria
): DevicePreset[] {
  const normalizedQuery = criteria.search.trim().toLowerCase();

  return allDevices.filter((device) => {
    if (criteria.category === "Custom") {
      if (!device.isCustom) return false;
    } else if (criteria.category !== "All" && device.category !== criteria.category) {
      return false;
    }

    if (criteria.manufacturer !== "All" && device.manufacturer !== criteria.manufacturer) {
      return false;
    }

    if (criteria.platform !== "All" && device.platform !== criteria.platform) {
      return false;
    }

    if (!normalizedQuery) return true;

    const compactDim1 = `${device.viewportWidth}x${device.viewportHeight}`;
    const compactDim2 = `${device.viewportWidth}×${device.viewportHeight}`;
    const searchable = [
      device.name,
      device.manufacturer,
      device.family,
      device.category,
      device.platform,
      device.foldState !== "none" ? device.foldState : "",
      String(device.viewportWidth),
      String(device.viewportHeight),
      compactDim1,
      compactDim2,
    ]
      .join(" ")
      .toLowerCase();

    const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
    return tokens.every((token) => searchable.includes(token));
  });
}

export function getManufacturersList(devices: DevicePreset[]): { name: string; count: number }[] {
  const map = new Map<string, number>();
  for (const dev of devices) {
    map.set(dev.manufacturer, (map.get(dev.manufacturer) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getPlatformsList(devices: DevicePreset[]): { name: DevicePlatform; count: number }[] {
  const map = new Map<DevicePlatform, number>();
  for (const dev of devices) {
    map.set(dev.platform, (map.get(dev.platform) ?? 0) + 1);
  }
  return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
}
